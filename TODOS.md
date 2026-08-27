# TODOS — maxguerois.com

## ~~P1a — Design System Infrastructure (PR 1: `design-fix` branch)~~
**Status:** DONE (2026-03-19). Shipped via PR.
**Scope (completed) :**
- [x] Tokeniser global.css : `--font-display`, `--font-body`, `--sp-*`, `--ease-out`, `--duration-*`
- [x] Typo scale en px : hero 52px/weight 300, H1 36px, H2 24px, body 16px, label 12px
- [x] Text-tertiary `#999` → `#767676` (WCAG AA)
- [x] Dark mode : `[data-theme="dark"]` + inline script anti-FOIT + toggle en footer + localStorage (try/catch)
- [x] Accessibilité : `:focus-visible` avec outline accent, `prefers-reduced-motion: reduce`
- [x] Fusionner ArticleLayout.astro → extend Layout.astro via slot
- [x] Fusionner article.css : supprimer :root, reset, body, container dupliqués
- [x] nav.css : remplacer couleurs hardcodées par var(--*)
- [x] experiments.astro <style> : migrer hardcoded values vers tokens

## ~~P1b — Design System Visual (PR 2: `design-system-visual` branch)~~
**Status:** DONE (2026-03-19). Shipped via PR.
**Scope (completed) :**
- [x] Writing items → bordered cards avec hover bg-subtle (`.writing-list` wrapper)
- [x] Newsletter Beehiiv CTA en fin de chaque article (sleep, testosterone, max-biomarkers)
- [x] Buttons formalisés : `.btn-primary`, `.btn-outline`, `.btn-accent`
- [x] Tags formalisés : `.tag`, `.tag-accent`

## ~~P2 — Astro Content Collections~~
**Status:** DONE (2026-03-19). Data collection with Zod schema. Articles stay as .astro pages (too complex for MDX), metadata in JSON files. experiments.astro + index.astro use getCollection() for dynamic listing.

## ~~P3 — DESIGN.md (design system documentation)~~
**Status:** DONE (2026-03-19). DESIGN.md créé via /design-consultation, enrichi via /plan-design-review avec section Components, Accessibility, Dark Mode, CSS Architecture.

## P4 — Purger `mg_rate_limit_hits` quand la table le justifiera
**Status:** OPEN (posé le 2026-08-26 par `/plan-eng-review`, différé volontairement).

**Quoi :** la table qui compte les tentatives d'inscription par IP n'est jamais vidée.
La limite ne regarde que la dernière heure ; tout ce qui est plus ancien est du poids mort.

**Pourquoi c'est différé et pas corrigé :** le calcul dit des années. Une ligne pèse une
cinquantaine d'octets, le plan gratuit offre 500 Mo, donc il faut de l'ordre de 10 millions
de tentatives pour que ça pèse. La lecture reste rapide quoi qu'il arrive grâce à
`mg_rate_limit_hits_ip_created_idx`. Et la correction évidente, supprimer les vieilles
lignes à chaque inscription, ajoute un aller-retour de base **sur le chemin critique** :
de l'attente pour chaque visiteur réel, contre un problème lointain. Mauvais échange.

**Déclencheur, pour ne pas s'en remettre à la vigilance :**
```sql
select count(*) from public.mg_rate_limit_hits;
```
Au-delà de **100 000 lignes**, poser une tâche planifiée Supabase qui efface tout ce qui
dépasse 24 h. Hors chemin critique, donc sans coût pour les visiteurs.

**Voir aussi :** `public.rate_limit_hits` dans le même projet (ouros.health) a exactement
le même défaut. La même tâche planifiée peut couvrir les deux.

**Dépend de :** rien.

## P5 — Test A/B de la pop-up guide (en attente de volume)
**Statut :** capture le 2026-08-27 lors de `/plan-eng-review` sur `feat/posthog`.
**Declencheur chiffre :** quand `/peptides` depasse ~2 000 visites par mois, soit
une fois le trafic Instagram installe. Avant ce seuil, un test sur un taux de
conversion de quelques pour cent ne conclura pas avant des mois.

**Le probleme :** la tuile « La pop-up gagne-t-elle sa place » compare affichages
et refus, mais la pop-up apparait a TOUT LE MONDE a la 8e seconde. Sans groupe
temoin, on mesure le derangement, jamais l'effet : rien ne dit si les gens qui
s'inscrivent par elle se seraient inscrits autrement.

**Ce qu'il faut faire :** un feature flag PostHog qui n'affiche la pop-up qu'a une
visite sur deux, puis comparer les inscriptions TOTALES (tous formulaires
confondus) entre les deux groupes — pas seulement celles venues de la pop-up.

**Detail qui compte :** la persistance PostHog est en memoire, donc la
randomisation se fera par VISITE et non par personne. C'est la bonne unite pour
la question posee.

**Ou :** la pop-up est dans `src/components/PeptidesLanding.astro`, minuteur de
8 s, une fois par visiteur via `localStorage` `mg_peptides_guide_v1`.

## P6 — Sortir maxguerois.com du projet PostHog partage
**Statut :** capture le 2026-08-27. Constate par une revue Codex.
**A faire tot plutot que tard :** la migration est quasi gratuite tant que le
projet ne contient presque aucune donnee maxguerois. Elle se paie en donnees
abandonnees a mesure que l'historique s'accumule.

**Le probleme :** le plan gratuit de PostHog n'autorise qu'un projet par
organisation, et les deux organisations existantes ont deja le leur. Donc
maxguerois.com ecrit dans le projet d'Ouros Health (`252123`), et chaque tuile
des deux cotes doit porter un filtre de provenance.

**Ce qu'il faut faire :** creer une TROISIEME organisation PostHog. C'est gratuit,
seuls les projets supplementaires sont payants — c'est la confusion qui a mene au
partage.

**Ce n'est PAS un simple changement de cle**, contrairement a ce que la premiere
version de `docs/analytics.md` affirmait. A recreer dans le nouveau projet :
- les deux tableaux de bord (`918448` Peptides, 5 tuiles ; `918449` Site, 4 tuiles)
- les definitions de proprietes et le rejeu de session
- puis remettre `test_account_filters` d'Ouros a sa valeur d'origine
  (`localhost|127.0.0.1|vercel.app`, sans `|maxguerois`)

**Cote depot :** une seule ligne, `POSTHOG_KEY` dans `src/lib/analytics.ts`.
