/**
 * One-click unsubscribe, unblocked.
 *
 * THE PROBLEM. Every welcome email carries `List-Unsubscribe-Post:
 * List-Unsubscribe=One-Click`. RFC 8058 says the mail client honours that by POSTing
 * to the List-Unsubscribe URI with `application/x-www-form-urlencoded` and no Origin
 * header. Vercel refuses exactly that shape:
 *
 *     403  Cross-site POST form submissions are forbidden     (server: Vercel)
 *
 * Measured on 2026-08-29, both through Cloudflare and directly against the deployment
 * URL, so the block is Vercel's and not the proxy's. The trigger is isolated: an
 * Origin-less POST whose content-type is one of the "simple request" types
 * (form-urlencoded, text/plain, multipart, or absent). `application/json` passes.
 * Gmail sends form-urlencoded, so the button was dead for every subscriber.
 *
 * WHAT THIS DOES, AND DELIBERATELY DOES NOT DO. It adds an Origin header and forwards.
 * That is all. It holds NO secret: not the HMAC key, not the Supabase service role,
 * not the Resend key. Every check still happens on Vercel.
 *
 * That restraint is the design, not laziness. The same day this was written, a
 * duplicated Telegram token drifted between Vercel and the VPS and silently killed
 * every notification for hours. A worker that re-implemented signature checking and
 * database writes would have created a second copy of three more secrets and a second
 * copy of the logic, and the first one to drift would have drifted in silence.
 *
 *     Gmail ──POST, no Origin──▶ Cloudflare ──same POST + Origin──▶ Vercel
 *                                (this worker)                      (all the logic)
 *
 * IS THIS A CSRF HOLE? No. Vercel's protection assumes the body is the only
 * authorisation. Here it is not: the request must carry an HMAC signature of the email
 * minted with a server-only secret. The signature IS the anti-forgery token, and it is
 * verified on Vercel after this hop. An attacker who can make a browser POST here
 * still cannot produce a valid `sig`, and one who has the secret does not need a
 * browser. The scope is narrowed anyway, below, so nothing else on the site loses
 * Vercel's protection.
 */

const PATH = '/api/unsubscribe';
const ORIGIN = 'https://maxguerois.com';

export default {
    async fetch(request) {
        const url = new URL(request.url);

        // Narrow on purpose. Anything else reaches Vercel untouched and keeps its
        // CSRF protection: this worker must never become a general-purpose bypass.
        if (request.method !== 'POST' || url.pathname !== PATH) {
            return fetch(request);
        }

        // An Origin already present means a normal browser submit from the
        // confirmation page. Vercel accepts those, so leave the request alone rather
        // than rewriting a header that is already correct.
        if (request.headers.get('origin')) {
            return fetch(request);
        }

        const headers = new Headers(request.headers);
        headers.set('origin', ORIGIN);
        // Vercel checks Sec-Fetch-Site too. A mail client sends neither, and omitting
        // it here left some requests still refused during testing.
        headers.set('sec-fetch-site', 'same-origin');

        return fetch(
            new Request(url.toString(), {
                method: 'POST',
                headers,
                body: request.body,
                // Required by the Workers runtime whenever a body is streamed.
                duplex: 'half',
                redirect: 'manual',
            }),
        );
    },
};
