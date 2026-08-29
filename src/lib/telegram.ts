/**
 * The one place that knows how to reach Telegram.
 *
 * WHY THIS FILE EXISTS. On 2026-08-29 the production TELEGRAM_BOT_TOKEN was invalid
 * and every outbound message answered `404 Not Found` for hours. Nothing surfaced it,
 * because the only alarm in the system sends through Telegram: a broken channel cannot
 * report that it is broken. Two subscriber notifications were lost, and the
 * send-failure alert shipped the same morning had never worked at all.
 *
 * Two things came out of that, and both live here:
 *
 *   1. ONE implementation, imported by the route and by /api/health. It used to be
 *      inline in subscribe.ts, so a health check would have had to copy it, and the
 *      first copy to drift would have drifted silently.
 *
 *   2. `telegramReachable()`, which /api/health exposes so something OUTSIDE Vercel
 *      can watch this channel. The VPS health check runs every 3 hours with its own,
 *      separate Telegram credentials, so when this one breaks the alarm still gets
 *      through. That is the whole point: the watcher must not share the failure.
 *
 * The token also lives in max-ai's credentials file on the VPS, which is how it
 * drifted in the first place. Deduplicating it properly means one system owning the
 * channel; until then, the health check turns a silent drift into a loud one within
 * three hours.
 */

const TELEGRAM_TIMEOUT_MS = 3000;
/** getChat is a read, so a probe can run often without touching send quotas. */
const PROBE_TIMEOUT_MS = 5000;

function optionalEnv(name: string): string | undefined {
    const v = import.meta.env[name] ?? process.env[name];
    return v ? String(v) : undefined;
}

/** Both halves or nothing: a token without a chat can't send, and vice versa. */
export function telegramCreds(): { token: string; chat: string } | null {
    const token = optionalEnv('TELEGRAM_BOT_TOKEN');
    const chat = optionalEnv('TELEGRAM_ADMIN_CHAT_ID');
    return token && chat ? { token, chat } : null;
}

/**
 * Post one message to the admin chat. NEVER throws, and never fails a request.
 *
 * Awaited by every caller, deliberately. Astro has no equivalent to `after()`, and an
 * unawaited call is killed by the serverless teardown: in ouros-reddit-scam that cost
 * 5 audience adds out of 20 and 13 welcome emails out of 20, at random.
 */
export async function sendTelegram(text: string): Promise<void> {
    const creds = telegramCreds();
    if (!creds) return;
    try {
        const res = await fetch(`https://api.telegram.org/bot${creds.token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: creds.chat, text }),
            signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
        });
        // A bad token answers 404 and a bad chat answers 400, and `fetch` RESOLVES for
        // both. Without this check the send reports success while reaching nobody,
        // which is exactly how the 2026-08-29 outage stayed invisible. The log line is
        // the only local trace; /api/health is what makes it audible from outside.
        if (!res.ok) {
            console.error(`telegram send rejected ${res.status}: ${(await res.text()).slice(0, 200)}`);
        }
    } catch (e) {
        console.error('telegram send failed', e instanceof Error ? e.message : String(e));
    }
}

export type TelegramHealth = 'ok' | 'invalid' | 'unreachable' | 'unconfigured';

/**
 * Can this deployment actually reach its Telegram chat, right now?
 *
 * Uses `getChat`, not `getMe`, on purpose: getMe validates only the TOKEN, and the
 * pair can break on either side. A wrong token answers 404, a wrong chat id answers
 * 400, and getChat catches both while sending nothing to anyone. It is a read, so a
 * three-hourly probe never eats into the send quota that real notifications need.
 */
export async function telegramReachable(): Promise<TelegramHealth> {
    const creds = telegramCreds();
    if (!creds) return 'unconfigured';
    const url =
        `https://api.telegram.org/bot${creds.token}/getChat` +
        `?chat_id=${encodeURIComponent(creds.chat)}`;
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
        return res.ok ? 'ok' : 'invalid';
    } catch {
        // Telegram itself down, or the network. Distinct from `invalid`: this one is
        // not our configuration, and it must not page anyone at 3am on a blip.
        return 'unreachable';
    }
}
