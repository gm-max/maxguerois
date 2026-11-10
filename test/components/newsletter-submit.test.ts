// @vitest-environment happy-dom

/**
 * The two signup forms' submit handlers, run as the browser runs them.
 *
 * The inline script is pulled straight out of the .astro source and executed here,
 * rather than reimplemented, so these tests cannot drift from what ships. Both
 * components are exercised by the same cases because they talk to the same route and
 * must behave the same at the moments that matter.
 *
 * WHAT THIS FILE GUARDS, in the order the bugs appeared:
 *
 * 1. One submit per press (PR #81). Two fast clicks used to send two signups.
 * 2. One handler per form (PR #81). A page carries several embeds, and a second copy
 *    of the script used to bind every form twice.
 * 3. The Turnstile gate. The request must not leave before a token exists, the token
 *    must be in the payload, and a failed attempt must clear the widget — otherwise
 *    the retry spends a token the server has already seen and the visitor reads the
 *    same error however many times they press.
 *
 * The gate widened the window guard (1) has to cover. The fetch used to go out in the
 * same turn as the click; now it waits on a promise that can take as long as
 * Cloudflare takes. `aria-busy` is set BEFORE that wait, which is what keeps the
 * guard honest, and 'holds the lock while the token is pending' is the test that says
 * so.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const forms = [
    { component: 'NewsletterEmbed', attribute: 'data-nl-form', errorClass: 'nl-err' },
    { component: 'PeptidesLanding', attribute: 'data-subscribe', errorClass: 'pf-err' },
];

function mount({ component, attribute, errorClass }: typeof forms[number]) {
    const source = readFileSync(resolve(__dirname, `../../src/components/${component}.astro`), 'utf8');
    const script = [...source.matchAll(/<script is:inline[^>]*>([\s\S]*?)<\/script>/g)]
        .find(([, code]) => code.includes(`form[${attribute}]`))![1];
    const renderForm = () => {
        const form = document.createElement('form');
        form.setAttribute(attribute, '');
        form.action = '/api/subscribe?lang=fr';
        form.innerHTML = `
            <input type="email" name="email" value="test@example.com" required>
            <button type="submit">S'inscrire</button>
            <p class="${errorClass}" hidden></p>`;
        document.body.append(form);
        return form;
    };
    return { renderForm, run: new Function(script) };
}

function submit(form: HTMLFormElement) {
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

/**
 * Let the handler's promise chain run.
 *
 * The request is one microtask behind the click now that a token is awaited first,
 * even when the gate is off and the token resolves immediately. Every assertion about
 * fetch has to be made after this.
 */
const settle = () => new Promise((r) => setTimeout(r, 0));

/** A stand-in for window.mgTurnstile, with the token under the test's control. */
function fakeGate({ active = true } = {}) {
    const calls: { form: HTMLFormElement }[] = [];
    const resets: HTMLFormElement[] = [];
    let release!: (token: string) => void;
    let refuse!: (e: Error) => void;
    const gate = {
        active,
        warm: vi.fn(),
        token: vi.fn((form: HTMLFormElement) => {
            calls.push({ form });
            return new Promise<string>((resolve, reject) => {
                release = resolve;
                refuse = reject;
            });
        }),
        reset: vi.fn((form: HTMLFormElement) => { resets.push(form); }),
    };
    (window as any).mgTurnstile = gate;
    return {
        gate,
        calls,
        resets,
        release: (token = 'a-fresh-token') => release(token),
        refuse: (code = 'captcha_failed') => refuse(new Error(code)),
    };
}

const bodyOf = (fetchMock: any) => JSON.parse(fetchMock.mock.calls[0][1].body);

afterEach(() => {
    document.body.replaceChildren();
    Reflect.deleteProperty(window, '__nlFormBound');
    Reflect.deleteProperty(window, 'mgTurnstile');
    vi.unstubAllGlobals();
});

describe('one submit per press', () => {
    it.each(forms)('$component blocks a second submit while allowing a retry after failure', async (config) => {
        const { renderForm, run } = mount(config);
        const form = renderForm();
        let fail!: (error: Error) => void;
        const fetch = vi.fn(() => new Promise((_resolve, reject) => { fail = reject; }));
        vi.stubGlobal('fetch', fetch);
        run();

        submit(form);
        submit(form);
        await settle();
        expect(fetch).toHaveBeenCalledTimes(1);

        fail(new Error('network'));
        await vi.waitFor(() => expect(form.hasAttribute('aria-busy')).toBe(false));
        submit(form);
        await settle();
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it.each(forms)('$component holds the lock while the token is pending', async (config) => {
        // The window the gate widened. Between the click and the request there is now
        // a round trip to Cloudflare, and a visitor pressing twice during it must
        // still produce one signup. `aria-busy` is set before the wait, so it does.
        const { renderForm, run } = mount(config);
        const form = renderForm();
        const fetch = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
        vi.stubGlobal('fetch', fetch);
        const ts = fakeGate();
        run();

        submit(form);
        submit(form);
        submit(form);
        await settle();
        // Not one request yet, and only ever one challenge asked for.
        expect(fetch).not.toHaveBeenCalled();
        expect(ts.calls).toHaveLength(1);

        ts.release();
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    });
});

describe('one handler per form', () => {
    it('binds each newsletter form once even when rendered later in the page', async () => {
        const { renderForm, run } = mount(forms[0]);
        const first = renderForm();
        const fetch = vi.fn(() => new Promise(() => {}));
        vi.stubGlobal('fetch', fetch);
        run();
        const second = renderForm();
        run();

        submit(second);
        await settle();
        expect(fetch).toHaveBeenCalledTimes(1);
        submit(first);
        await settle();
        expect(fetch).toHaveBeenCalledTimes(2);
    });
});

describe('the turnstile gate', () => {
    it.each(forms)('$component sends no request until a token exists', async (config) => {
        const { renderForm, run } = mount(config);
        const form = renderForm();
        const fetch = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
        vi.stubGlobal('fetch', fetch);
        const ts = fakeGate();
        run();

        submit(form);
        await settle();
        expect(fetch).not.toHaveBeenCalled();

        ts.release('a-fresh-token');
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        // Cloudflare's own field name, which is the one the route reads.
        expect(bodyOf(fetch)['cf-turnstile-response']).toBe('a-fresh-token');
    });

    it.each(forms)('$component never sends the request when the challenge fails', async (config) => {
        const { renderForm, run } = mount(config);
        const form = renderForm();
        const fetch = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
        vi.stubGlobal('fetch', fetch);
        const ts = fakeGate();
        run();

        submit(form);
        await settle();
        ts.refuse('captcha_failed');

        await vi.waitFor(() => expect(form.hasAttribute('aria-busy')).toBe(false));
        expect(fetch).not.toHaveBeenCalled();
        // The visitor is told, in this form's own words, and the field keeps its value.
        const err = form.querySelector(`.${config.errorClass}`) as HTMLElement;
        expect(err.hidden).toBe(false);
        expect(err.textContent).toMatch(/anti-robot/);
        expect((form.querySelector('input[name="email"]') as HTMLInputElement).value)
            .toBe('test@example.com');
    });

    it.each(forms)('$component clears the widget after a failure, so the retry is clean', async (config) => {
        // Without this the second attempt re-sends a token the server has already
        // redeemed, Cloudflare answers timeout-or-duplicate, and the form looks
        // permanently broken to someone who did nothing wrong.
        const { renderForm, run } = mount(config);
        const form = renderForm();
        const fetch = vi.fn(async () => new Response('{"ok":false,"error":"store_failed"}', { status: 500 }));
        vi.stubGlobal('fetch', fetch);
        const ts = fakeGate();
        run();

        submit(form);
        await settle();
        ts.release('token-now-spent');
        await vi.waitFor(() => expect(form.hasAttribute('aria-busy')).toBe(false));
        expect(ts.resets).toEqual([form]);

        // And the retry asks for a new one rather than reusing the spent token.
        submit(form);
        await settle();
        expect(ts.calls).toHaveLength(2);
        ts.release('a-second-token');
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
        expect(JSON.parse(fetch.mock.calls[1][1].body)['cf-turnstile-response'])
            .toBe('a-second-token');
    });

    it('asks for one token per form, not one per page', async () => {
        // Two embeds on one page is the normal case (an article footer plus the
        // one-per-visitor modal), and a token is bound to the widget that minted it.
        // Sharing one across forms would spend it twice.
        const { renderForm, run } = mount(forms[0]);
        const footer = renderForm();
        const modal = renderForm();
        const fetch = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
        vi.stubGlobal('fetch', fetch);
        const ts = fakeGate();
        run();

        submit(footer);
        await settle();
        submit(modal);
        await settle();
        expect(ts.calls.map((c) => c.form)).toEqual([footer, modal]);
    });

    it('works inside a closed-then-opened dialog, like the subscribe modal', async () => {
        // The modal's form is in a <dialog> with no layout until it opens. Binding
        // happens at script time either way, so what is pinned here is that opening
        // the dialog afterwards changes nothing about the gate.
        const { renderForm, run } = mount(forms[0]);
        const dialog = document.createElement('dialog');
        dialog.className = 'submodal';
        document.body.append(dialog);
        const form = renderForm();
        dialog.append(form);

        const fetch = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
        vi.stubGlobal('fetch', fetch);
        const ts = fakeGate();
        run();

        dialog.setAttribute('open', '');
        submit(form);
        await settle();
        expect(fetch).not.toHaveBeenCalled();
        ts.release('modal-token');
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(bodyOf(fetch)['cf-turnstile-response']).toBe('modal-token');
    });

    it.each(forms)('$component warms the gate on first intent, once', async (config) => {
        // Cloudflare recommends loading its script as early as possible; this site
        // waits for a sign of intent so a reader who never touches the form never
        // pays for it. Three events, because each catches a case the others miss —
        // and `change` is the autofill one.
        const { renderForm, run } = mount(config);
        const form = renderForm();
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
        const ts = fakeGate();
        run();

        const input = form.querySelector('input[name="email"]') as HTMLInputElement;
        input.dispatchEvent(new Event('focusin', { bubbles: true }));
        input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        expect(ts.gate.warm).toHaveBeenCalledWith(form);
        // `{ once: true }` on each of the three listeners.
        expect(ts.gate.warm.mock.calls).toHaveLength(3);
    });

    it.each(forms)('$component behaves exactly as before when the gate is off', async (config) => {
        // The state of every local `npm run dev`, and of production until the two
        // Vercel variables are set. The payload must be byte-identical to the
        // pre-Turnstile one: no token field, no extra round trip.
        const { renderForm, run } = mount(config);
        const form = renderForm();
        const fetch = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
        vi.stubGlobal('fetch', fetch);
        const ts = fakeGate({ active: false });
        run();

        submit(form);
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(ts.gate.token).not.toHaveBeenCalled();
        expect(bodyOf(fetch)).not.toHaveProperty('cf-turnstile-response');
    });

    it.each(forms)('$component still submits when mgTurnstile is missing entirely', async (config) => {
        // A content blocker can remove the gate's own script tag. The form must then
        // post what it always posted and let the SERVER decide, rather than throwing
        // in the handler and leaving the button dead.
        const { renderForm, run } = mount(config);
        const form = renderForm();
        const fetch = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
        vi.stubGlobal('fetch', fetch);
        run();

        submit(form);
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(bodyOf(fetch)).not.toHaveProperty('cf-turnstile-response');
    });
});
