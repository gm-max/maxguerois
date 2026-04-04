# maxguerois.com

Personal hub for [Max Guerois](https://maxguerois.com) — health experiments, biomarker tracking, and founder journey.

## Stack

- **Framework:** [Astro](https://astro.build) (static output)
- **Deploy:** Vercel
- **Fonts:** Cormorant Garamond + DM Sans (Google Fonts)
- **Design system:** See [DESIGN.md](DESIGN.md)

## Getting started

```bash
npm install
npm run dev              # http://localhost:4321
npm run check:csp-images # optional — verify external <img> hosts vs CSP (also runs before build)
npm run build            # CSP image check + astro build → dist/
```

## Adding a new experiment

1. Create `src/content/experiments/slug.json`:
   ```json
   {
     "title": "...",
     "tagline": "...",
     "category": "...",
     "date": "YYYY-MM",
     "slug": "experiments/slug"
   }
   ```
2. Create `src/pages/experiments/slug.astro` using `ArticleLayout`
3. It appears automatically on the homepage and `/experiments`

## Project structure

```
src/
  content/experiments/     ← article metadata (JSON, Zod-validated)
  components/              ← shared components (NewsletterEmbed, etc.)
  layouts/
    Layout.astro           ← base layout (head, navbar, dark mode, fonts)
    ArticleLayout.astro    ← extends Layout for articles
  pages/
    index.astro            ← homepage
    experiments/
      index.astro          ← experiment listing
      sleep.astro
      testosterone.astro
      max-biomarkers.astro
  styles/
    global.css             ← design tokens + base styles
    article.css            ← article-only components
    nav.css                ← navbar
public/                    ← static assets (images, favicons)
```

## License

All rights reserved.
