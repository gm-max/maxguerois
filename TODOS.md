# TODOS — maxguerois.com

## P1a — Design System Infrastructure (PR 1: `design-system` branch)
**What:** Tokenisation CSS, dark mode, accessibilité, nouvelle échelle typo, merge duplication layouts.
**Why:** Le DESIGN.md et la preview HTML définissent un système complet mais le CSS actuel est en retard — tokens hardcodés, dark mode absent, zéro a11y, duplication entre fichiers et layouts.
**Pros:** Source de vérité unique, dark mode fonctionnel, accessibilité AA, CSS maintenable, direction éditoriale renforcée.
**Cons:** Changement visuel (hero weight 300, body 16px, text-tertiary plus foncé). À tester sur toutes les pages.
**Context:** Décisions prises via /plan-design-review + /plan-eng-review le 2026-03-19. Preview HTML de référence : `/private/tmp/design-consultation-preview-1773931727.html`.
**Scope (checklist) :**
- [ ] Tokeniser global.css : `--font-display`, `--font-body`, `--sp-*`, `--ease-out`, `--duration-*`
- [ ] Typo scale en px : hero 52px/weight 300, H1 36px, H2 24px, body 16px, label 12px
- [ ] Text-tertiary `#999` → `#767676` (WCAG AA)
- [ ] Dark mode : `[data-theme="dark"]` + `prefers-color-scheme` + inline script anti-FOIT + toggle en footer + localStorage (try/catch)
- [ ] Accessibilité : `:focus-visible` avec outline accent, `prefers-reduced-motion: reduce`
- [ ] Fusionner ArticleLayout.astro → extend Layout.astro via slot (supprimer duplication <head>)
- [ ] Fusionner article.css : supprimer :root, reset, body, container dupliqués
- [ ] nav.css : remplacer couleurs hardcodées par var(--*)
- [ ] experiments.astro <style> : migrer hardcoded values vers tokens
**Effort:** 3 days human (~24h) → CC (~45min)
**Depends on:** DESIGN.md à jour (done), preview HTML validée (done).

## P1b — Design System Visual (PR 2: follow-up branch)
**What:** Composants visuels formalisés et article footer CTA.
**Why:** Le design system preview définit des composants (cards, buttons, tags) qui ne sont pas encore implémentés dans le CSS.
**Scope (checklist) :**
- [ ] Writing items → bordered cards avec hover bg-subtle
- [ ] Newsletter Beehiiv CTA en fin de chaque article
- [ ] Buttons formalisés : primary, outline, accent
- [ ] Tags formalisés : default + accent
**Effort:** 2 days human (~16h) → CC (~30min)
**Depends on:** P1a (tokens + dark mode doivent être en place).

## P2 — Astro Content Collections
**What:** Migrer les articles MDX vers Astro Content Collections (src/content/) avec validation frontmatter et getCollection() API.
**Why:** Quand 5+ articles existent, /experiments doit les lister dynamiquement au lieu d'être hardcodé.
**Pros:** Index auto-généré, frontmatter typé (titre, date, tagline), zéro hardcoding dans experiments.astro.
**Cons:** Réorganisation src/pages/experiments/ → src/content/. Petite migration à faire.
**Context:** Actuellement, experiments.astro liste les 3 articles existants en dur. Avec Content Collections, getCollection('experiments') retourne tous les articles automatiquement. Démarrer dans src/content/experiments/ + définir le schema Zod.
**Effort:** S human (~4h) → CC (~20min)
**Depends on:** Avoir 5+ articles MDX publiés.

## ~~P3 — DESIGN.md (design system documentation)~~
**Status:** DONE (2026-03-19). DESIGN.md créé via /design-consultation, enrichi via /plan-design-review avec section Components, Accessibility, Dark Mode, CSS Architecture.
