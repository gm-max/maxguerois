// @vitest-environment happy-dom

/**
 * window.mgTurnstile — the client half of the anti-bot gate.
 *
 * The script is lifted out of TurnstileGate.astro and run here, so these tests cannot
 * drift from what ships. Cloudflare's `api.js` is never fetched: a fake
 * `window.turnstile` stands in, and the fake is installed by the stubbed script
 * element's load event, which is also how the real one arrives.
 *
 * WHAT IS WORTH PINNING HERE, and why each one is a bug waiting to happen:
 *
 *   api.js once per page          — a page carries up to four forms. Four fetches of
 *                                   the same script, and four widget registries.
 *   one widget per form           — a token belongs to the widget that minted it.
 *                                   Sharing one across forms spends it twice and the
 *                                   second form sees timeout-or-duplicate.
 *   reset between attempts        — single-use tokens. Without the reset the retry
 *                                   re-sends a spent token forever.
 *   every callback has an outcome — expired, timeout, error and unsupported all have
 *                                   to settle the promise. One that does not leaves
 *                                   the submit button disabled with no message, which
 *                                   is the worst failure of the set because it looks
 *                                   like the site is thinking.
 *   a blocked script fails LOUD   — a corporate proxy that never answers must end in
 *                                   a message, not in a spinner.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SOURCE = readFileSync(
    resolve(__dirname, '../../src/components/TurnstileGate.astro'),
    'utf8',
);
const SCRIPT = SOURCE.match(/<script is:inline[^>]*>([\s\S]*?)<\/script>/)![1];

const SITE_KEY = 'site-key-public';

/** Run the gate's script the way the browser runs it, with define:vars supplied. */
function install(siteKey = SITE_KEY) {
    new Function('siteKey', SCRIPT)(siteKey);
    return (window as any).mgTurnstile as {
        active: boolean;
        warm: (f: Element) => void;
        token: (f: Element) => Promise<string | null>;
        reset: (f: Element) => void;
        lastError: (f: Element) => string;
    };
}

type Widget = {
    container: string;
    params: Record<string, any>;
    id: string;
    held: string | null;
};

/**
 * A stand-in for Cloudflare's api.js, installed when the injected <script> "loads".
 *
 * `render` records the params so the configuration can be asserted, and `execute`
 * does nothing on its own: each test fires the callback it wants, which is what lets
 * one fake cover a success, an expiry and a hard error.
 */
function fakeTurnstile() {
    const widgets: Widget[] = [];
    let n = 0;
    const api = {
        // Throws, exactly as the real api.js does on a tag carrying defer/async.
        // If anyone puts `ready()` back, the tests fail the way the browser did.
        ready: vi.fn(() => {
            throw new Error(
                '[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js ' +
                    'script tag before using turnstile.ready().',
            );
        }),
        render: vi.fn((container: string, params: Record<string, any>) => {
            const id = `widget-${++n}`;
            widgets.push({ container, params, id, held: null });
            return id;
        }),
        execute: vi.fn(),
        getResponse: vi.fn((id: string) => widgets.find((w) => w.id === id)?.held ?? null),
        reset: vi.fn((id: string) => {
            const w = widgets.find((x) => x.id === id);
            if (w) w.held = null;
        }),
        remove: vi.fn(),
        isExpired: vi.fn(() => false),
    };
    (window as any).turnstile = api;
    return { api, widgets };
}

/**
 * Intercept the injected <script> instead of letting happy-dom fetch it.
 *
 * `outcome` decides what the browser would have done: 'load' installs the fake API,
 * 'error' is a blocked or missing file, and 'hang' is the nastier one — a proxy that
 * accepts the request and never answers.
 */
function stubScriptInjection(
    outcome: 'load' | 'error' | 'hang' = 'load',
    { apiArrivesLate = 0 } = {},
) {
    const injected: HTMLScriptElement[] = [];
    const realAppend = document.head.appendChild.bind(document.head);
    vi.spyOn(document.head, 'appendChild').mockImplementation(((node: any) => {
        if (node?.tagName !== 'SCRIPT') return realAppend(node);
        injected.push(node);
        if (outcome !== 'hang') {
            setTimeout(() => {
                // `apiArrivesLate` reproduces what a real browser did: the load
                // event fires, and `window.turnstile` only appears some
                // milliseconds later. See the regression test below.
                if (outcome === 'load' && !apiArrivesLate) fakeTurnstile();
                node.dispatchEvent(new Event(outcome));
                if (outcome === 'load' && apiArrivesLate) {
                    setTimeout(fakeTurnstile, apiArrivesLate);
                }
            }, 0);
        }
        return node;
    }) as any);
    return injected;
}

function makeForm(errorClass = 'nl-err') {
    const form = document.createElement('form');
    form.innerHTML = `<input name="email"><p class="${errorClass}" hidden></p>`;
    document.body.append(form);
    return form;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
    Reflect.deleteProperty(window, 'mgTurnstile');
    Reflect.deleteProperty(window, 'turnstile');
    document.body.replaceChildren();
    document.head.replaceChildren();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('lang');
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe('when no site key was baked into the build', () => {
    it('is inert, and token() resolves null rather than throwing', async () => {
        const injected = stubScriptInjection();
        const gate = install('');
        const form = makeForm();

        expect(gate.active).toBe(false);
        await expect(gate.token(form)).resolves.toBeNull();
        gate.warm(form);
        await tick();
        // Nothing fetched, nothing drawn. This is the state of every `npm run dev`.
        expect(injected).toHaveLength(0);
        expect(form.querySelector('.mg-turnstile')).toBeNull();
    });
});

describe('loading api.js', () => {
    it('fetches the exact documented URL, and never with defer', async () => {
        // Two separate pins. The URL, because Cloudflare's own caution is that
        // proxying or caching this file breaks the widget on their next release.
        //
        // And the ABSENCE of `defer`, which is the second browser-only bug this
        // file now guards. Their examples all carry it; api.js then reads it off
        // its own tag and makes `turnstile.ready()` throw. On a script built with
        // createElement the attribute means nothing anyway, so it is pure cost.
        const injected = stubScriptInjection();
        const gate = install();
        void gate.token(makeForm());
        await tick();
        await tick();
        expect(injected[0].src).toBe(
            'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
        );
        expect(injected[0].defer).toBe(false);
        expect(injected[0].async).toBe(false);
    });

    it('never calls turnstile.ready', async () => {
        // It throws whenever the tag carries defer or async, and the throw escapes
        // from inside a load handler, so the promise settles neither way and the
        // submit hangs with a disabled button. Pinned as "do not reintroduce":
        // nothing it offers is worth that failure mode when polling for `render`
        // answers the same question.
        stubScriptInjection();
        const gate = install();
        void gate.token(makeForm());
        await tick();
        await tick();
        expect((window as any).turnstile.ready).not.toHaveBeenCalled();
    });

    it('fetches it ONCE however many forms ask', async () => {
        const injected = stubScriptInjection();
        const gate = install();
        const a = makeForm();
        const b = makeForm();
        const c = makeForm();

        gate.warm(a);
        gate.warm(b);
        void gate.token(c);
        await tick();
        await tick();
        expect(injected).toHaveLength(1);
    });

    it('waits for window.turnstile when the load event beats it', async () => {
        // THE REGRESSION, and the reason this file alone was not enough. Every test
        // above installs the fake API before dispatching `load`, which is the tidy
        // ordering and not the one a browser produced: against a real dev server the
        // event fired while `window.turnstile` was still undefined. The gate resolved
        // on the event, rendered a widget against nothing, and the throw was
        // swallowed by warm(). The page looked fully loaded and the first submit
        // failed with the generic error.
        vi.useFakeTimers();
        stubScriptInjection('load', { apiArrivesLate: 300 });
        const gate = install();
        const form = makeForm();
        const pending = gate.token(form);

        await vi.advanceTimersByTimeAsync(1);
        // The event has fired, and nothing must have been rendered off the back of it.
        expect((window as any).turnstile).toBeUndefined();

        await vi.advanceTimersByTimeAsync(400);
        const api = (window as any).turnstile;
        expect(api.render).toHaveBeenCalledTimes(1);
        api.render.mock.calls[0][1].callback('late-but-fine');
        await expect(pending).resolves.toBe('late-but-fine');
    });

    it('still gives up if the script loads but never defines the API', async () => {
        // The polling above must stay bounded by the same load timeout, or a script
        // that answers 200 with the wrong body polls forever behind a dead button.
        vi.useFakeTimers();
        stubScriptInjection('load', { apiArrivesLate: 999999 });
        const gate = install();
        const pending = gate.token(makeForm());
        const assertion = expect(pending).rejects.toThrow('captcha_unavailable');
        await vi.advanceTimersByTimeAsync(10000);
        await assertion;
    });

    it('reports captcha_unavailable when the script is blocked', async () => {
        stubScriptInjection('error');
        const gate = install();
        await expect(gate.token(makeForm())).rejects.toThrow('captcha_unavailable');
    });

    it('reports captcha_unavailable when the request simply never answers', async () => {
        // The failure that would otherwise be silent: no error event ever arrives, so
        // without the timeout the submit button stays disabled for good.
        vi.useFakeTimers();
        stubScriptInjection('hang');
        const gate = install();
        const pending = gate.token(makeForm());
        const assertion = expect(pending).rejects.toThrow('captcha_unavailable');
        await vi.advanceTimersByTimeAsync(10000);
        await assertion;
    });

    it('does not retry a dead script on every submit', async () => {
        // Re-fetching adds latency to every attempt and changes nothing: if
        // Cloudflare is unreachable it stays unreachable until the page is reloaded.
        const injected = stubScriptInjection('error');
        const gate = install();
        const form = makeForm();
        await gate.token(form).catch(() => {});
        await gate.token(form).catch(() => {});
        expect(injected).toHaveLength(1);
    });
});

describe('the widget', () => {
    it('renders once per form, each with its own id', async () => {
        stubScriptInjection();
        const gate = install();
        const a = makeForm();
        const b = makeForm();

        void gate.token(a);
        void gate.token(b);
        await tick();
        await tick();

        const api = (window as any).turnstile;
        expect(api.render).toHaveBeenCalledTimes(2);
        const containers = api.render.mock.calls.map((c: any[]) => c[0]);
        expect(new Set(containers).size).toBe(2);
        // Inside the form, so it travels with the modal, and above the error line.
        expect(a.querySelector('.mg-turnstile')).not.toBeNull();
        expect(a.querySelector('.mg-turnstile')!.nextElementSibling)
            .toBe(a.querySelector('.nl-err'));
    });

    it('renders once per form even when asked twice', async () => {
        stubScriptInjection();
        const gate = install();
        const form = makeForm();
        gate.warm(form);
        await tick();
        await tick();
        void gate.token(form);
        await tick();
        expect((window as any).turnstile.render).toHaveBeenCalledTimes(1);
    });

    it('renders on the documented default path, with no clever options', async () => {
        // The regression this pins is an incident, not a preference. The first
        // version used `execution: 'execute'` and `appearance: 'interaction-only'`
        // to stay invisible. Deployed 2026-11-10, rolled back the same hour: the
        // challenge was issued and never completed, with no iframe and no error on
        // one browser. Both options move work into Cloudflare's internals, where a
        // failure has nowhere to surface. Neither comes back without a reason
        // better than "the badge is ugly".
        stubScriptInjection();
        const gate = install();
        void gate.token(makeForm());
        await tick();
        await tick();

        const params = (window as any).turnstile.render.mock.calls[0][1];
        expect(params.sitekey).toBe(SITE_KEY);
        expect(params.execution).toBeUndefined();
        expect(params.appearance).toBeUndefined();
        // `normal` is 300x65 fixed. `flexible` fills its container but needs at
        // least 300px, and the forms that failed were on a narrow screen.
        expect(params.size).toBe('normal');
        // The token travels in the JSON payload the form builds. A hidden input
        // would also survive a failed attempt and risk being re-sent once spent.
        expect(params['response-field']).toBe(false);
        // 32 chars max, alphanumerics plus _ and -, per Cloudflare.
        expect(params.action).toMatch(/^[\w-]{1,32}$/);
    });

    it('follows the site theme rather than the operating system', async () => {
        // Turnstile's own `auto` reads prefers-color-scheme, which this site does not
        // use: the theme lives in data-theme on <html> and is the visitor's choice.
        document.documentElement.setAttribute('data-theme', 'dark');
        stubScriptInjection();
        const gate = install();
        void gate.token(makeForm());
        await tick();
        await tick();
        expect((window as any).turnstile.render.mock.calls[0][1].theme).toBe('dark');
    });

    it('speaks the page language', async () => {
        document.documentElement.setAttribute('lang', 'fr');
        stubScriptInjection();
        const gate = install();
        void gate.token(makeForm());
        await tick();
        await tick();
        expect((window as any).turnstile.render.mock.calls[0][1].language).toBe('fr');
    });
});

describe('getting a token', () => {
    async function armed() {
        stubScriptInjection();
        const gate = install();
        const form = makeForm();
        const pending = gate.token(form);
        await tick();
        await tick();
        const api = (window as any).turnstile;
        return { gate, form, api, pending, params: api.render.mock.calls[0][1] };
    }

    it('resolves with what the success callback is handed', async () => {
        const { pending, params, api } = await armed();
        // Nothing is triggered: the widget starts solving when it is rendered, and
        // the callback registered there settles this promise.
        expect(api.execute).not.toHaveBeenCalled();
        params.callback('the-token');
        await expect(pending).resolves.toBe('the-token');
    });

    it('keeps the Cloudflare error code instead of swallowing it', async () => {
        // 110200 is "unknown domain", 110100 is "invalid sitekey". Mapping both to
        // a bare "unavailable" is what made this take four deploy cycles to locate.
        const { pending, params, gate, form } = await armed();
        const assertion = expect(pending).rejects.toThrow('captcha_unavailable');
        params['error-callback']('110200');
        await assertion;
        expect(gate.lastError(form)).toBe('110200');
    });

    it.each([
        ['expired-callback', 'captcha_failed'],
        ['timeout-callback', 'captcha_failed'],
        ['error-callback', 'captcha_unavailable'],
        ['unsupported-callback', 'captcha_unavailable'],
    ])('settles %s as %s', async (name, code) => {
        // Every callback Cloudflare documents has an outcome. One without leaves the
        // form disabled and silent, which reads as a hung site.
        const { pending, params } = await armed();
        const assertion = expect(pending).rejects.toThrow(code);
        params[name]();
        await assertion;
    });

    it('tells Cloudflare we handled the error, so it draws nothing in our form', async () => {
        const { pending, params } = await armed();
        const assertion = expect(pending).rejects.toThrow();
        expect(params['error-callback']()).toBe(true);
        await assertion;
    });

    it('shares one challenge between concurrent asks for the same form', async () => {
        // Three fast clicks must not start three challenges.
        stubScriptInjection();
        const gate = install();
        const form = makeForm();
        const first = gate.token(form);
        await tick();
        await tick();
        const second = gate.token(form);
        await tick();
        const api = (window as any).turnstile;
        // One widget, therefore one challenge, however many times it is asked.
        expect(api.render).toHaveBeenCalledTimes(1);
        api.render.mock.calls[0][1].callback('shared');
        await expect(first).resolves.toBe('shared');
        await expect(second).resolves.toBe('shared');
    });

    it('reuses a token the widget is already holding instead of re-executing', async () => {
        // Held but not yet spent: single-use means redeemed once at the SERVER, and
        // warming the widget can leave a perfectly good token sitting there.
        stubScriptInjection();
        const gate = install();
        const form = makeForm();
        gate.warm(form);
        await tick();
        await tick();
        const api = (window as any).turnstile;
        api.getResponse.mockReturnValue('already-held');

        await expect(gate.token(form)).resolves.toBe('already-held');
        expect(api.execute).not.toHaveBeenCalled();
    });

    it('gives up after a long wait rather than hanging for good', async () => {
        // Generous on purpose: a managed widget can show a puzzle and a human takes
        // however long they take. This is a seatbelt against a callback that never
        // fires, not a limit on the visitor.
        vi.useFakeTimers();
        stubScriptInjection();
        const gate = install();
        const pending = gate.token(makeForm());
        await vi.advanceTimersByTimeAsync(1);
        const assertion = expect(pending).rejects.toThrow('captcha_unavailable');
        await vi.advanceTimersByTimeAsync(120000);
        await assertion;
    });
});

describe('resetting', () => {
    it('clears the widget that minted the token', async () => {
        stubScriptInjection();
        const gate = install();
        const form = makeForm();
        void gate.token(form);
        await tick();
        await tick();
        const api = (window as any).turnstile;

        gate.reset(form);
        expect(api.reset).toHaveBeenCalledWith(api.render.mock.results[0].value);
    });

    it('is harmless on a form that never had a widget', () => {
        stubScriptInjection();
        const gate = install();
        expect(() => gate.reset(makeForm())).not.toThrow();
    });
});
