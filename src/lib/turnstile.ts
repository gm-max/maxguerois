/**
 * Cloudflare Turnstile, the anti-bot gate in front of /api/subscribe.
 *
 * WHY: from November 2026 the newsletter took a run of signups with the signature of
 * automation — submissions seconds apart, the same handful of IPs and user agents.
 * The honeypot catches a bot that fills every input; the rate limiter caps one IP at
 * 5 attempts an hour. Neither stops a client that leaves the hidden field alone and
 * rotates addresses, which is what we saw. Turnstile asks the browser to prove it is
 * a browser, which is the one question the other two never ask.
 *
 * It is NOT a promise that no bot gets through. A determined operator can farm tokens
 * with a real browser. The claim is narrower and still worth the code: it raises the
 * cost of the cheap, high-volume case, and it does so without asking a human to solve
 * anything.
 *
 * TWO KEYS, AND THEY MUST ARRIVE TOGETHER:
 *   PUBLIC_TURNSTILE_SITE_KEY — public, read AT BUILD TIME by the client bundle
 *   TURNSTILE_SECRET_KEY      — secret, read at REQUEST time by this file
 *
 * That asymmetry is the whole trap. The site key is frozen into the HTML when Vercel
 * builds; the secret is read per request. Set one without the other and you get a
 * half-armed site: a front end minting tokens nobody can check, or a server demanding
 * tokens nobody can mint — the second one rejects every signup on the site. So the
 * protection is ACTIVE only when BOTH are present, and a half-configured deployment
 * says so loudly rather than guessing (see turnstileState and the comment on
 * 'partial'). Set both variables in Vercel BEFORE merging the deploy that introduces
 * them, and the partial state never happens in production.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Bounded like every other outbound call in this codebase (Resend uses 5s). The
 * budget matters more here than elsewhere: this call sits in front of the signup, so
 * its timeout is latency a real visitor waits through before anything is stored.
 */
const TIMEOUT_MS = 5000;

/** The form field the widget's token travels in. Cloudflare's default name. */
export const TOKEN_FIELD = 'cf-turnstile-response';

/**
 * Hostnames siteverify may report back as the page that served the challenge.
 *
 * Cloudflare returns the hostname it saw and its docs say to check it ("Validate the
 * action and hostname when specified"). Checking it is what stops a token minted on
 * someone else's site from being spent here, which is the attack the widget's own
 * hostname allowlist cannot cover alone.
 *
 * Overridable because a Vercel preview is served from an ephemeral *.vercel.app that
 * is not in the production widget's allowlist, and because Cloudflare's test secrets
 * always answer `example.com`. Production needs no override.
 */
const DEFAULT_ALLOWED_HOSTNAMES = ['maxguerois.com', 'www.maxguerois.com'];

function readEnv(name: string): string | undefined {
  const v = import.meta.env[name] ?? process.env[name];
  return v ? String(v) : undefined;
}

function allowedHostnames(): string[] {
  const raw = readEnv('TURNSTILE_ALLOWED_HOSTNAMES');
  if (!raw) return DEFAULT_ALLOWED_HOSTNAMES;
  return raw
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * 'active'  — both keys present. Tokens are demanded and verified, fail-closed.
 * 'off'     — neither key present. The endpoint behaves exactly as it did before this
 *             file existed: honeypot and rate limiter, no token required. This is the
 *             state every test and every local `npm run dev` runs in.
 * 'partial' — exactly one key present, which is always a deployment mistake.
 */
export type TurnstileState = 'active' | 'off' | 'partial';

export function turnstileState(): TurnstileState {
  const site = Boolean(readEnv('PUBLIC_TURNSTILE_SITE_KEY'));
  const secret = Boolean(readEnv('TURNSTILE_SECRET_KEY'));
  if (site && secret) return 'active';
  if (!site && !secret) return 'off';
  return 'partial';
}

/**
 * Why a half-configured deployment does NOT enforce.
 *
 * With only the secret set, the front end mints no token and enforcing would answer
 * every single visitor with a refusal: a one-variable slip takes the newsletter down
 * completely. With only the site key set, there is nothing to verify a token against,
 * so enforcing would do the same. Either way the honest fallback is the behaviour the
 * endpoint had before Turnstile — the honeypot and the rate limiter still run — and
 * the mistake is made loud instead of fatal.
 *
 * Loud, not silent: this logs on every request it affects, and /api/health reports
 * `turnstile: "partial"` so the VPS watcher sees it within three hours. It is still a
 * gap, and the reason the activation order in the PR is "both variables in Vercel
 * first, merge second".
 */
export function logPartialConfig(): void {
  const which = readEnv('PUBLIC_TURNSTILE_SITE_KEY') ? 'TURNSTILE_SECRET_KEY' : 'PUBLIC_TURNSTILE_SITE_KEY';
  console.error(
    `turnstile: HALF CONFIGURED — ${which} is missing, so bot protection is NOT active. ` +
      'Signups are allowed through on the honeypot and rate limiter alone. Set both ' +
      'PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY and redeploy.',
  );
}

/**
 * 'captcha_required'    — no token in the request. A no-JS post, or a direct POST.
 * 'captcha_failed'      — Cloudflare says this token is bad: malformed, expired,
 *                         already spent, or solved on another hostname. The visitor
 *                         retries and gets a fresh challenge.
 * 'captcha_unavailable' — we could not get an answer, or the answer says our own
 *                         configuration is wrong. Refused anyway (see below).
 */
export type TurnstileFailure = 'captcha_required' | 'captcha_failed' | 'captcha_unavailable';
export type TurnstileResult = { ok: true } | { ok: false; code: TurnstileFailure };

/**
 * Cloudflare error codes that mean "the problem is on our side or theirs", not "this
 * token is bad". Separated so the visitor-facing message can say "try again" honestly
 * and so the log line points at the right thing. Everything else is a bad token.
 */
const OUR_FAULT_CODES = new Set([
  'internal-error',       // documented as retryable
  'bad-request',          // malformed request: our bug
  'missing-input-secret', // our configuration
  'invalid-input-secret', // our configuration, or a rotated key
]);

/**
 * Verify one token with Cloudflare, and FAIL CLOSED.
 *
 * Fail-closed is the deliberate inversion of how the rate limiter next door behaves.
 * That one fails OPEN because a database hiccup must not cost a real signup, and a
 * tolerated abusive signup is cheaper than a lost reader. This one cannot use the
 * same reasoning: a gate that opens whenever Cloudflare is slow is a gate anyone can
 * open by making Cloudflare slow, and a flood is exactly the thing it was added to
 * stop. So a timeout, a network error, an HTTP error and an unparseable body are all
 * refusals. The price is real and worth naming: an outage at Cloudflare stops signups
 * on this site until it ends, or until the two env vars are removed.
 *
 * NEVER LOGS the token or the secret. The token is a short-lived credential and the
 * log is not the place for it; `error-codes` and the hostname are enough to diagnose.
 */
export async function verifyTurnstile(
  token: string,
  remoteIp: string | null,
): Promise<TurnstileResult> {
  if (!token) return { ok: false, code: 'captcha_required' };

  const secret = readEnv('TURNSTILE_SECRET_KEY');
  if (!secret) return { ok: false, code: 'captcha_unavailable' };

  const body = new URLSearchParams({ secret, response: token });
  // Optional, and only when it is a real address: clientIp() answers the literal
  // string 'unknown' when no trusted header is present, and sending that would have
  // Cloudflare judge a token against a hostname-shaped non-address.
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  let data: {
    success?: boolean;
    hostname?: string;
    'error-codes'?: string[];
  };
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`turnstile: siteverify answered HTTP ${res.status} — refusing`);
      return { ok: false, code: 'captcha_unavailable' };
    }
    data = await res.json();
  } catch (e) {
    // Covers the AbortSignal timeout and any transport failure. The message is
    // ours, never the request body.
    console.error(
      'turnstile: siteverify unreachable — refusing:',
      e instanceof Error ? e.message : String(e),
    );
    return { ok: false, code: 'captcha_unavailable' };
  }

  if (data?.success !== true) {
    const codes = Array.isArray(data?.['error-codes']) ? data['error-codes'] : [];
    const ourFault = codes.some((c) => OUR_FAULT_CODES.has(c));
    console.error(`turnstile: token rejected [${codes.join(',') || 'no code'}]`);
    return { ok: false, code: ourFault ? 'captcha_unavailable' : 'captcha_failed' };
  }

  // Only when Cloudflare told us one, per its own "when specified" wording. A
  // successful verification against a test secret carries `example.com`.
  if (data.hostname) {
    const seen = data.hostname.toLowerCase();
    if (!allowedHostnames().includes(seen)) {
      console.error(`turnstile: token solved on an unexpected hostname (${seen}) — refusing`);
      return { ok: false, code: 'captcha_failed' };
    }
  }

  return { ok: true };
}
