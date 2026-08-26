import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'node:crypto';

// The endpoint that makes `unsubscribed_at` real (D16). Everything else prerenders.
export const prerender = false;

const RESEND_TIMEOUT_MS = 5000;
const MAX_EMAIL = 254;

function env(name: string): string {
  const v = import.meta.env[name] ?? process.env[name];
  if (!v) throw new Error(`missing env ${name}`);
  return v;
}

/**
 * HMAC-sign an email so an unsubscribe link cannot be forged or enumerated.
 *
 * A bare `?email=` link would let anyone unsubscribe anyone by guessing an address,
 * and would let an attacker use the endpoint's response to test whether an address is
 * a subscriber at all. Signing with a server-only secret closes both: the link is only
 * valid if it was minted here, by us, for this exact address.
 */
export function signEmail(email: string): string {
  return createHmac('sha256', env('UNSUBSCRIBE_SECRET')).update(email).digest('hex');
}

/** Build the full unsubscribe link the welcome email points at. */
export function buildUnsubscribeUrl(email: string, origin: string): string {
  const url = new URL('/api/unsubscribe', origin);
  url.searchParams.set('email', email);
  url.searchParams.set('sig', signEmail(email));
  return url.toString();
}

/**
 * Constant-time signature check. `timingSafeEqual` throws on a length mismatch rather
 * than returning false, so that case is handled explicitly first — a forged signature
 * of the wrong length is exactly as invalid as one of the right length that doesn't
 * match, and both must fail the same way from the caller's perspective.
 */
function validSignature(email: string, sig: string): boolean {
  if (!email || !sig) return false;
  const expected = Buffer.from(signEmail(email), 'hex');
  let given: Buffer;
  try {
    given = Buffer.from(sig, 'hex');
  } catch {
    return false;
  }
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function page(status: number, title: string, body: string): Response {
  return new Response(
    `<!doctype html><html lang="fr"><meta charset="utf-8">` +
      `<title>${title}</title>` +
      `<body style="font-family:sans-serif;max-width:480px;margin:80px auto;padding:0 20px">` +
      body +
      `</body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}

function invalidLinkPage(): Response {
  return page(400, 'Lien invalide', '<p>Ce lien de désabonnement est invalide ou a expiré.</p>');
}

/**
 * GET only ever renders a confirmation screen — it never writes anything. Mail
 * clients and antivirus scanners both follow GET links automatically to prefetch
 * them, and if GET performed the unsubscribe itself, a scanner opening the email
 * would silently unsubscribe the recipient before they ever saw it. The actual
 * mutation happens only on the POST this page's form submits, which requires a real
 * click.
 */
export const GET: APIRoute = async ({ url }) => {
  const email = (url.searchParams.get('email') ?? '').trim().slice(0, MAX_EMAIL);
  const sig = (url.searchParams.get('sig') ?? '').trim();
  if (!validSignature(email, sig)) return invalidLinkPage();

  const safeEmail = escapeHtml(email);
  return page(
    200,
    'Confirmer le désabonnement',
    `<h1>Se désabonner ?</h1>` +
      `<p>Confirmez que vous souhaitez désabonner <strong>${safeEmail}</strong> de la newsletter.</p>` +
      `<form method="POST" action="/api/unsubscribe">` +
      `<input type="hidden" name="email" value="${safeEmail}">` +
      `<input type="hidden" name="sig" value="${escapeHtml(sig)}">` +
      `<button type="submit" style="padding:10px 20px">Confirmer le désabonnement</button>` +
      `</form>`,
  );
};

/**
 * POST performs the actual unsubscribe, triggered only by the confirmation page's
 * form submit (a real click, not a prefetch).
 *
 * Order matters and is fixed, not incidental:
 *   1. Supabase write (blocking) — this is what makes `unsubscribed_at` real, and the
 *      whole D16 rationale rests on it actually happening. If it fails, the request
 *      fails: a refused unsubscribe is a legal problem, so this must never be the
 *      operation that silently no-ops.
 *   2. Resend opt_out on the TOPIC, never the contact's global `unsubscribed` flag —
 *      that flag is account-wide and would also cut the person off from Ouros Lab and
 *      Ouros Health. This call is wrapped so its failure can never fail step 1's
 *      result back to the user: Supabase is the source of truth, and by the time this
 *      runs the person is already, correctly, unsubscribed.
 */
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
    return page(400, 'Erreur', '<p>Requête invalide.</p>');
  }

  const email = (typeof raw.email === 'string' ? raw.email : '').trim().slice(0, MAX_EMAIL);
  const sig = (typeof raw.sig === 'string' ? raw.sig : '').trim();
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');

  if (!validSignature(email, sig)) {
    return wantsJson
      ? new Response(JSON.stringify({ ok: false, error: 'invalid_signature' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      : invalidLinkPage();
  }

  const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });

  // Blocking. A failure here must reach the caller as a failure — see the ordering
  // note above.
  const { error: dbErr } = await supabase
    .from('mg_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', email);
  if (dbErr) {
    console.error('unsubscribe: mg_subscribers update failed', dbErr);
    return wantsJson
      ? new Response(JSON.stringify({ ok: false, error: 'store_failed' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      : page(500, 'Erreur', '<p>Le désabonnement a échoué. Réessayez dans un instant.</p>');
  }

  // Never allowed to change the response above this line. A Resend outage must not
  // turn a real, recorded unsubscribe into an error shown to the visitor.
  try {
    const res = await fetch(
      `https://api.resend.com/contacts/${encodeURIComponent(email)}/topics`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${env('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        // A BARE ARRAY, not { topics: [...] } — the Node SDK wraps it, the raw endpoint
        // does not. Wrapped, this 400s, and since the failure here is only logged the
        // person stayed opted in at Resend and kept receiving the newsletter while our
        // own database said they had unsubscribed. Exactly the legal failure this
        // endpoint exists to prevent.
        body: JSON.stringify([{ id: env('RESEND_TOPIC_ID'), subscription: 'opt_out' }]),
        signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
      },
    );
    if (!res.ok) {
      console.error('unsubscribe: resend topic opt_out failed', res.status, (await res.text()).slice(0, 300));
    }
  } catch (e) {
    console.error('unsubscribe: resend topic opt_out failed', e instanceof Error ? e.message : String(e));
  }

  return wantsJson
    ? new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    : page(200, 'Désabonné', '<p>Vous êtes désabonné. Vous ne recevrez plus la newsletter.</p>');
};
