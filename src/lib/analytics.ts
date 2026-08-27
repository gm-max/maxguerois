// analytics.ts — PostHog pour maxguerois.com
//
// GA4 (Layout.astro) repond a « combien de visites ». PostHog repond a « ou ils
// decrochent », qui est la seule question ouverte sur /peptides : le nombre
// d'inscrits, lui, est deja exact dans Supabase (`mg_subscribers`), pas ici.
//
// Les deux coexistent volontairement. GA4 porte cinq mois d'historique sur les
// articles ; PostHog part de zero. On ne coupe rien avant d'avoir un trimestre.

/**
 * Cle PUBLIQUE de projet (`phc_...`), pas un secret : PostHog la publie dans le
 * HTML de chaque page, exactement comme l'identifiant GA4 juste a cote. Elle
 * n'autorise que l'ECRITURE d'evenements, jamais la lecture.
 *
 * Vide = analytics desactivee, silencieusement et partout. C'est l'etat par
 * defaut tant que le projet PostHog n'existe pas, et c'est voulu : mieux vaut
 * zero evenement qu'un flux qui part dans le projet d'un autre produit.
 */
export const POSTHOG_KEY = '';

/** Instance UE. Les donnees ne quittent pas l'Europe. */
export const POSTHOG_HOST = 'https://eu.i.posthog.com';

/**
 * Hotes qui envoient des evenements. Tout le reste — localhost, les previews
 * `*.vercel.app` — est ignore a la source.
 *
 * Le projet Ouros a pris le chemin inverse : il capture tout, puis chaque
 * insight filtre `$host` a la main. Un seul insight qui oublie le filtre et le
 * chiffre est faux sans que rien ne le signale. Filtrer ici, c'est le faire une
 * fois.
 */
const ANALYTICS_HOSTS = ['maxguerois.com', 'www.maxguerois.com'];

type Props = Record<string, unknown>;

/**
 * File d'attente des evenements emis avant que posthog-js soit charge.
 *
 * Necessaire parce que le script de /peptides est `is:inline` : il s'execute
 * pendant l'analyse du document, alors que ce module-ci est differe. Sans file,
 * tout evenement declenche dans les premieres centaines de millisecondes — soit
 * exactement le debut de session qu'on veut mesurer — serait perdu.
 */
declare global {
    interface Window {
        mgTrack?: (name: string, props?: Props) => void;
        __mgq?: Array<[string, Props | undefined]>;
    }
}

/** Chemin canonique a rapporter, pose par Layout.astro sur les pages hors miroir. */
function canonicalPath(): string | null {
    return document.documentElement.getAttribute('data-analytics-path');
}

/**
 * posthog-js pese 257 ko. Un import statique les faisait entrer dans le bundle
 * de Layout.astro — donc dans CHAQUE page du site, telechargees meme quand
 * l'analytics est desactivee, parce qu'un `return` anticipe n'empeche pas un
 * module d'etre charge. L'import dynamique le sort du chemin critique et ne le
 * telecharge que la ou il sert vraiment.
 */
export async function initAnalytics(): Promise<void> {
    if (!POSTHOG_KEY) return;
    if (ANALYTICS_HOSTS.indexOf(window.location.hostname) === -1) return;

    const { default: posthog } = await import('posthog-js');

    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // On envoie la vue nous-memes, juste apres, pour pouvoir corriger le
        // chemin des pages servies a deux URL (voir plus bas).
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: true,
        persistence: 'localStorage+cookie',
    });

    // /peptides et /fr/peptides servent le MEME contenu sous deux URL. Sans
    // cette correction, PostHog les compte comme deux pages et coupe le taux de
    // conversion en deux — le meme piege que celui deja corrige sur GA4.
    const path = canonicalPath();
    posthog.capture(
        '$pageview',
        path
            ? { $current_url: window.location.origin + path, $pathname: path }
            : undefined
    );

    window.mgTrack = (name, props) => posthog.capture(name, props);
    const queued = window.__mgq || [];
    window.__mgq = [];
    for (const [name, props] of queued) posthog.capture(name, props);
}
