# maxguerois.com — Claude Instructions

## Project
Personal hub for Max Guerois. Astro SSG, deployed on Vercel.

## Design System
**Always read DESIGN.md before making any visual or UI decisions.**
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.

Key tokens:
- Accent color: `#c4934a` (amber) — used for numbers, hover arrows, CTAs
- Fonts: Cormorant Garamond (display) + DM Sans (body)
- Max width: 620px single column
- Dark mode bg: `#0f0e0c` (warm, not cold)

## Stack
- Framework: Astro (static output)
- Content: `.astro` pages for complex HTML, `.mdx` for future markdown experiments
- Styles: `src/styles/global.css` + `src/styles/article.css` + `src/styles/nav.css`
- Deploy: Vercel, `astro build`, output → `dist/`

## File Structure
```
src/
  components/Navbar.astro
  layouts/Layout.astro          ← base layout (head, GA4, navbar, fonts)
  layouts/ArticleLayout.astro   ← article pages (extends Layout)
  pages/
    index.astro
    sleep.astro
    testosterone.astro
    max-biomarkers.astro
    experiments.astro
  styles/
    global.css
    article.css
    nav.css
public/                         ← static assets (images, favicons)
```

## Analytics
GA4 ID: `G-DR1W1B2VV5` — defined once in Layout.astro

## Newsletter
Beehiiv embed — placed at bottom of homepage + /experiments page.

## Adding a new experiment
1. Create `src/pages/new-experiment-slug.astro` (or `.mdx`)
2. Use `ArticleLayout.astro` as the layout
3. Add it to `src/pages/experiments.astro` list

## Prompt/LLM changes
No LLM integration in this project.
