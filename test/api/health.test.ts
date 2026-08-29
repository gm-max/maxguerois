import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * The watcher's contract.
 *
 * /api/health exists so something OUTSIDE Vercel can tell that this deployment's
 * Telegram channel is dead. On 2026-08-29 it was dead for hours and nothing said so,
 * because the only alarm sent through the very channel that was broken.
 *
 * Two of these tests are not about Telegram at all. One pins that the body never
 * carries the token or the chat id, because an unauthenticated endpoint that leaks a
 * bot token is a worse bug than the one it fixes. The other pins `no-store`, because a
 * cached "ok" would keep the watcher happy for the life of the cache, which is the
 * same silent-success shape all over again.
 */

const TOKEN = '123456:AAtest-token-value';
const CHAT = '987654321';

let GET: typeof import('../../src/pages/api/health.ts').GET;

beforeEach(async () => {
    vi.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = TOKEN;
    process.env.TELEGRAM_ADMIN_CHAT_ID = CHAT;
    ({ GET } = await import('../../src/pages/api/health.ts'));
});

afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
});

/** Telegram answers `status` to getChat. 200 = reachable, 404 = bad token, 400 = bad chat. */
function telegram(status: number) {
    const spy = vi.fn(async () => new Response('{}', { status }));
    vi.stubGlobal('fetch', spy);
    return spy;
}

const body = async (res: Response) => JSON.parse(await res.text());
const call = () => GET({} as any) as Promise<Response>;

describe('/api/health', () => {
    it('reports ok when the chat answers', async () => {
        telegram(200);
        expect(await body(await call())).toEqual({ ok: true, telegram: 'ok' });
    });

    // 404 is what production actually returned on 2026-08-29: Telegram answers it when
    // the TOKEN is wrong, because /bot<token>/ never resolves.
    it('reports invalid on a bad token', async () => {
        telegram(404);
        expect(await body(await call())).toEqual({ ok: false, telegram: 'invalid' });
    });

    // A valid token with a wrong chat id fails differently, and getMe would have
    // called this healthy. That is why the probe uses getChat.
    it('reports invalid on a good token pointed at a chat that does not exist', async () => {
        telegram(400);
        expect(await body(await call())).toEqual({ ok: false, telegram: 'invalid' });
    });

    it('probes the chat, not just the bot', async () => {
        const spy = telegram(200);
        await call();
        const url = String(spy.mock.calls[0][0]);
        expect(url).toContain('/getChat');
        expect(url).toContain(`chat_id=${CHAT}`);
    });

    // Telegram being down is not the same as us being misconfigured, and must not page
    // anyone at 3am over a blip.
    it('separates a network failure from a configuration failure', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNRESET'); }));
        expect(await body(await call())).toEqual({ ok: false, telegram: 'unreachable' });
    });

    it('says unconfigured, rather than ok, when a credential is missing', async () => {
        vi.resetModules();
        delete process.env.TELEGRAM_BOT_TOKEN;
        ({ GET } = await import('../../src/pages/api/health.ts'));
        const spy = telegram(200);
        expect(await body(await call())).toEqual({ ok: false, telegram: 'unconfigured' });
        // And it must not call Telegram at all with half a credential pair.
        expect(spy).not.toHaveBeenCalled();
    });

    it('never puts the token or the chat id in the response', async () => {
        telegram(404);
        const text = await (await call()).text();
        expect(text).not.toContain(TOKEN);
        expect(text).not.toContain('AAtest-token-value');
        expect(text).not.toContain(CHAT);
    });

    it('forbids caching, so a stale ok can never reassure the watcher', async () => {
        telegram(200);
        expect((await call()).headers.get('cache-control')).toBe('no-store');
    });

    // 200 even when unhealthy, on purpose: the watcher reads the BODY. A 5xx would be
    // swallowed by any proxy's error page and by curl's default silence on failure.
    it('answers 200 even when the channel is broken', async () => {
        telegram(404);
        expect((await call()).status).toBe(200);
    });
});
