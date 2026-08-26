import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

// The one on-demand route on this site. Everything else prerenders.
export const prerender = false;

const RATE_LIMIT_MAX = 5;          // attempts per IP
const RATE_LIMIT_WINDOW_MIN = 60;
const BEEHIIV_TIMEOUT_MS = 5000;

// Deliberately loose. The job is to reject typos and obvious junk, not to
// adjudicate RFC 5322. beehiiv is the real validator downstream.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function env(name: string): string {
  const v = import.meta.env[name] ?? process.env[name];
  if (!v) throw new Error(`missing env ${name}`);
  return v;
}

function hashIp(ip: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : '').trim() || 'unknown';
}

/**
 * Push to beehiiv, the send layer.
 *
 * AWAITED on purpose. In ouros-reddit-scam the equivalent calls were fired without
 * await and the serverless runtime tore the function down as soon as the response
 * returned, killing whatever request was still in flight: 5 of 20 audience adds and
 * 13 of 20 welcome emails vanished, at random and independently. Next fixed it with
 * `after()`. Astro has no equivalent, so the guarantee here comes from awaiting with
 * a timeout instead. Supabase already holds the email by this point, so a failure
 * costs latency and a `sync_error` row, never a lost signup.
 */
async function pushToBeehiiv(payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${env('BEEHIIV_PUBLICATION_ID')}/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env('BEEHIIV_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(BEEHIIV_TIMEOUT_MS),
    },
  );
  if (!res.ok) {
    throw new Error(`beehiiv ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

function reply(request: Request, url: URL, status: number, body: { ok: boolean; error?: string }) {
  // Native form posts (no JS) get a redirect so the browser lands on a real page.
  // fetch() callers ask for JSON and stay put.
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }
  const back = new URL(url.searchParams.get('redirect') ?? '/fr/newsletter', url.origin);
  back.searchParams.set(body.ok ? 'ok' : 'error', body.ok ? '1' : (body.error ?? 'error'));
  return new Response(null, { status: 303, headers: { Location: back.toString() } });
}

export const POST: APIRoute = async ({ request, url }) => {
  let fields: Record<string, string> = {};
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      fields = await request.json();
    } else {
      for (const [k, v] of await request.formData()) fields[k] = String(v);
    }
  } catch {
    return reply(request, url, 400, { ok: false, error: 'bad_request' });
  }

  // Honeypot. A real person never fills a field they cannot see; a bot fills
  // every input it finds. Answer 200 so the bot has nothing to learn from.
  if ((fields.website ?? '').trim() !== '') {
    return reply(request, url, 200, { ok: true });
  }

  const email = (fields.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return reply(request, url, 400, { ok: false, error: 'invalid_email' });
  }

  const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const ipHash = hashIp(clientIp(request), env('IP_HASH_SALT'));

  // Rate limit on ATTEMPTS, not on stored rows: counting mg_subscribers would let
  // an attacker retry forever with the same address, since a repeat upsert adds no row.
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60_000).toISOString();
  const { count, error: rlErr } = await supabase
    .from('mg_rate_limit_hits')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);

  // Fail closed only on a real count. A broken limiter must not become an open door,
  // but it must not block every signup either, so an errored read is allowed through.
  if (!rlErr && (count ?? 0) >= RATE_LIMIT_MAX) {
    return reply(request, url, 429, { ok: false, error: 'rate_limited' });
  }
  await supabase.from('mg_rate_limit_hits').insert({ ip_hash: ipHash });

  const utm = {
    utm_source: fields.utm_source || 'site',
    utm_medium: fields.utm_medium || null,
    utm_campaign: fields.utm_campaign || null,
  };

  // Supabase is the source of truth and this write is blocking: if it fails, the
  // visitor is told, rather than being silently dropped after seeing a thank-you.
  const { error: insErr } = await supabase
    .from('mg_subscribers')
    .upsert(
      { email, ip_hash: ipHash, source: fields.source || 'site', ...utm },
      { onConflict: 'email', ignoreDuplicates: true },
    );
  if (insErr) {
    console.error('mg_subscribers upsert failed', insErr);
    return reply(request, url, 500, { ok: false, error: 'store_failed' });
  }

  try {
    await pushToBeehiiv({
      email,
      reactivate_existing: false,
      send_welcome_email: true,        // carries the gated peptides guide
      referring_site: request.headers.get('referer') ?? undefined,
      ...Object.fromEntries(Object.entries(utm).filter(([, v]) => v)),
    });
    await supabase.from('mg_subscribers').update({ synced_at: new Date().toISOString(), sync_error: null }).eq('email', email);
  } catch (e) {
    // Never fails the signup. sync_error + a NULL synced_at leave the row visible
    // to the partial index, so a replay can pick it up later.
    const msg = e instanceof Error ? e.message : String(e);
    console.error('beehiiv sync failed', msg);
    await supabase.from('mg_subscribers').update({ sync_error: msg.slice(0, 500) }).eq('email', email);
  }

  return reply(request, url, 200, { ok: true });
};
