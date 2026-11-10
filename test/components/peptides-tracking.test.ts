// @vitest-environment happy-dom
//
// Le script de mesure de /peptides est `is:inline` : il ne peut pas etre
// importe. On l'EXTRAIT du .astro et on l'execute, donc ce test exerce le code
// reellement livre, pas une copie qui derivera.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SRC = readFileSync(
    resolve(__dirname, '../../src/components/PeptidesLanding.astro'),
    'utf8'
);
const SCRIPT = (() => {
    const blocks = SRC.split('<script is:inline>').slice(1);
    const wanted = blocks.find((b) => b.includes('data-subscribe'));
    if (!wanted) throw new Error('script data-subscribe introuvable dans PeptidesLanding.astro');
    return wanted.split('</script>')[0];
})();

const SOURCES = ['fr-peptides', 'fr-peptides-newsletter'];

let events: Array<{ name: string; props: Record<string, unknown> | undefined }>;
let observers: Array<{ el: Element; fire: () => void }>;

function formHtml(source: string | null) {
    return `<form class="pf" data-subscribe method="POST" action="/api/subscribe?lang=fr-peptides">
        ${source === null ? '' : `<input type="hidden" name="source" value="${source}" />`}
        <input type="email" name="email" required />
        <button type="submit">S'inscrire</button>
        <p class="pf-err" hidden></p>
    </form>`;
}

function mount({ omitSourceOn = -1 } = {}) {
    document.body.innerHTML = SOURCES.map((s, i) =>
        formHtml(i === omitSourceOn ? null : s)
    ).join('');
    return {
        forms: Array.from(document.querySelectorAll<HTMLFormElement>('form[data-subscribe]')),
    };
}

function run() {
    // eslint-disable-next-line no-new-func
    new Function(SCRIPT)();
}

const named = (n: string) => events.filter((e) => e.name === n);

beforeEach(() => {
    vi.useFakeTimers();
    events = [];
    observers = [];
    localStorage.clear();

    window.mgTrack = (name: string, props?: Record<string, unknown>) =>
        events.push({ name, props });
    // Copie fidele du helper pose par Layout.astro.
    const CODES = ['invalid_email', 'rate_limited', 'store_failed', 'bad_request'];
    window.mgReason = (m: string) => (CODES.indexOf(m) === -1 ? 'network' : m);

    // IntersectionObserver pilotable : happy-dom n'en fournit pas.
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            cb: (e: Array<{ isIntersecting: boolean }>) => void;
            constructor(cb: (e: Array<{ isIntersecting: boolean }>) => void) {
                this.cb = cb;
            }
            observe(el: Element) {
                observers.push({ el, fire: () => this.cb([{ isIntersecting: true }]) });
            }
            disconnect() {}
        }
    );
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete window.mgTrack;
    delete window.mgReason;
});

describe('vue des formulaires', () => {
    it('compte une vue par formulaire, avec son `source`', () => {
        mount();
        run();
        observers.forEach((o) => o.fire());
        expect(named('peptides_form_seen').map((e) => e.props!.source)).toEqual(SOURCES);
    });

    it('ne compte PAS deux fois le meme formulaire', () => {
        mount();
        run();
        observers[0].fire();
        observers[0].fire();
        expect(named('peptides_form_seen')).toHaveLength(1);
    });
});

describe('debut de saisie', () => {
    it('un seul evenement, meme si le focus revient', () => {
        const { forms } = mount();
        run();
        const input = forms[0].querySelector('input[name="email"]') as HTMLInputElement;
        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('focus'));
        expect(named('peptides_form_started')).toHaveLength(1);
        expect(named('peptides_form_started')[0].props!.source).toBe('fr-peptides');
    });

    it('sans champ `source`, retombe sur "inconnu" au lieu de planter', () => {
        const { forms } = mount({ omitSourceOn: 0 });
        run();
        (forms[0].querySelector('input[name="email"]') as HTMLInputElement).dispatchEvent(
            new Event('focus')
        );
        expect(named('peptides_form_started')[0].props!.source).toBe('inconnu');
    });
});

describe('envoi', () => {
    const submit = async (form: HTMLFormElement, email: string, reply: unknown) => {
        (form.querySelector('input[name="email"]') as HTMLInputElement).value = email;
        vi.stubGlobal('fetch', vi.fn().mockImplementation(() => reply));
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await vi.runAllTimersAsync();
    };
    const ok = (body: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

    it('un email invalide n envoie AUCUN evenement', async () => {
        const { forms } = mount();
        run();
        await submit(forms[0], 'pas-un-email', ok({ ok: true }));
        expect(named('peptides_form_submitted')).toHaveLength(0);
    });

    it('un envoi valide compte, puis le succes compte', async () => {
        const { forms } = mount();
        run();
        await submit(forms[0], 'a@example.com', ok({ ok: true }));
        expect(named('peptides_form_submitted')[0].props!.source).toBe('fr-peptides');
        expect(named('peptides_subscribed')[0].props!.source).toBe('fr-peptides');
    });

    it('un code serveur connu passe tel quel', async () => {
        const { forms } = mount();
        run();
        await submit(forms[0], 'a@example.com', ok({ ok: false, error: 'rate_limited' }));
        expect(named('peptides_form_failed')[0].props!.reason).toBe('rate_limited');
    });

    it('un message de navigateur est ramene a "network"', async () => {
        const { forms } = mount();
        run();
        await submit(forms[0], 'a@example.com', Promise.reject(new Error('Failed to fetch')));
        expect(named('peptides_form_failed')[0].props!.reason).toBe('network');
    });
});
