---
title: Refonte /fr/newsletter en landing du funnel Instagram peptides
date: 2026-08-26
status: approved, not implemented
branch: main
---

# Refonte /fr/newsletter

Landing page pour le trafic Instagram peptides. Un seul job : faire entrer un email.

## Décisions prises

| # | Décision | Motif |
|---|---|---|
| 1 | La page d'abord, le numéro de lundi ensuite | choix de Max, contre ma recommandation inverse |
| 2 | Newsletter en **français**, DM ManyChat redirigé sur `/fr/newsletter` | le seul canal d'acquisition actif est FR ; il pointe aujourd'hui sur la page EN |
| 3 | Structure B : promesse, formulaire, ce que tu reçois, guide, bio, archive | garde une preuve sans exposer les articles hors-angle |
| 4 | Guide **gated** : décrit sur la page, envoyé dans le premier email | l'inscription devient la seule porte |
| 5 | **Formulaire natif**, plus d'iframe | l'élément central de la page doit être contrôlable |
| 6 | Cadence **hebdo, lundi**, engagement confirmé | promesse déjà live dans ManyChat depuis le 25/08 |
| 7 | Registre : **vouvoiement** | aligne le site sur Instagram, verrouillé côté IG le 17/08 |
| 8 | Nom : **L'actu peptides** | nomme le sujet, pas la personne |
| 9 | Lien ManyChat → `/fr/newsletter` | **fait**, confirmé par Max le 26/08 |
| 10 | Capture dans **Supabase**, envoi par **beehiiv** | Max possède la liste ; l'éditeur beehiiv reste ce qui rend le lundi tenable. Tranché le 26/08, remplace le POST direct de D5 |

## Structure retenue

```
  kicker        NEWSLETTER · TOUS LES LUNDIS          <- à supprimer, redondant
  H1     52px   L'actu des peptides, décryptée.
  sub    18px   1 ligne max  (3 lignes dans la maquette = trop)
  FORM          input email + bouton, dans les 400 premiers px
  micro  13px   gratuit · désinscription · le guide arrive dans le 1er email
  ───
  H2            Ce que vous recevez lundi
                1. une étude de la semaine, ce qu'elle prouve et ne prouve pas
                2. un peptide décrypté : ce qu'il fait, pour qui, ce qu'il coûte
                3. une alerte marché : un vendeur, un produit, une pratique
  ───
  GUIDE         couverture + "Offert à l'inscription" + 3 lignes
  ───
  BIO           2 lignes, testé sur moi, je ne vends aucun peptide
  ───
  ARCHIVE       ⚠ SUPPRIMÉ jusqu'à avoir 3 vrais numéros peptides
  ───
  FORM          répétition + preuve sociale
```

## Notes de review (3 dimensions sur 7, par choix de Max)

**Hiérarchie 7/10.** Trois arrêts avant l'action, et le kicker répète le H1.
Pour un 10 : sous-titre à une ligne, kicker supprimé, formulaire dans les 400 px.

**Parcours 5/10.** La promesse correspond au DM, c'est acquis. Mais le bloc archive
de la maquette affichait trois numéros datés qui **n'existent pas**. Les 3 vrais sont
en anglais, hors sujet, le dernier du 16 juillet. Le bloc est retiré jusqu'au
troisième lundi réellement publié.

**États 3/10.** La maquette dessinait un formulaire non constructible avec l'iframe.
D'où la décision 5. Les quatre états restent à spécifier : envoi, email invalide,
déjà inscrit, succès.

## Non couvert par cette review

Responsive détaillé, risque de slop IA, accessibilité fine, conformité complète à
DESIGN.md. Max a choisi 3 dimensions sur 7.

## Contraintes DESIGN.md à respecter

Tokens `--sp-*`, `--duration-*`, `--ease-out`. Cible tactile 44×44. Contraste WCAG AA.
Cormorant Garamond en display, DM Sans en body. Accent ambre `#c4934a` parcimonieux.
Pas de grille de cartes, pas de rangée 3 colonnes, pas de dégradé.

## Architecture de capture (D10, tranchée le 26/08)

Le formulaire ne poste plus chez beehiiv. Il poste chez nous.

```
  <form> natif  →  POST /api/subscribe  (route Astro, SSR)
                     1. valide + honeypot + rate-limit par IP
                     2. upsert Supabase        ← source de vérité, bloquant
                     3. after(): API beehiiv   ← envoi, non bloquant
                     4. 200
```

**Supabase est la source de vérité.** Une panne beehiiv ne doit jamais faire échouer
une inscription : l'email est déjà chez nous, la synchro se rattrape.

**Projet Supabase dédié.** Ni Ouros Lab ni ouros-health. Deux raisons, la seconde
est la plus concrète :

- ce sont trois surfaces isolées, et le daily le tient déjà comme un invariant ;
- `lab.subs_total` compte la table `subscribers` du projet Ouros Lab
  (`vps/bin/founder_card.py:210`). Y écrire les abonnés perso gonflerait le chiffre
  Ouros Lab du rapport quotidien, en silence.

Un troisième projet coûte **0 $/mois** sur l'organisation actuelle (vérifié).

**Endpoint beehiiv officiel** (remplace l'endpoint non documenté) :

```
POST https://api.beehiiv.com/v2/publications/{publicationId}/subscriptions
Authorization: Bearer <API_KEY>
body: { email, utm_source, utm_medium, utm_campaign, referring_site,
        send_welcome_email, custom_fields }
```

`utm_*` alimente `acquisition_source`, comme sur l'endpoint précédent : le funnel
Instagram reste traçable. `send_welcome_email` porte l'envoi du guide.

**La cicatrice à ne pas rouvrir.** Dans `ouros-reddit-scam/app/api/subscribe/route.ts`,
les appels tiers ont d'abord été lancés sans `await` : le serverless détruit la fonction
dès la réponse renvoyée, ce qui a tué la requête en vol et perdu **5 ajouts d'audience
sur 20 et 13 emails de bienvenue sur 20**, au hasard et indépendamment. Tout effet de
bord passe par `after()`.

**Ce que ça supprime :** le risque « beehiiv ferme l'endpoint non documenté ou active
la vérification CSRF, et les inscriptions échouent en silence ». On est sur le chemin
supporté.

**Ce que ça ajoute :** `gm-max` est aujourd'hui `output: 'static'`, sans adapter. Il
faut `@astrojs/vercel` (la v10, la v11 exige Astro 7) et `export const prerender = false`
sur la seule route API. Le reste du site reste statique.

### Vérifié sur la preview, 26/08

L'adapter génère un `.vercel/output/config.json` qui ne porte **aucun** header de
sécurité. La question était donc de savoir si `vercel.json` s'applique encore une fois
le build passé en Build Output API : sinon, brancher l'adapter retirait en silence la
CSP et `X-Frame-Options` de tout le site. La doc Vercel ne tranche pas, et son exemple
`getTransformedRoutes` suggère plutôt l'inverse.

Mesuré sur `maxguerois-git-feat-supabase-capture`, comparé à la production :

| | prod | preview |
|---|---|---|
| `content-security-policy` | présent | présent, identique |
| `x-frame-options` | DENY | DENY |
| `referrer-policy` | strict-origin-when-cross-origin | idem |
| `permissions-policy` | camera=(), microphone=(), geolocation=() | idem |
| `cleanUrls` | actif | actif (`/fr/newsletter` en 200) |

`vercel.json` continue de s'appliquer. Aucune régression.

Route testée sur la preview : email invalide -> 400 `invalid_email` ; honeypot rempli
-> 200 silencieux. Les deux tables sont restées à 0 ligne, donc ni l'un ni l'autre n'a
touché la base.

**Pas encore testé :** le chemin nominal, qui demande les variables d'environnement.

## Prérequis avant implémentation

1. ~~Vérifier l'endpoint beehiiv~~ **fait le 26/08** — remplacé par l'API officielle (D10)
1bis. Créer le projet Supabase `maxguerois` + table `subscribers` ; ajouter
   `@astrojs/vercel` ; poser `SUPABASE_SERVICE_ROLE_KEY` et `BEEHIIV_API_KEY` en
   variables Vercel (jamais `NEXT_PUBLIC_`/`PUBLIC_`)
2. **Supprimer les 2 abonnés de test** dans beehiiv, à la main (le MCP n'a pas
   d'outil de suppression) : `maximeguerois+beehiivtest@gmail.com` et
   `maximeguerois+utmtest@gmail.com`
3. Écrire le premier numéro, sans quoi la promesse du lundi n'est pas tenable
4. ~~Changer le lien ManyChat~~ **fait**
5. Passer la page FR au vouvoiement, et décider si les 8 articles FR suivent

## Décisions NON tranchées

- **Le vouvoiement s'arrête-t-il à la landing, ou gagne-t-il les 8 articles FR ?**
  133 occurrences de tutoiement. Une landing en « vous » suivie d'un article en
  « tu » recrée la rupture qu'on vient de supprimer.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | not run on this plan |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | ISSUES_FOUND | 3 dimensions reviewed of 7, initial 3/10, 2 blocking findings |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**VERDICT:** NOT CLEARED. Design review surfaced two blocking findings, both in the
reviewer's own mockup: an archive block that cannot be filled honestly, and a form
rendering that the current beehiiv iframe cannot produce. Both are resolved as
decisions but neither is implemented. Eng review has not run on this plan.

**UNRESOLVED DECISIONS:**
- 4 dimensions de design non couvertes: responsive, slop IA, accessibilité, conformité DESIGN.md
- Portée du vouvoiement : landing seule, ou les 8 articles FR aussi
- 2 abonnés de test à supprimer à la main dans beehiiv
