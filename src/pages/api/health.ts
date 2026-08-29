import type { APIRoute } from 'astro';
import { telegramReachable } from '../../lib/telegram';

/**
 * Is this deployment's outbound Telegram channel actually working?
 *
 * EXISTS BECAUSE A BROKEN CHANNEL CANNOT REPORT ITSELF. On 2026-08-29 the production
 * bot token was invalid, every send answered 404, and nothing surfaced it for hours:
 * the only alarm in the system also sends through Telegram. Two subscriber
 * notifications were lost and the send-failure alert had never worked.
 *
 * The fix is not more logging, it is a watcher that does not share the failure. The
 * VPS health check runs every 3 hours with its OWN, separate Telegram credentials. It
 * reads this route and alerts through its own bot, so a dead channel here still
 * produces a message there. Worst case, a drift is loud within three hours instead of
 * silent until someone notices a missing notification.
 *
 *   maxguerois.com                    VPS (max-503A, own creds)
 *   ┌────────────────────┐            ┌──────────────────────────┐
 *   │ /api/subscribe     │            │ max-503A-health.timer /3h │
 *   │   └─ sendTelegram ─┼──╳ 404 ──▶ │                          │
 *   │ /api/health        │◀───GET─────┤ check H reads this route  │
 *   │   └─ getChat ──────┼──▶ 404     │   └─ alerts via ITS bot ──┼──▶ Max
 *   └────────────────────┘            └──────────────────────────┘
 *      the broken channel                the watcher that survives it
 *
 * NO AUTH, deliberately. The body carries a single enum and never the token, the chat
 * id, or any subscriber data, so there is nothing here worth stealing. The one cost is
 * that a stranger can make us call Telegram: `getChat` is a READ, outside the send
 * quotas that real notifications depend on, so hammering it cannot starve the thing
 * this route protects. Adding a shared secret would create a second credential that
 * can drift, which is the class of bug this route exists to catch.
 */
export const prerender = false;

export const GET: APIRoute = async () => {
    const telegram = await telegramReachable();
    return new Response(JSON.stringify({ ok: telegram === 'ok', telegram }), {
        status: 200,
        headers: {
            'content-type': 'application/json',
            // Never let a CDN or a browser answer for the live state. A cached "ok"
            // would keep the watcher happy for as long as the cache lives, which is
            // the same silent-success failure the route was built to end.
            'cache-control': 'no-store',
        },
    });
};
