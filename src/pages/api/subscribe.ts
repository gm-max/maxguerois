import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

// The one on-demand route on this site. Everything else prerenders.
export const prerender = false;

const RATE_LIMIT_MAX = 5;          // attempts per IP
const RATE_LIMIT_WINDOW_MIN = 60;
const BEEHIIV_TIMEOUT_MS = 5000;

const MAX_EMAIL = 254;
const MAX_FIELD = 200;

// Where a no-JS form post lands afterwards. A WHITELIST, not a URL the caller
// supplies: this used to be `new URL(params.redirect, origin)`, and that function
// lets an absolute value win over the base, so ?redirect=https://evil.com sent the
// visitor off-site from a link that still read maxguerois.com. Verified, both for
// `https://…` and for the protocol-relative `//…` form. Keys in, paths out, no
// caller-controlled destination anywhere.
const RETURN_PATHS: Record<string, string> = {
  fr: '/fr/newsletter',
  en: '/newsletter',
};
const DEFAULT_LANG = 'fr';

// Deliberately loose. The job is to reject typos and obvious junk, not to
// adjudicate RFC 5322. beehiiv is the real validator downstream.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function env(name: string): string {
  const v = import.meta.env[name] ?? process.env[name];
  if (!v) throw new Error(`missing env ${name}`);
  return v;
}

/**
 * Read one submitted field as bounded text.
 *
 * Every field goes through here, never straight off the parsed body. JSON can carry
 * a number, an array or an object, and `(fields.email ?? '').trim()` threw an
 * uncaught TypeError on `{"email": 123}` — a raw 500 where a clean 400 already
 * existed one line away. The cap matters for the same reason: only `email` was
 * bounded, so utm_campaign accepted megabytes straight into a text column.
 */
function field(raw: unknown, max = MAX_FIELD): string {
  return typeof raw === 'string' ? raw.trim().slice(0, max) : '';
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

function reply(
  request: Request,
  url: URL,
  status: number,
  body: { ok: boolean; error?: string },
) {
  // Native form posts (no JS) get a redirect so the browser lands on a real page.
  // fetch() callers ask for JSON and stay put.
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }
  const lang = url.searchParams.get('lang') ?? '';
  const back = new URL(RETURN_PATHS[lang] ?? RETURN_PATHS[DEFAULT_LANG], url.origin);
  back.searchParams.set(body.ok ? 'ok' : 'error', body.ok ? '1' : (body.error ?? 'error'));
  return new Response(null, { status: 303, headers: { Location: back.toString() } });
}

export const POST: APIRoute = async ({ request, url }) => {
  let raw: Record<string, unknown> = {};
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const parsed = await request.json();
      raw = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } else {
      for (const [k, v] of await request.formData()) raw[k] = String(v);
    }
  } catch {
    return reply(request, url, 400, { ok: false, error: 'bad_request' });
  }

  // Honeypot. A real person never fills a field they cannot see; a bot fills
  // every input it finds. Answer 200 so the bot has nothing to learn from.
  if (field(raw.website) !== '') {
    return reply(request, url, 200, { ok: true });
  }

  const email = field(raw.email, MAX_EMAIL).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return reply(request, url, 400, { ok: false, error: 'invalid_email' });
  }

  const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const ipHash = hashIp(clientIp(request), env('IP_HASH_SALT'));

  // Rate limit on ATTEMPTS, not on stored rows: counting mg_subscribers would let
  // an attacker retry forever with the same address, since a repeat write adds no row.
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60_000).toISOString();
  const { count, error: rlReadErr } = await supabase
    .from('mg_rate_limit_hits')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);

  // This limiter FAILS OPEN, deliberately: on this site a lost real signup costs more
  // than a tolerated abusive one, so a database hiccup must not reject a visitor.
  // The price of that choice is that it can stop working without anything breaking,
  // which is why both halves are logged loudly below. An earlier comment here claimed
  // the opposite of what the code does, which is worse than no comment at all.
  if (rlReadErr) {
    console.error('rate-limit read failed — allowing through', rlReadErr);
  } else if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return reply(request, url, 429, { ok: false, error: 'rate_limited' });
  }

  // A silent failure here is the dangerous one: nothing breaks, signups keep working,
  // and the counter simply stays at zero forever, so the limit never fires again.
  const { error: rlWriteErr } = await supabase
    .from('mg_rate_limit_hits')
    .insert({ ip_hash: ipHash });
  if (rlWriteErr) {
    console.error('rate-limit ledger write failed — limiter is blind until fixed', rlWriteErr);
  }

  const utm = {
    utm_source: field(raw.utm_source) || 'site',
    utm_medium: field(raw.utm_medium) || null,
    utm_campaign: field(raw.utm_campaign) || null,
  };

  // Supabase is the source of truth and this write is blocking: if it fails, the
  // visitor is told, rather than being silently dropped after seeing a thank-you.
  //
  // This UPDATES on conflict rather than ignoring it. With ignoreDuplicates the row
  // of someone who had unsubscribed was left untouched, so unsubscribed_at stayed
  // set, beehiiv was told not to reactivate, and they still got a thank-you and never
  // heard from us again — the one visitor profile the system lost completely, and the
  // most motivated one. Submitting the form is fresh consent, so clearing
  // unsubscribed_at is the correct reading of what they just did.
  // created_at is absent from the payload on purpose: it keeps its original value.
  const { error: insErr } = await supabase
    .from('mg_subscribers')
    .upsert(
      {
        email,
        ip_hash: ipHash,
        source: field(raw.source) || 'site',
        unsubscribed_at: null,
        ...utm,
      },
      { onConflict: 'email' },
    );
  if (insErr) {
    console.error('mg_subscribers upsert failed', insErr);
    return reply(request, url, 500, { ok: false, error: 'store_failed' });
  }

  const markSync = (patch: { synced_at?: string; sync_error: string | null }) =>
    supabase.from('mg_subscribers').update(patch).eq('email', email);

  try {
    await pushToBeehiiv({
      email,
      reactivate_existing: true,       // see the upsert note: a re-signup is consent
      send_welcome_email: true,        // carries the gated peptides guide
      referring_site: request.headers.get('referer') ?? undefined,
      ...Object.fromEntries(Object.entries(utm).filter(([, v]) => v)),
    });
    await markSync({ synced_at: new Date().toISOString(), sync_error: null });
  } catch (e) {
    // Never fails the signup. sync_error + a NULL synced_at leave the row visible
    // to the partial index, so a replay can pick it up later.
    const msg = e instanceof Error ? e.message : String(e);
    console.error('beehiiv sync failed', msg);
    await markSync({ sync_error: msg.slice(0, 500) });
  }

  return reply(request, url, 200, { ok: true });
};
