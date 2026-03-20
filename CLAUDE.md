# maxguerois.com — Claude Instructions

## Project
Personal hub for Max Guerois. Astro SSG, deployed on Vercel.

## Voice & Content Pillars
**This is the most important section. Every piece of content must follow these rules.**

1. **No jargon. Ever.** Longevity and health science is full of technical terms (DunedinPACE, PhenoAge, VO₂Max, HRV, etc.). On this site, we translate everything into plain language that anyone can understand. "Aging 26% slower than average" not "DunedinPACE 0.74". Technical terms can appear in data tables and biomarker pages as labels, but never in headlines, intros, or descriptions without a plain-language explanation next to them.
2. **Accessible to everyone.** A 16-year-old with no science background should be able to read any page and understand it. If a sentence requires domain knowledge to parse, rewrite it.
3. **Actionable.** Every experiment and protocol should give the reader something they can do today. Not theory — practice. "I reduced caffeine to 1 cup" not "caffeine modulation impacts adenosine receptor sensitivity".
4. **Honest over impressive.** Show real numbers, real timelines, real failures. Don't cherry-pick results or overstate effects. If something didn't work, say so.
5. **Warm, not clinical.** The tone is a friend explaining what they learned — not a doctor prescribing. First person, conversational, human.

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
    experiments/
      index.astro
      sleep.astro
      testosterone.astro
      max-biomarkers.astro
  styles/
    global.css
    article.css
    nav.css
public/                         ← static assets (images, favicons)
```

## Analytics
GA4 ID: `G-DR1W1B2VV5` — defined once in Layout.astro

## Newsletter
Beehiiv embed — placed at bottom of homepage, /experiments page, and every article footer.

## Adding a new experiment
1. Create `src/content/experiments/new-slug.json` with schema fields (title, tagline, category, date, slug, ogImage)
2. Create `src/pages/experiments/new-slug.astro` using `ArticleLayout`
3. It appears automatically on homepage + /experiments via `getCollection()`

## Prompt/LLM changes
No LLM integration in this project.
