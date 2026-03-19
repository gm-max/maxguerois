# TODOS — maxguerois.com

## P2 — Astro Content Collections
**What:** Migrer les articles MDX vers Astro Content Collections (src/content/) avec validation frontmatter et getCollection() API.
**Why:** Quand 5+ articles existent, /projects doit les lister dynamiquement au lieu d'être hardcodé.
**Pros:** Index auto-généré, frontmatter typé (titre, date, tagline), zéro hardcoding dans projects.astro.
**Cons:** Réorganisation src/pages/experiments/ → src/content/. Petite migration à faire.
**Context:** Actuellement, /projects.astro liste les 3 articles existants en dur. Avec Content Collections, getCollection('experiments') retourne tous les articles automatiquement. Démarrer dans src/content/experiments/ + définir le schema Zod.
**Effort:** S human (~4h) → CC (~20min)
**Depends on:** Avoir 5+ articles MDX publiés.

## P3 — DESIGN.md (design system documentation)
**What:** Documenter le design system dans DESIGN.md via /design-consultation.
**Why:** Actuellement tout est dans le code. Une source de vérité unique accélère les futures pages et les reviews.
**Pros:** Référence rapide, design reviews plus efficaces, cohérence garantie.
**Cons:** Risque de staleness si le système évolue.
**Context:** Design system extrait du code: #faf9f7 bg, #1a1a1a text, Cormorant Garamond + DM Sans, 620px container. Utiliser /design-consultation pour générer DESIGN.md.
**Effort:** S human (~2h) → CC (~15min)
**Status:** À faire via /design-consultation AVANT implémentation Astro.
