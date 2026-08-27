// @vitest-environment happy-dom
//
// Couverture du module d'analytics. Les deux corrections qui comptent ici — la
// marque de provenance et l'URL canonique — passent toutes deux par
// `normaliseEvent`, donc c'est le point qu'on serre le plus.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    normaliseEvent,
    analyticsEnabled,
    initAnalytics,
    ANALYTICS_HOSTS,
    SITE,
} from '../../src/lib/analytics';

describe('normaliseEvent', () => {
    it('laisse passer null sans exploser', () => {
        expect(normaliseEvent(null, '/peptides', 'https://maxguerois.com', '')).toBeNull();
    });

    it('pose la marque de provenance sur TOUT evenement', () => {
        const e = normaliseEvent({ properties: {} }, null, 'https://maxguerois.com', '');
        expect(e!.properties!.site).toBe(SITE);
    });

    it('cree `properties` quand elle manque', () => {
        // Un evenement sans `properties` ne doit pas faire echouer la marque,
        // sinon il echappe a tous les filtres du projet partage.
        const e = normaliseEvent({} as { properties?: Record<string, unknown> }, null, 'https://maxguerois.com', '');
        expect(e!.properties!.site).toBe(SITE);
    });

    it('ne touche pas a l URL quand la page n est pas hors miroir', () => {
        const e = normaliseEvent({ properties: {} }, null, 'https://maxguerois.com', '?a=1');
        expect(e!.properties!.$current_url).toBeUndefined();
        expect(e!.properties!.$pathname).toBeUndefined();
    });

    it('reecrit $current_url et $pathname vers le chemin canonique', () => {
        const e = normaliseEvent({ properties: {} }, '/peptides', 'https://maxguerois.com', '');
        expect(e!.properties!.$current_url).toBe('https://maxguerois.com/peptides');
        expect(e!.properties!.$pathname).toBe('/peptides');
    });

    it('CONSERVE la chaine de requete, sinon utm_source disparait', () => {
        const e = normaliseEvent(
            { properties: {} },
            '/peptides',
            'https://maxguerois.com',
            '?utm_source=instagram'
        );
        expect(e!.properties!.$current_url).toBe(
            'https://maxguerois.com/peptides?utm_source=instagram'
        );
    });

    it('replie /fr/peptides sur /peptides : une seule page, pas deux', () => {
        // Sans ca, le taux de conversion est coupe en deux.
        const fr = normaliseEvent({ properties: {} }, '/peptides', 'https://maxguerois.com', '');
        const en = normaliseEvent({ properties: {} }, '/peptides', 'https://maxguerois.com', '');
        expect(fr!.properties!.$pathname).toBe(en!.properties!.$pathname);
    });
});

describe('analyticsEnabled', () => {
    it('refuse une cle vide, meme sur le bon hote', () => {
        expect(analyticsEnabled('maxguerois.com', '')).toBe(false);
    });

    it('accepte les deux hotes de production', () => {
        for (const h of ANALYTICS_HOSTS) expect(analyticsEnabled(h, 'phc_x')).toBe(true);
    });

    it('refuse localhost et les previews vercel', () => {
        expect(analyticsEnabled('localhost', 'phc_x')).toBe(false);
        expect(analyticsEnabled('gm-max-abc123.vercel.app', 'phc_x')).toBe(false);
    });
});

describe('initAnalytics', () => {
    const setHost = (hostname: string) => {
        // happy-dom autorise la reecriture de l'URL entiere.
        window.happyDOM?.setURL?.(`https://${hostname}/peptides`);
    };

    beforeEach(() => {
        vi.resetModules();
        window.__mgq = [];
        delete window.mgTrack;
    });

    afterEach(() => vi.unstubAllGlobals());

    it('n importe RIEN sur un hote inconnu', async () => {
        setHost('localhost');
        const mod = await import('posthog-js').catch(() => null);
        const spy = mod ? vi.spyOn(mod.default, 'init') : null;
        await initAnalytics();
        if (spy) expect(spy).not.toHaveBeenCalled();
        expect(window.mgTrack).toBeUndefined();
    });

    it('vide la file DANS L ORDRE et reprend la main sur mgTrack', async () => {
        setHost('maxguerois.com');
        const captured: Array<[string, unknown]> = [];
        vi.doMock('posthog-js', () => ({
            default: {
                init: vi.fn(),
                capture: (n: string, p: unknown) => captured.push([n, p]),
            },
        }));
        const { initAnalytics: init } = await import('../../src/lib/analytics');

        window.__mgq = [
            ['peptides_form_seen', { source: 'a' }],
            ['peptides_form_started', { source: 'a' }],
        ];
        await init();

        expect(typeof window.mgTrack).toBe('function');
        expect(captured.map((c) => c[0])).toEqual([
            'peptides_form_seen',
            'peptides_form_started',
        ]);
        // La file doit etre VIDEE, sinon un second appel rejouerait tout.
        expect(window.__mgq).toEqual([]);
    });

    it('REJETTE quand le chargement echoue : Layout doit attraper', async () => {
        setHost('maxguerois.com');
        vi.doMock('posthog-js', () => {
            throw new Error('blocked by client');
        });
        const { initAnalytics: init } = await import('../../src/lib/analytics');
        await expect(init()).rejects.toThrow();
    });
});
