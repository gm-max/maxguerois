// @vitest-environment happy-dom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';

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

afterEach(() => {
    document.body.replaceChildren();
    Reflect.deleteProperty(window, '__nlFormBound');
    vi.unstubAllGlobals();
});

it.each(forms)('$component blocks a second submit while allowing a retry after failure', async (config) => {
    const { renderForm, run } = mount(config);
    const form = renderForm();
    let fail!: (error: Error) => void;
    const fetch = vi.fn(() => new Promise((_resolve, reject) => { fail = reject; }));
    vi.stubGlobal('fetch', fetch);
    run();

    submit(form);
    submit(form);
    expect(fetch).toHaveBeenCalledTimes(1);

    fail(new Error('network'));
    await vi.waitFor(() => expect(form.hasAttribute('aria-busy')).toBe(false));
    submit(form);
    expect(fetch).toHaveBeenCalledTimes(2);
});

it('binds each newsletter form once even when rendered later in the page', () => {
    const { renderForm, run } = mount(forms[0]);
    const first = renderForm();
    const fetch = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetch);
    run();
    const second = renderForm();
    run();

    submit(second);
    expect(fetch).toHaveBeenCalledTimes(1);
    submit(first);
    expect(fetch).toHaveBeenCalledTimes(2);
});
