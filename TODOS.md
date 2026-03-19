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
