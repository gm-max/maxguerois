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
 * Vide = analytics desactivee, silencieusement et partout.
 *
 * ATTENTION — ce projet est PARTAGE avec ouros.health. Le plan gratuit de
 * PostHog n'autorise qu'un projet par organisation, et les deux organisations
 * existantes ont deja le leur (Ouros Health -> ouros.health, Ouros Lab ->
 * ouroslab.co). Faute d'un projet dedie, maxguerois.com ecrit dans celui
 * d'Ouros Health.
 *
 * Consequence : TOUTE tuile de ce projet doit porter `site = maxguerois.com` ET
 * `filterTestAccounts: false`. L'echec est heureusement BRUYANT : une tuile
 * creee sans y penser coche `filterTestAccounts` par defaut, et le filtre
 * interne du projet exclut maxguerois, donc elle affiche ZERO ligne. Vide et
 * manifestement faux, plutot que silencieusement melange.
 *
 * Sortir du partage n'est PAS un simple changement de cle : les deux tableaux
 * de bord, les definitions de proprietes et les reglages vivent dans le projet
 * PostHog, pas dans ce depot, et devront etre recrees. Voir TODOS.md.
 */
export const POSTHOG_KEY = 'phc_pcCeJf3P9FPTNjfKCKwQJXFAbxowHVdhkQ9EMYWpNc2p';

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
export const ANALYTICS_HOSTS = ['maxguerois.com', 'www.maxguerois.com'];

/**
 * Marque de provenance, posee sur CHAQUE evenement.
 *
 * On aurait pu filtrer sur `$host`, que PostHog remplit tout seul. Deux raisons
 * de ne pas le faire : il y a deux hotes valides (avec et sans `www.`), et il
 * est absent des evenements envoyes cote serveur. Une propriete explicite ne
 * depend ni du domaine ni du transport, et survivra a un changement de nom de
 * domaine.
 */
export const SITE = 'maxguerois.com';

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
 * Corrige un evenement AVANT son envoi. Exporte pour etre testable sans reseau.
 *
 * Un seul point de passage pour les deux corrections, et c'est ce qui les rend
 * fiables :
 *
 * 1. La marque de provenance. Elle etait posee par `register()` apres `init()`,
 *    ce qui creait une course : la vue de page d'ouverture — la seule que TOUT
 *    visiteur declenche — pouvait partir avant, donc sans marque, donc invisible
 *    a tous les filtres. Ici l'ordre ne peut plus se tromper.
 *
 * 2. L'URL canonique. Elle n'etait reecrite que sur la vue de page manuelle ;
 *    l'autocapture et les heatmaps de /fr/peptides portaient encore l'URL reelle
 *    et coupaient le jeu de donnees en deux pages distinctes. Trouve par une
 *    revue exterieure.
 *
 * `location.search` est CONSERVE : sans lui, `?utm_source=instagram`
 * disparaissait de `$current_url`.
 */
export function normaliseEvent<T extends { properties?: Props } | null>(
    event: T,
    path: string | null,
    origin: string,
    search: string
): T {
    if (!event) return event;
    const props: Props = event.properties || (event.properties = {});
    props.site = SITE;
    if (path) {
        props.$current_url = origin + path + search;
        props.$pathname = path;
    }
    return event;
}

/**
 * posthog-js pese 257 ko. Un import statique les faisait entrer dans le bundle
 * de Layout.astro — donc dans CHAQUE page du site, telechargees meme quand
 * l'analytics est desactivee, parce qu'un `return` anticipe n'empeche pas un
 * module d'etre charge. L'import dynamique le sort du chemin critique et ne le
 * telecharge que la ou il sert vraiment.
 *
 * REJETTE quand le chargement echoue. Layout.astro attrape : eu.i.posthog.com
 * est dans les listes de blocage par defaut d'uBlock et de Brave, donc l'echec
 * est le cas NORMAL pour une part reelle des visiteurs.
 */
export function analyticsEnabled(hostname: string, key: string = POSTHOG_KEY): boolean {
    if (!key) return false;
    return ANALYTICS_HOSTS.indexOf(hostname) !== -1;
}

export async function initAnalytics(): Promise<void> {
    if (!analyticsEnabled(window.location.hostname)) return;

    const { default: posthog } = await import('posthog-js');

    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // PostHog n'ecrit ni cookie ni localStorage. Il tient sa part du marche.
        //
        // MAIS LE SITE, LUI, ECRIT DES COOKIES. Ce commentaire a longtemps dit
        // « rien n'est ecrit chez le visiteur, donc rien a faire consentir, et
        // le site n'a aucune banniere ». La derniere partie etait vraie et les
        // deux premieres fausses : GA4 tourne juste a cote, sans condition, et
        // pose _ga et _ga_DR1W1B2VV5 des la premiere visite. Mesure le 30/08.
        //
        // Le choix sans-cookie ci-dessous n'achete donc RIEN aujourd'hui: on en
        // paie le prix, l'impossibilite de reconnaitre un visiteur d'un jour a
        // l'autre, sans en toucher le benefice. Il ne redeviendra utile que le
        // jour ou GA4 sera coupe. Ne pas lire ce bloc comme une preuve que le
        // site est sans cookie. L'entonnoir de
        // /peptides survit parce qu'il tient ENTIEREMENT dans un seul
        // chargement de page. Ce qu'on perd : reconnaitre un visiteur d'un jour
        // a l'autre, donc les tuiles comptent des VISITES, pas des personnes.
        persistence: 'memory',
        capture_pageleave: true,
        autocapture: true,
        before_send: (event: { properties?: Props } | null) =>
            normaliseEvent(
                event,
                canonicalPath(),
                window.location.origin,
                window.location.search
            ),
    } as Parameters<typeof posthog.init>[1]);

    window.mgTrack = (name, props) => posthog.capture(name, props);
    const queued = window.__mgq || [];
    window.__mgq = [];
    for (const [name, props] of queued) posthog.capture(name, props);
}
