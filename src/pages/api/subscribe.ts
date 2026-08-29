import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { buildUnsubscribeUrl } from './unsubscribe';
import { WELCOME_SUBJECT } from '../../lib/welcome-email';

// The one on-demand route on this site. Everything else prerenders.
export const prerender = false;

const RATE_LIMIT_MAX = 5;          // attempts per IP
const RATE_LIMIT_WINDOW_MIN = 60;
const RESEND_TIMEOUT_MS = 5000;

// D16: not secret, both public in the sense that anyone receiving mail from this
// address already sees it. Kept as consts rather than env vars because they aren't
// deployment config — changing them is a copy decision, not an infra one.
// hi@, not bonjour@. bonjour@ was invented during the D16 swap and never checked
// against Cloudflare Email Routing, so a reply to the welcome mail may have had
// nowhere to land, while the mail itself says "répondez à ce mail. Je lis tout."
// hi@ is the address the site publishes on the homepage and in security.txt, so it
// is known to reach him. One address, and the promise in the copy is now true.
const RESEND_FROM = 'Max Guérois <hi@maxguerois.com>';


const MAX_EMAIL = 254;
const MAX_FIELD = 200;

// Where a no-JS form post lands afterwards. A WHITELIST, not a URL the caller
// supplies: this used to be `new URL(params.redirect, origin)`, and that function
// lets an absolute value win over the base, so ?redirect=https://evil.com sent the
// visitor off-site from a link that still read maxguerois.com. Verified, both for
// `https://…` and for the protocol-relative `//…` form. Keys in, paths out, no
// caller-controlled destination anywhere.
const RETURN_PATHS: Record<string, string> = {
  // Thank-you pages, NOT the pages the form lives on. Every page carrying
  // NewsletterEmbed is prerendered and therefore cannot read `?ok=1` at request time,
  // so redirecting a no-JS visitor back there showed them a page identical to the one
  // they left. /fr/merci and /thanks are `prerender = false` and can render the result.
  fr: '/fr/merci',
  en: '/thanks',
  // The Instagram funnel landing. Without this key a no-JS signup from
  // /fr/peptides lands back on the blog archive, which is not where the
  // visitor was and does not carry the confirmation.
  'fr-peptides': '/peptides',
};
const DEFAULT_LANG = 'fr';

// Deliberately loose. The job is to reject typos and obvious junk, not to
// adjudicate RFC 5322. Resend validates for real downstream; a bad address there
// costs a bounce, not a lost signup, because Supabase already holds the row.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function env(name: string): string {
  const v = import.meta.env[name] ?? process.env[name];
  if (!v) throw new Error(`missing env ${name}`);
  return v;
}

/**
 * Same lookup, but absence is a valid answer.
 *
 * Used only by the alerting path, which runs INSIDE the catch that handles a send
 * failure. `env()` throwing there would lose the `sync_error` write that makes a
 * later replay possible, so a missing alerting credential must degrade to silence,
 * never to a second exception.
 */
function optionalEnv(name: string): string | undefined {
  const v = import.meta.env[name] ?? process.env[name];
  return v ? String(v) : undefined;
}

/**
 * The canonical host, not the machine that served the request.
 *
 * `url.origin` is whatever answered the POST. On a Vercel preview that is an
 * ephemeral `*.vercel.app` that disappears in days — and the unsubscribe link built
 * from it goes out in a REAL inbox, on a legal obligation, already dead. Astro fills
 * `SITE` from `site:` in astro.config.mjs, which is known at build time and correct
 * everywhere.
 */
const SITE_ORIGIN = optionalEnv('SITE') ?? 'https://maxguerois.com';

const TELEGRAM_TIMEOUT_MS = 3000;

/**
 * Page on the FIRST unsent signup of an outage. Never throws.
 *
 * The catch at the call site answers 200 to the visitor even when Resend fails, so a
 * provider outage can never lose a signup. That is the right trade, and its price is
 * a failure mode that LOOKS like success: the visitor reads "le guide arrive" and
 * nothing ever comes. Before this function, nothing surfaced it.
 *
 * Flood guard without a timer and without guessing at columns we don't own: count
 * the rows still waiting to sync (`sync_error` set, `synced_at` null). If this row is
 * the only one, it is the first failure of the outage and it pages. Every later
 * failure in the same outage sees a count above 1 and stays quiet. Draining the
 * backlog resets the counter, so the NEXT outage pages again.
 */
async function alertFirstSendFailure(
  supabase: ReturnType<typeof createClient>,
  email: string,
  reason: string,
): Promise<void> {
  try {
    const { count, error } = await supabase
      .from('mg_subscribers')
      .select('email', { count: 'exact', head: true })
      .not('sync_error', 'is', null)
      .is('synced_at', null);
    if (error || (count ?? 0) > 1) return;

    await sendTelegram(
      `maxguerois.com — une inscription n'a pas ete envoyee.\n\n` +
        `Email enregistre dans Supabase, envoi Resend en echec.\n` +
        `Raison : ${reason.slice(0, 200)}\n\n` +
        `Le visiteur a vu "c'est fait" et ne recevra rien tant que ce n'est pas corrige.`,
    );
  } catch (e) {
    // Alerting must never be the reason a request fails.
    console.error('telegram alert failed', e instanceof Error ? e.message : String(e));
  }
}

/**
 * Post one line to the admin chat. NEVER throws, and never fails a request.
 *
 * Awaited by every caller, deliberately. Astro has no equivalent to `after()`, and an
 * unawaited call is killed by the serverless teardown: in ouros-reddit-scam that cost
 * 5 audience adds out of 20 and 13 welcome emails out of 20, at random.
 */
async function sendTelegram(text: string): Promise<void> {
  const token = optionalEnv('TELEGRAM_BOT_TOKEN');
  const chat = optionalEnv('TELEGRAM_ADMIN_CHAT_ID');
  if (!token || !chat) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
    // A bad token or a rate-limited bot answers 401/429, and `fetch` RESOLVES. Without
    // this check the send reports success while reaching nobody — the exact silent
    // outage it exists to surface, one layer up.
    if (!res.ok) {
      console.error(`telegram send rejected ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
  } catch (e) {
    console.error('telegram send failed', e instanceof Error ? e.message : String(e));
  }
}

/**
 * Tell Max, in real time, that someone just subscribed.
 *
 * ONE LINE, ALWAYS THE SAME LINE. Max asked for exactly this and the uniformity is
 * the decision, not an oversight: the message does NOT say whether the welcome email
 * actually left. Do not "improve" it by appending a status.
 *
 * What that costs, so the next reader can weigh it rather than rediscover it: during
 * a Resend outage these lines keep scrolling by looking perfectly healthy while nobody
 * receives anything. Only the FIRST failure of an outage pages, via
 * alertFirstSendFailure; failures 2..N live in mg_subscribers.sync_error and nowhere
 * else. Max accepted that on 2026-08-29 in exchange for a line he can read at a glance.
 *
 * It fires on every stored signup, including one whose Resend push failed, because the
 * row is in Supabase either way and the person is therefore subscribed either way.
 *
 * It says "new subscriber" even for someone resubscribing: the upsert updates on
 * conflict, so a returning subscriber lands here too. Telling them apart costs a query
 * whose count collides with the outage alert's in the test harness, and the daily card
 * already carries the real total.
 *
 * The destination needs no configuring. TELEGRAM_BOT_TOKEN here is byte-identical to
 * max-ai's `ouros-lab` agent bot, and TELEGRAM_ADMIN_CHAT_ID to its chat: verified by
 * fingerprint on 2026-08-29. This already posts to the Ouros Lab channel, from
 * @ouros_lab_bot, the same place the morning card lands.
 */
async function notifySignup(email: string): Promise<void> {
  await sendTelegram(`1 new subscriber to Max's newsletter: ${email}`);
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

/**
 * The client IP, from the most trustworthy header available.
 *
 * `x-forwarded-for` is a LIST, and its leftmost entry is whatever the caller sent.
 * Keying the rate limiter off it means an attacker rotates a spoofed first hop and
 * the 5-per-hour limit never fires: unbounded Supabase writes, unbounded Resend and
 * Telegram pressure. Vercel sets `x-vercel-forwarded-for` and `x-real-ip` at its own
 * edge, after stripping what the client claimed, so those are trustworthy here.
 * The XFF fallback keeps local dev and any non-Vercel host working, and is the only
 * branch where the old spoofing concern still applies.
 */
function clientIp(request: Request): string {
  const trusted =
    request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-real-ip');
  if (trusted) return trusted.split(',')[0].trim();
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : '').trim() || 'unknown';
}

/**
 * One authenticated call to the Resend REST API, timed out the same way every other
 * outbound call in this file is. No `resend` SDK dependency: this project already
 * talks to a third party with bare `fetch` (see the beehiiv-era call this replaced),
 * and adding a client library for four endpoints isn't worth the extra surface.
 */
async function resendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    },
    signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
  });
}

async function resendOrThrow(step: string, res: Response, okStatuses: number[] = []): Promise<void> {
  if (res.ok || okStatuses.includes(res.status)) return;
  throw new Error(`resend ${step} ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

/**
 * Push to Resend, the send layer (D16 — replaces beehiiv).
 *
 * AWAITED on purpose, every step. In ouros-reddit-scam the equivalent calls were fired
 * without await and the serverless runtime tore the function down as soon as the
 * response returned, killing whatever request was still in flight: 5 of 20 audience
 * adds and 13 of 20 welcome emails vanished, at random and independently. Next fixed
 * it with `after()`. Astro has no equivalent, so the guarantee here comes from
 * awaiting with a timeout instead. Supabase already holds the email by this point, so
 * a failure costs latency and a `sync_error` row, never a lost signup — this function
 * throwing never fails the caller's insert (see the try/catch around its call site).
 *
 * Four steps, matching the brief exactly so each is independently testable and each
 * failure is attributable to one Resend endpoint:
 *   1. create (or, on 409, reactivate) the contact
 *   2. add it to the segment
 *   3. opt it in on the topic — the topic's default is opt_out, so skipping this
 *      step means the person is in Resend but will never receive anything
 *   4. send the welcome email
 */
async function pushToResend(email: string, origin: string): Promise<void> {
  const topicId = env('RESEND_TOPIC_ID');
  const segmentId = env('RESEND_SEGMENT_ID');

  // 1. Create the contact. A 409 means it already exists — this is the reactivation
  // path. beehiiv's `reactivate_existing: true` has no direct Resend equivalent; the
  // analogue is unsubscribed:false here plus the explicit topic opt-in in step 3. A
  // fresh form submission is fresh consent, so clearing unsubscribed is correct.
  const createRes = await resendFetch('/contacts', {
    method: 'POST',
    body: JSON.stringify({ email, unsubscribed: false }),
  });
  if (createRes.status === 409) {
    await resendOrThrow(
      'update-contact',
      await resendFetch(`/contacts/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        body: JSON.stringify({ unsubscribed: false }),
      }),
    );
  } else {
    await resendOrThrow('create-contact', createRes);
  }

  // 2. Segment membership. 409 (already a member) is fine.
  await resendOrThrow(
    'add-to-segment',
    await resendFetch(
      `/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segmentId)}`,
      { method: 'POST' },
    ),
    [409],
  );

  // 3. Explicit opt-in on the topic.
  await resendOrThrow(
    'update-contact-topics',
    await resendFetch(`/contacts/${encodeURIComponent(email)}/topics`, {
      method: 'PATCH',
      // A BARE ARRAY, not { topics: [...] }. The Node SDK wraps it in an object; the
      // raw HTTP endpoint does not, and a wrapped body 400s. Verified against
      // resend.com/docs/api-reference/contacts/update-contact-topics. This one line
      // silently broke the whole flow: the opt-in threw, so nobody was ever subscribed
      // to the topic AND the welcome email below never even ran.
      body: JSON.stringify([{ id: topicId, subscription: 'opt_in' }]),
    }),
  );

  // 4. Welcome email, rendered from a Resend TEMPLATE rather than from HTML in this
  // file. The copy then lives in Resend's dashboard and Max can edit it without a
  // deploy, which for a text he revises constantly is the whole point.
  //
  // Why not a Resend AUTOMATION, which is the more obvious way to get that: measured
  // twice, an automation-sent email carries NO List-Unsubscribe. Its step config has
  // no field for headers, and adding one anyway is accepted by the API and then
  // silently ignored — the DKIM h= list on both test sends proves the header never
  // left. POST /emails takes `template` AND `headers` in the same request, so this
  // keeps the editable copy without giving up the header. The automation still exists,
  // disabled, and is the right tool the day a delayed follow-up is wanted.
  const unsubscribeUrl = buildUnsubscribeUrl(email, origin);
  await resendOrThrow(
    'send-welcome',
    await resendFetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        subject: WELCOME_SUBJECT,
        template: {
          id: env('RESEND_WELCOME_TEMPLATE_ID'),
          variables: { UNSUBSCRIBE_URL: unsubscribeUrl },
        },
        // Gmail and Yahoo have required these of bulk senders since Feb 2024. Without
        // the pair, the mail client shows no unsubscribe affordance, people press
        // "spam" instead, and the domain's reputation goes with it. One-Click is honest
        // here because /api/unsubscribe exports POST as well as GET.
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    }),
  );
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
  // set, Resend was never told to reactivate, and they still got a thank-you and
  // never heard from us again — the one visitor profile the system lost completely,
  // and the most motivated one. Submitting the form is fresh consent, so clearing
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
        // Reset the sync state on EVERY fresh signup, not just on insert.
        //
        // Without these two, a returning subscriber whose row was already synced
        // kept its old `synced_at` when the new send failed. The alert's backlog
        // predicate is `sync_error IS NOT NULL AND synced_at IS NULL`, so that row
        // was invisible to it — and to any replay job built on the same predicate.
        // The person got a 200, received nothing, and nothing ever paged. Found by
        // an outside review; it silently disarmed the alert added the same day.
        synced_at: null,
        sync_error: null,
        ...utm,
      },
      { onConflict: 'email' },
    );
  if (insErr) {
    console.error('mg_subscribers upsert failed', insErr);
    return reply(request, url, 500, { ok: false, error: 'store_failed' });
  }

  const markSync = async (patch: {
    synced_at?: string | null;
    sync_error: string | null;
  }) => {
    const { error } = await supabase.from('mg_subscribers').update(patch).eq('email', email);
    // A failed status write is the quietest failure in this file: the send state
    // stops matching reality, and every downstream decision (alerting, replay) reads
    // the stale value with no way to know.
    if (error) console.error('mg_subscribers sync-status write failed', error);
  };

  try {
    await pushToResend(email, SITE_ORIGIN);
    await markSync({ synced_at: new Date().toISOString(), sync_error: null });
  } catch (e) {
    // Never fails the signup. sync_error + a NULL synced_at leave the row visible
    // to the partial index, so a replay can pick it up later.
    const msg = e instanceof Error ? e.message : String(e);
    console.error('resend sync failed', msg);
    // Both fields, explicitly: the upsert above already nulled them, but a future
    // caller of markSync must not have to know that to stay consistent.
    await markSync({ synced_at: null, sync_error: msg.slice(0, 500) });
    await alertFirstSendFailure(supabase, email, msg);
  }

  // After the sync rather than before, so a Telegram outage can never delay the
  // welcome email. Awaited, like every third-party call in this file, and unable to
  // throw, so it can never cost a signup either.
  await notifySignup(email);

  return reply(request, url, 200, { ok: true });
};
