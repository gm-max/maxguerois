---
title: NewsletterEmbed, de l'iframe beehiiv au formulaire natif
date: 2026-08-26
status: brief pour la session parallèle
author: session /fr/peptides
---

# Brief : faire pointer `NewsletterEmbed` sur `/api/subscribe`

Écrit par la session qui a construit `/fr/peptides`. **Je ne touche à aucun des
fichiers listés ici** : ils sont à vous. Ceci est la liste de ce que j'ai déjà payé,
pour que vous ne le repayiez pas.

Le formulaire natif de `/fr/peptides` tourne, il est vérifié en navigateur et couvert
par 66 tests. Servez-vous-en comme référence, ou remplacez-le : l'important est
qu'il n'en reste **qu'un** sur le site à la fin.

## La surface réelle

`NewsletterEmbed` est appelé **40 fois sur 20 pages** : accueil EN et FR, les deux
index newsletter, et **deux fois par article** (milieu et pied). `SubscribeModal`
l'enveloppe et est monté par `Layout.astro` sur toutes les pages sauf `/404`.

Conséquence heureuse : **un seul fichier à réécrire, zéro page à toucher.** Gardez la
signature (`locale`, `minimal`, `deferSrc`) et les 40 appels continuent de marcher.

## Les six pièges, dans l'ordre où ils mordent

### 1. `deferSrc` perd tout son sens

Il existe pour ne pas charger l'iframe d'une modale qui ne s'ouvrira peut-être
jamais. Sans iframe, il n'y a plus rien à différer. **Gardez le prop** (la modale le
passe) mais faites-en un no-op documenté, sinon le jour où quelqu'un le lit il
cherchera un comportement qui n'existe plus.

### 2. La CSP doit être nettoyée APRÈS, jamais avant

`vercel.json` autorise encore `subscribe-forms.beehiiv.com` dans `script-src` **et**
`frame-src`. Retirer ces entrées avant que les 20 pages aient basculé casse l'iframe
encore en place. Ordre : basculer le composant, déployer, vérifier, **puis** retirer
les deux entrées CSP et les deux `preconnect`/`dns-prefetch` de `Layout.astro:166-167`.

### 3. Un script par formulaire, ou un script par page

`/fr/peptides` porte quatre formulaires et **un seul comportement**, qui les lie tous
par `form[data-subscribe]`. Quatre copies divergeraient, et la première à diverger
serait celle de la modale, qu'on ouvre le moins souvent.

Chez vous c'est pire : deux formulaires par article. Si vous mettez le script dans
`NewsletterEmbed`, il sera **inclus deux fois par page**. Un `<script>` Astro non
`is:inline` est hissé et dédupliqué automatiquement ; un `is:inline` ne l'est pas.
J'ai utilisé `is:inline` dans `/fr/peptides` parce que la page n'a qu'une instance du
bloc. Ce n'est pas votre cas.

### 4. Une page statique ne peut pas afficher `?ok=1`

Sans JavaScript, `/api/subscribe` renvoie un 303 vers la page d'origine avec `?ok=1`
ou `?error=…`. **Une page prérendue ne verra jamais ces paramètres** : elle est
construite au déploiement.

C'est le piège qui m'a coûté le plus. Une revue extérieure a proposé de rendre l'état
côté serveur, ce qui ne s'appliquait pas tant que la page était statique. J'ai fini
par passer `/fr/peptides` en `prerender = false` avec un
`Cache-Control: s-maxage=300, stale-while-revalidate=86400`, Vercel indexant son
cache edge sur l'URL complète.

**Vous ne pouvez pas faire ça pour 20 pages.** Les options réalistes :
- une petite page de confirmation rendue à la demande, vers laquelle `/api/subscribe`
  redirige les appelants sans JS ;
- ou assumer que le visiteur sans JS ne voit pas de confirmation, et l'écrire.

Ce qu'il ne faut pas faire, c'est laisser le 303 pointer vers une page statique et
croire que le cas est traité.

### 5. `RETURN_PATHS` a déjà vos clés

`src/pages/api/subscribe.ts` connaît `fr`, `en` et `fr-peptides`. Les deux premières
renvoient vers `/fr/newsletter` et `/newsletter`. Si vous voulez qu'une inscription
depuis l'accueil revienne sur l'accueil, il faut une clé de plus : c'est une
**whitelist**, pas une URL fournie par l'appelant, et c'était une correction de
sécurité (`?redirect=https://evil.com` sortait du domaine).

### 6. La modale perd les trois quarts de son code

`SubscribeModal.astro` fait 306 lignes dont l'essentiel existe pour dompter l'iframe :
la mesure de hauteur, le repli à 2000 px, la fermeture par `visibility` et non
`display:none` parce qu'un sous-arbre en `display:none` n'a pas de layout et que
beehiiv mesurait 0. **Tout ça disparaît avec l'iframe.**

Ce qui doit rester : le `<dialog>` natif (pour qu'Échap fonctionne), le délai de 8 s,
l'affichage une seule fois par visiteur via `localStorage`, et la cible tactile de
44×44 sur la fermeture.

Un défaut trouvé après coup sur `/fr/peptides`, à ne pas reproduire : **le minuteur
n'était pas annulé après une inscription réussie.** Quelqu'un qui s'inscrivait à
t=3 s se faisait redemander à t=8 s exactement ce qu'il venait de faire.

## Le contrat des huit états

Ce que le visiteur **voit**. C'est la partie qui compte, et c'est celle qu'on bâcle.

| État | Ce qui s'affiche |
|---|---|
| repos | `<label>` visible au-dessus, jamais un placeholder seul |
| saisie invalide | bordure accent + message sous le champ, **au `blur`**, jamais à chaque frappe |
| envoi | bouton désactivé, « Une seconde… », `aria-busy="true"` |
| succès | le bloc formulaire **entier** est remplacé, focus déplacé, `role="status"` |
| déjà inscrit | message de succès **mot pour mot** : ne jamais révéler qu'un email est en base |
| erreur serveur | message + **valeur saisie conservée**, ne jamais vider le champ |
| rate-limit | même message qu'erreur serveur : ne pas expliquer la limite au robot |
| sans JS | le `<form>` poste en natif, voir le piège 4 |

Deux règles mobiles non négociables : `font-size` de l'input **≥ 16 px** (en dessous,
Safari iOS zoome au focus et décale la page au moment où l'on tape son email), et
`inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false"`.

## Ce qu'il faudra vérifier

- Les 40 appels rendent encore : accueil EN et FR, les deux index, un article au hasard
- Deux formulaires sur la même page ne se marchent pas dessus, et le script n'est
  chargé qu'une fois
- `document.querySelectorAll('iframe.beehiiv-embed').length === 0` sur chaque gabarit
- La modale s'ouvre, Échap la ferme, elle ne revient pas après une inscription
- `npm run build` passe, garde CSP comprise
- **Et seulement ensuite** : retirer beehiiv de `vercel.json` et du `Layout`

## Ce que je ne toucherai pas

`NewsletterEmbed.astro`, `SubscribeModal.astro`, `Layout.astro`, `vercel.json`,
`src/i18n/*.json`. Ils sont à vous jusqu'à ce que vous ayez livré.
