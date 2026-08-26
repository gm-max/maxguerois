---
title: Landing dédiée /fr/peptides pour le funnel Instagram
date: 2026-08-26
status: approved, not implemented
branch: feat/supabase-capture
---

# Landing /fr/peptides

Page dédiée pour le trafic Instagram peptides. Un seul job : faire entrer un email.

**`/newsletter` et `/fr/newsletter` ne sont pas touchés.** Ils restent le blog et son
archive. La landing est une page neuve, à une URL neuve.

## Le virage du 26/08, et pourquoi

La version précédente de ce document refondait `/fr/newsletter` en landing. Deux
objections l'ont fait tomber, dans cet ordre.

**1. La page se lisait comme un média, pas comme un blog perso.** Le H1 nommait le
sujet, le nom retenu (« L'actu peptides ») nommait le sujet, la bio arrivait en
cinquième position sur deux lignes. Sur une page dont l'unique job est la confiance,
la seule chose infalsifiable — la personne — était reléguée en bas. Et la communauté,
qui est le vrai projet, n'apparaissait nulle part.

**2. Une page ne peut pas être à la fois le blog et son tunnel.** Refondre
`/fr/newsletter` obligeait à arbitrer entre montrer l'archive (preuve d'écriture,
mais look média et attention diluée) et la cacher (tunnel efficace, mais plus de
blog). Deux pages distinctes suppriment l'arbitrage : l'archive reste sur le blog,
la conversion vit sur la landing.

## Décisions

| # | Décision | Motif |
|---|---|---|
| 1 | La page d'abord, le numéro de lundi ensuite | choix de Max, contre ma recommandation inverse |
| 2 | Contenu en **français**, funnel FR de bout en bout | le seul canal d'acquisition actif est FR |
| 3 | ~~Structure B : promesse, formulaire, ce que tu reçois, guide, bio, archive~~ **remplacée par D11** | lisait comme un média, voir « Le virage » |
| 4 | Guide **gated** : décrit sur la page, envoyé dans le premier email | l'inscription devient la seule porte |
| 5 | **Formulaire natif**, plus d'iframe | l'élément central de la page doit être contrôlable |
| 6 | Cadence **hebdo, lundi**, engagement confirmé | promesse déjà live dans ManyChat depuis le 25/08 |
| 7 | Registre : **vouvoiement** | aligné sur Instagram, verrouillé le 17/08. **Déjà appliqué** à tout le FR par `e070d8c` |
| 8 | ~~Nom : « L'actu peptides »~~ **abandonné** | nom de média. La page porte le nom de Max, pas celui d'un produit |
| 9 | ~~Lien ManyChat → `/fr/newsletter`~~ **à repointer sur `/fr/peptides`** | conséquence directe de D11. Tant que ce n'est pas fait, le trafic IG atterrit sur l'archive |
| 10 | Capture dans **Supabase**, envoi par **beehiiv** | Max possède la liste ; beehiiv reste ce qui rend le lundi tenable. Inchangé |
| **11** | **Page dédiée `/fr/peptides`**, `/newsletter` et `/fr/newsletter` intacts | tranché le 26/08. Supprime l'arbitrage archive contre conversion |
| **12** | **Structure A : la personne d'abord, la communauté ensuite** | remplace D3. Répond aux 3 questions de l'inconnu dans l'ordre : qui, pourquoi je le crois, qu'est-ce que je rejoins |
| **13** | **Aucune mention d'Ouros Lab**, nulle part | marques étanches. Intégration plus tard |
| **14** | Landing **indexée**, meta différenciées de `/fr/newsletter` | le doublon sémantique est théorique, le trafic organique perdu serait réel |
| **15** | Succès : **le formulaire se remplace sur place**, pas de page `/merci` | pas de rechargement au moment le plus fragile ; Supabase compte déjà (D10) |

## Structure retenue (D12)

```
  ┌─ 1 · HÉROS ────────────────────────── écran 1, sans scroller ─┐
  │  portrait 116×150 │ label 12px   MAX GUÉROIS                  │
  │  (réel, pas rond) │ H1 52px      Je teste les peptides sur    │
  │                   │              moi, et je documente tout.   │
  │                   │ sub 17px     1 phrase, la communauté      │
  │  FORM             input email + bouton, ≤ 400 px du haut      │
  │  micro 13px       gratuit · désinscription · guide 1er email  │
  └───────────────────────────────────────────────────────────────┘
  ── 2 · POURQUOI MOI ──── 3 preuves en filets 1px, PAS de cartes
        Daily Mail, Bryan Johnson · Lucis, GC + YC · Zero Club
        + la ligne de posture : je ne vends aucun peptide
  ── 3 · LA LETTRE DU LUNDI ──── liste numérotée 1-2-3, texte seul
  ── 4 · LES MEETUPS ──── photo Zero Club + l'ambition, énoncée
        comme ambition et jamais comme un chiffre
  ── 5 · LE GUIDE ──── couverture 132px + 3 lignes
  ── 6 · FORM ──── rappel, formulé pour qui a tout lu
  ── 7 · DÉJÀ PUBLIÉ ICI ──── 3 articles, liste texte, sans vignette
```

**Pourquoi cet ordre.** Un inconnu venu d'Instagram se pose trois questions dans un
ordre fixe : c'est qui, pourquoi je le crois, qu'est-ce que je rejoins. La structure
répond dans cet ordre. Le formulaire est placé avant les réponses 2 et 3 pour ceux
qui sont déjà convaincus par le DM, et répété après pour ceux qui avaient besoin des
preuves.

**Pourquoi la section 7 est après le formulaire.** Ce sont des liens sortants. Ils
prouvent que le blog existe, mais chaque clic est un visiteur qui quitte la page sans
son email. Ils passent donc en dernier, en liste texte sans vignette, pour peser
visuellement dix fois moins qu'une grille de cartes.

**Ce qui n'entre pas.** Aucun numéro de newsletter n'est affiché. Les trois vrais
sont en anglais, hors sujet, le dernier date du 16 juillet. La section 7 montre des
**articles**, qui existent, sont en français, et sont datés honnêtement.

### Maquette

`~/.gstack/projects/gm-max-maxguerois/designs/fr-newsletter-personne-dabord-20260826/sketch-fr-peptides.html`

HTML réel, tokens DESIGN.md réels, polices réelles, photos réelles. Constructible tel
quel. Les bandeaux ambrés sont des annotations de review, pas des éléments de page.

## Copy retenue

| Bloc | Texte |
|---|---|
| label | MAX GUÉROIS |
| H1 | Je teste les peptides sur moi, et je *documente tout*. (*documente tout* en italique ambre) |
| sub | Chaque lundi, mes trouvailles de la semaine. On est déjà 1 000 à explorer ensemble, et ça ne fait que commencer. |
| bouton | Je m'inscris |
| micro | Gratuit. Désinscription en un clic. Le guide arrive dans le premier email. |
| H2 §2 | Je ne théorise pas. Je passe par la case cobaye. |
| preuve 1 | **Deux ans à vivre comme Bryan Johnson.** Le Daily Mail a raconté l'expérience en 2025. Depuis, je publie mes biomarqueurs, mes protocoles et mes ratés en public. |
| preuve 2 | **Co-fondateur de Lucis.** Une startup santé financée par General Catalyst, passée par Y Combinator. J'ai construit des produits de santé avec des médecins, pas avec des influenceurs. |
| preuve 3 | **Fondateur de Zero Club.** J'ai déjà rassemblé une communauté santé en France, en vrai, autour de bains froids et de rencontres mensuelles. Je sais faire venir des gens dans une pièce. |
| posture | **Je ne vends aucun peptide.** Aucun partenariat vendeur, aucun code promo, aucune commission. Si je change ça un jour, vous le lirez ici en premier. |
| H2 §3 | Ce que vous recevez, chaque semaine. |
| §3 items | 1. **Une étude de la semaine.** Ce qu'elle prouve, et surtout ce qu'elle ne prouve pas. 2. **Un peptide décrypté.** Ce qu'il fait, pour qui, ce qu'il coûte, et ce qu'on ignore encore. 3. **Une alerte marché.** Un vendeur, un produit ou une pratique à connaître avant de commander. |
| H2 §4 | Et bientôt, on se voit en vrai. |
| §4 | Avec Zero Club, j'ai réuni des dizaines de personnes autour de bains froids, tous les mois, pendant deux ans. La même chose arrive pour les peptides, à Paris d'abord. / Mon objectif est simple : faire de ce groupe la plus grande communauté peptides de France. Les inscrits sont prévenus en premier, et entrent gratuitement. |
| H2 §6 | On commence lundi. |

**La ligne de posture est la plus importante de la page.** Sur un marché où tout le
monde touche une commission vendeur, « je ne vends aucun peptide » est le seul
argument que vos concurrents ne peuvent pas copier sans mentir. Elle était noyée dans
une bio de deux lignes en cinquième position ; elle est maintenant la conclusion du
bloc de preuves.

**Les trois preuves existent toutes sur le site.** Aucune n'est inventée : Daily Mail,
General Catalyst et Y Combinator sont déjà listés en section Presse de `/fr`, et Zero
Club en section Work. La photo du bloc meetup est `zeromeetup-182.webp`, une vraie
photo d'un vrai meetup.

**« La plus grande communauté peptides de France » est énoncée comme objectif, jamais
comme état.** « Mon objectif est simple : faire de… » est vrai aujourd'hui. « La plus
grande communauté peptides de France » comme H1 ne le serait pas, et une page qui ne
vend que la confiance ne peut pas s'offrir une première phrase invérifiable.

## États d'interaction (D15)

Ce que le visiteur **voit**, pas ce que le serveur fait.

| État | Ce qui s'affiche | Détail |
|---|---|---|
| repos | input vide, placeholder `votre@email.com`, bouton ambre actif | label `<label>` visible au-dessus, pas un placeholder-as-label |
| saisie invalide | bordure input passe à `--accent`, message 13px sous le champ : « Cet email n'a pas l'air valide. » | validation au `blur`, jamais à chaque frappe |
| envoi | bouton désactivé, texte → « Une seconde… », `aria-busy="true"` | pas de spinner, pas de skeleton |
| succès | **le bloc formulaire entier est remplacé** par : « C'est fait. Le guide part maintenant vers votre boîte mail, regardez aussi dans les spams. À lundi. » Focus déplacé sur le message, `role="status"` | l'instruction spam arrive là où elle sert, elle protège la délivrabilité du seul email qui porte le guide |
| déjà inscrit | même message de succès, mot à mot | ne jamais révéler qu'un email est en base. Fuite de données, et le visiteur s'en fiche |
| erreur serveur | « Ça n'a pas marché de notre côté. Réessayez, ou écrivez-moi à hi@maxguerois.com. » Formulaire conservé, valeur saisie conservée | ne jamais vider le champ sur erreur |
| rate-limit | même message qu'erreur serveur | ne pas expliquer la limite, ça donne la carte au robot |
| JS désactivé | le `<form>` poste en natif vers `/api/subscribe`, qui répond une page de confirmation minimale | le formulaire doit marcher sans JS, c'est un `<form>` |

**Le rechargement après succès reperd le message.** Accepté : un visiteur qui recharge
après inscription est un cas rare, et le premier email arrive dans la minute.

## Parcours et arc émotionnel

| # | Le visiteur fait | Ce qu'il ressent | Ce qui le soutient |
|---|---|---|---|
| 1 | clique le lien du DM ManyChat | méfiance par défaut, il ne vous connaît pas | un visage et un prénom en premier, pas un logo |
| 2 | lit le H1 | « ok, ce type le fait sur lui » | première personne, verbe d'action, promesse d'exposition |
| 3 | voit le formulaire | hésitation : je donne mon email pour quoi | la micro-ligne dit gratuit, réversible, et ce qui arrive tout de suite |
| 4 | scrolle vers les preuves | cherche la faille | trois preuves cliquables et vérifiables en une seconde |
| 5 | lit la ligne de posture | soulagement, ce n'est pas un vendeur déguisé | la seule promesse que la concurrence ne peut pas copier |
| 6 | lit le bloc meetups | curiosité, projection | une photo réelle d'un vrai meetup, pas une illustration |
| 7 | s'inscrit | engagement | confirmation immédiate, instruction spam, date précise |
| 8 | reçoit le guide | vérification que la promesse tient | l'email arrive dans la minute, pas lundi |

**Les trois horizons.** À 5 secondes, un visage et une phrase à la première personne
suffisent à ne pas repartir. À 5 minutes, les preuves et la posture décident de
l'inscription. À 5 ans, la communauté et les meetups sont ce qui fait rester ; c'est
exactement ce que la version média de la page ne pouvait pas promettre.

**Le guide part immédiatement, pas lundi.** Quelqu'un qui s'inscrit un jeudi doit
recevoir quelque chose le jeudi. Le welcome email beehiiv porte le guide
(`send_welcome_email: true`), le numéro hebdo est un envoi séparé. Sans ça, la page
promet une récompense immédiate et fait attendre quatre jours.

## Responsive

| | ≥ 900 px | 600–900 px | < 600 px |
|---|---|---|---|
| colonne | 620px centrée | 620px, gouttières 24px | pleine largeur, gouttières 22px |
| héros | portrait à gauche, texte à droite | idem | **portrait au-dessus du texte**, pas à côté : à 375px un portrait latéral laisse 200px au H1, ce qui casse « peptides » en deux lignes |
| H1 | 52px | `clamp` | 38px plancher |
| formulaire | input + bouton sur une ligne, max 480px | idem | **empilés**, bouton pleine largeur, hauteur 44px chacun |
| guide | couverture à gauche, texte à droite | idem | couverture au-dessus |
| section 7 | titre à gauche, date à droite sur une ligne | idem | date sous le titre, `white-space` relâché |
| interstice sections | 80px (`--sp-20`) | 80px | 64px (`--sp-16`) |

Ce ne sont pas des « éléments empilés sur mobile ». Trois blocs changent de logique
de disposition, pas seulement de direction de flex.

## Accessibilité

- **Labels visibles.** `<label for>` au-dessus de chaque input. Le placeholder n'est
  jamais l'unique label : il disparaît dès la première frappe et l'utilisateur perd
  le contexte.
- **Cibles tactiles 44×44 minimum.** Input 44px de haut, bouton 44px, liens de la
  section 7 avec un padding vertical de 16px.
- **Contraste.** Texte sur `--bg` conforme WCAG AA. Le bouton ambre est l'exception, et
  elle est mesurée, pas supposée :

  | Combinaison | Ratio | AA (4,5:1) |
  |---|---|---|
  | `#fff` sur `#c4934a` (clair) | **2,76:1** | échoue |
  | `#1a1a1a` sur `#c4934a` (clair) | **6,31:1** | passe |
  | `#fff` sur `#d4a55e` (sombre) | **2,25:1** | échoue |
  | `#1a1a1a` sur `#d4a55e` (sombre) | **7,74:1** | passe |

  Passer le texte du bouton en `#1a1a1a` règle les deux modes d'un coup, sans toucher
  à l'ambre. C'est la correction recommandée.

  **Ce défaut n'est pas propre à cette page.** DESIGN.md spécifie le bouton Accent
  comme `background: var(--accent); color: #fff`, et le CTA newsletter utilise ce
  bouton partout sur le site. Le corriger ici sans corriger DESIGN.md créerait une
  divergence ; le corriger dans DESIGN.md change le bouton sur tout le site. Le
  périmètre de la correction est la décision non tranchée ci-dessous.
- **Focus.** `:focus-visible` avec contour `--accent`, offset 2px, sur input, bouton
  et les trois liens d'article.
- **Annonce du succès.** Le message de confirmation porte `role="status"` et reçoit
  le focus, sinon un lecteur d'écran ne saura jamais que l'inscription a fonctionné.
- **Erreurs.** Message lié à l'input via `aria-describedby`, `aria-invalid="true"` sur
  le champ.
- **Mouvement réduit.** `prefers-reduced-motion: reduce` désactive l'entrée `fadeUp`,
  conformément à DESIGN.md.
- **Images.** Le portrait porte `alt="Max Guérois"`. La photo meetup porte un alt
  descriptif, pas décoratif : elle porte de l'information.

## Conformité DESIGN.md

| Règle | Statut |
|---|---|
| Cormorant Garamond display, DM Sans body | respecté, aucune police système |
| Colonne unique 620px | respecté |
| Ambre `#c4934a` parcimonieux | respecté : italique du H1, bouton, chiffres de liste, survol. Rien d'autre |
| Pas de grille de cartes | respecté, filets 1px partout |
| Pas de rangée 3 colonnes | respecté, les 3 preuves sont empilées verticalement |
| Pas de dégradé | respecté |
| Tokens `--sp-*`, `--duration-*`, `--ease-out` | à utiliser à l'implémentation, aucune valeur en dur |
| Cible tactile 44×44 | respecté |
| Contraste AA | **une exception à traiter**, le bouton ambre, voir Accessibilité |

**Nouveau composant introduit :** la ligne de preuve en filet (titre Cormorant 21px +
description DM Sans 14px, séparée par `border-bottom: 1px solid var(--border)`). Elle
n'existe pas dans DESIGN.md. Elle est proche du « Writing Item » existant mais sans
encapsulation en carte, ce qui est justement le point. **À ajouter à DESIGN.md** si la
page est validée, sinon elle deviendra une divergence silencieuse.

**Violation existante repérée hors périmètre :** `/fr/newsletter` et `/newsletter`
affichent leur archive en grille de cartes à vignettes 16/9, ce que DESIGN.md interdit
explicitement. Ces pages ne sont pas dans le périmètre (D11) et ne sont pas modifiées.
Signalé, pas corrigé.

## Architecture de capture (D10 capture, D16 envoi)

Le formulaire ne poste pas chez beehiiv. Il poste chez nous.

```
  <form> natif  →  POST /api/subscribe  (route Astro, SSR)
                     1. valide + honeypot + rate-limit par IP
                     2. upsert Supabase        ← source de vérité, bloquant
                     3. await API d'envoi      ← awaited, PAS fire-and-forget
                     4. 200 quoi qu'il arrive côté envoi
```

**D16, tranchée le 26/08 après la review d'ingénierie : beehiiv est abandonné comme
couche d'envoi, au profit de Resend.** Cela remplace la moitié « envoi » de D10 ; la
moitié « capture » est inchangée.

Ce qui a fait basculer la décision : garder deux systèmes était la racine de quatre
des huit remarques de la voix extérieure. Réconciliation quotidienne nécessaire,
écart entre « accepté par beehiiv » et « réellement abonné », rejeu non idempotent
pouvant renvoyer des emails de bienvenue en double, et deux chemins d'inscription
coexistant sur le site. Aucune n'existe avec un seul système.

Le déclencheur factuel : `unsubscribed_at` n'était jamais écrit par personne, donc la
phrase « Supabase est la source de vérité » était fausse. Avec Resend, l'endpoint de
désinscription est le nôtre et écrit la colonne directement, sans latence ni second
système. C'est moins de travail que le job de réconciliation qu'exigeait beehiiv.

Migration : 88 abonnés actifs, 92 inscrits, 4 désinscrits. Ces 4 sont la donnée
critique du transfert. `maxguerois.com` doit être vérifié chez Resend ; seul
`ouroslab.co` l'est aujourd'hui.

**Note sur le diagramme ci-dessus :** l'appel d'envoi est `await`, pas `after()`.
Astro n'a pas d'équivalent à `after()`, et la cicatrice d'ouros-reddit-scam (5 ajouts
d'audience sur 20 et 13 emails de bienvenue sur 20 perdus par destruction du
serverless) impose de ne rien lancer sans l'attendre.

**Supabase est la source de vérité.** Une panne de la couche d'envoi ne doit jamais
faire échouer une inscription : l'email est déjà chez nous, `sync_error` garde la
trace, la synchro se rattrape.
## Ce qui existe déjà et doit être réutilisé

| Actif | Où | Usage sur la landing |
|---|---|---|
| Tokens, polices, dark mode | `src/styles/global.css` | tout, aucune valeur en dur |
| `Layout.astro` | `src/layouts/` | coquille de page, meta, OG |
| Portrait | `public/profile.webp` | héros |
| Photo meetup Zero Club | `public/health-journey/zeromeetup-182.webp` | bloc meetups |
| Preuves Daily Mail, GC, YC | section Presse de `src/pages/fr/index.astro` | URLs des 3 preuves |
| Route `/api/subscribe` | `src/pages/api/subscribe.ts` | déjà écrite, testée sur preview |
| Articles FR | `src/content/experiments/fr/*.json` | section 7 : retatrutide (16/07/26), supplements (09/04/26), max-biomarkers (08/05/26) |

**Ce qui n'est pas réutilisé, volontairement :** `NewsletterEmbed.astro`. La landing
utilise un `<form>` natif (D5). L'embed beehiiv reste en place partout ailleurs.

## Hors périmètre

| Écarté | Pourquoi |
|---|---|
| Refonte de `/newsletter` et `/fr/newsletter` | D11. Ils restent le blog |
| Grille de cartes de ces deux pages, qui viole DESIGN.md | hors périmètre, signalé seulement |
| Toute mention d'Ouros Lab | D13, intégration plus tard |
| Page `/fr/peptides/merci` | D15, remplacement en place |
| Affichage de numéros de newsletter | aucun numéro peptides FR n'existe encore |
| Version EN de la landing | le seul canal d'acquisition actif est FR |
| Compteur d'inscrits en direct | « 1 000+ » suffit, un compteur live est une dépendance pour un gain nul |

## Prérequis avant implémentation

1. ~~Vérifier l'endpoint beehiiv~~ **fait le 26/08**, remplacé par l'API officielle
2. Créer le projet Supabase `maxguerois` + table `subscribers` ; ajouter
   `@astrojs/vercel` ; poser `SUPABASE_SERVICE_ROLE_KEY` et `BEEHIIV_API_KEY` en
   variables Vercel (jamais `PUBLIC_`)
3. **Supprimer les 2 abonnés de test** dans beehiiv, à la main (le MCP n'a pas
   d'outil de suppression) : `maximeguerois+beehiivtest@gmail.com` et
   `maximeguerois+utmtest@gmail.com`
4. Écrire le premier numéro, sans quoi la promesse du lundi n'est pas tenable
5. **Repointer le lien ManyChat sur `/fr/peptides`.** Bloquant : sans ça, tout le
   trafic Instagram continue d'arriver sur l'archive
6. Produire la couverture du guide (aucun asset n'existe, la maquette montre un
   placeholder)
7. ~~Passer le FR au vouvoiement~~ **fait**, commit `e070d8c`, 0 occurrence de
   tutoiement restante

## Implementation Tasks

Synthétisé depuis les trouvailles de cette review. Chaque tâche vient d'une trouvaille.

- [ ] **T1 (P1, human: ~3h / CC: ~25min)** — page — Créer `/fr/peptides` selon la structure D12
  - Surfacé par : Pass 1, hiérarchie 4/10, la personne était en cinquième position
  - Fichiers : `src/pages/fr/peptides.astro`
  - Vérifier : la maquette et la page rendue se superposent aux 3 breakpoints
- [ ] **T2 (P1, human: ~1h30 / CC: ~15min)** — formulaire — Implémenter les 8 états d'interaction
  - Surfacé par : Pass 2, états 3/10, quatre états non spécifiés dans le doc précédent
  - Fichiers : `src/pages/fr/peptides.astro`, `src/pages/api/subscribe.ts`
  - Vérifier : chaque ligne du tableau États reproduite à la main, JS désactivé inclus
- [ ] **T3 (P1, human: ~10min / CC: ~2min)** — a11y — Passer le texte du bouton accent en `#1a1a1a`
  - Surfacé par : Pass 6, `#fff` sur `#c4934a` = 2,76:1 et sur `#d4a55e` = 2,25:1, échouent AA
  - Fichiers : `src/styles/global.css`, `DESIGN.md` si la correction est globale
  - Vérifier : ratio mesuré ≥ 4,5:1 en clair ET en sombre
- [ ] **T4 (P1, human: ~5min / CC: —)** — funnel — Repointer ManyChat sur `/fr/peptides`
  - Surfacé par : D9 invalidée par D11
  - Fichiers : aucun, action dans ManyChat
  - Vérifier : cliquer le lien depuis un DM réel
- [ ] **T5 (P2, human: ~45min / CC: ~10min)** — responsive — Les 3 bascules de disposition
  - Surfacé par : Pass 6, héros, formulaire et guide changent de logique sous 600px
  - Fichiers : `src/pages/fr/peptides.astro`
  - Vérifier : 375px, 768px, 1280px
- [ ] **T6 (P2, human: ~20min / CC: ~5min)** — meta — Titres et descriptions différenciés de `/fr/newsletter`
  - Surfacé par : D14, risque de cannibalisation en recherche
  - Fichiers : `src/pages/fr/peptides.astro`, `src/pages/sitemap.xml.ts`
  - Vérifier : la page est au sitemap, les deux `<title>` ne se ressemblent pas
- [ ] **T7 (P3, human: ~15min / CC: ~5min)** — design system — Documenter la ligne de preuve en filet dans DESIGN.md
  - Surfacé par : Pass 5, nouveau composant hors vocabulaire existant
  - Fichiers : `DESIGN.md`
  - Vérifier : entrée présente dans Components + Key Decisions Log
- [ ] **T8 (P3, human: ~1h / CC: —)** — asset — Produire la couverture du guide
  - Surfacé par : Pass 4, la maquette porte un placeholder
  - Fichiers : `public/`
  - Vérifier : l'image rend correctement en 132×180

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 1 | ISSUES_FOUND | 8 remarques, 2 vérifiées et confirmées, 1 a renversé la couche d'envoi |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | ISSUES_OPEN (DIFF) | 7 constats, 7 tranchés, 6 corrigés et 1 différé ; 39 tests ajoutés |
| Design Review | `/plan-design-review` | UI/UX gaps | 2 | ISSUES_FOUND | 7 dimensions sur 7, 4/10 → 9/10, 8 décisions ajoutées, 1 périmètre repivoté |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**Scores par passe (design) :**

| Passe | Avant | Après |
|---|---|---|
| 1 · Architecture de l'information | 4/10 | 9/10 |
| 2 · États d'interaction | 3/10 | 9/10 |
| 3 · Parcours et arc émotionnel | 5/10 | 9/10 |
| 4 · Risque de slop IA | 7/10 | 9/10 |
| 5 · Conformité DESIGN.md | 6/10 | 8/10 |
| 6 · Responsive et accessibilité | 2/10 | 8/10 |
| 7 · Décisions non tranchées | — | 8 résolues, 1 différée |

**Eng review, périmètre et résultat.** Portée sur le diff de branche ET le schéma
Supabase, parce que la migration avait été appliquée directement dans le cloud et
qu'une review du seul diff serait passée à côté. Sept constats, tous tranchés :
open redirect (corrigé), réinscription après désinscription en échec silencieux
(corrigé), schéma absent du dépôt (corrigé), limite de débit pouvant mourir en
silence (corrigé), entrées non typées et non bornées (corrigé), zéro test (39 ajoutés),
purge du compteur (différée avec seuil dans TODOS.md).

Les quatre corrections de comportement ont été **testées négativement** : bug
réintroduit, suite relancée, échec constaté. 6, 1, 1 et 6 tests tombent respectivement.
Un garde-fou non vérifié de cette façon est un garde-fou supposé.

**CODEX :** 8 remarques, dont 2 vérifiées ligne à ligne avant d'être retenues.
`unsubscribed_at` n'est écrit par personne, et `/api/subscribe` n'a aucun appelant
dans `src/` alors que 21 fichiers utilisent encore l'iframe beehiiv.

**CROSS-MODEL :** tension réelle sur D10. L'eng review a validé une route propre en
tenant pour acquis que Supabase était la source de vérité ; Codex a montré que cette
phrase était fausse, et c'est elle qui justifiait l'architecture. Résolu par D16 en
faveur de Codex, avec un chemin que Codex ne pouvait pas connaître (Resend est déjà
en place sur les deux autres produits, donc pas besoin des webhooks beehiiv réservés
aux offres supérieures).

**VERDICT :** DESIGN + ENG ont tourné. Eng review non CLEAR : 4 décisions restent
ouvertes, dont une conformité légale qui conditionne la landing page.

**UNRESOLVED DECISIONS:**
- Consentement CNIL sur `/fr/peptides` : case à cocher dédiée non pré-cochée, lien vers une politique de confidentialité, mention du sous-traitant d'envoi, et conservation de la preuve du consentement. Bloquant pour une newsletter B2C française.
- Course sur la limite de débit : `count` puis `insert` ne sont pas atomiques, donc N requêtes simultanées d'une même IP passent toutes. À régler par une fonction serveur atomique ou à accepter explicitement.
- Attribution écrasée : l'upsert remplace `source` et `utm_*` à chaque réinscription, donc le premier contact est perdu. Colonnes first/last séparées, ou table d'événements append-only.
- Périmètre de la correction du bouton accent : uniquement sur `/fr/peptides`, ou dans `DESIGN.md` et donc sur tout le site
