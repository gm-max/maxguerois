import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [mdx()],
  // Still a static site. The adapter exists for exactly one on-demand route,
  // src/pages/api/subscribe.ts, which opts in with `export const prerender = false`.
  // Every page keeps prerendering; adding the adapter does not change that.
  output: 'static',
  adapter: vercel(),
  site: 'https://maxguerois.com',
  // Old article URLs -> new /newsletter/<slug> structure.
  // vercel.json still serves these as true 301s at the edge in production;
  // declaring them here makes them resolve in `astro dev`/`astro preview` too.
  redirects: {
    '/health-os': '/newsletter/health-os',
    '/my-genome': '/newsletter/my-genome',
    '/lucis-chapter': '/newsletter/lucis-chapter',
    '/sleep': '/newsletter/sleep',
    '/testosterone': '/newsletter/testosterone',
    '/supplements': '/newsletter/supplements',
    '/max-biomarkers': '/newsletter/max-biomarkers',
    '/experiments': '/newsletter',
    '/experiments/sleep': '/newsletter/sleep',
    '/experiments/testosterone': '/newsletter/testosterone',
    '/experiments/supplements': '/newsletter/supplements',
    '/experiments/max-biomarkers': '/newsletter/max-biomarkers',
    '/fr/health-os': '/fr/newsletter/health-os',
    '/fr/my-genome': '/fr/newsletter/my-genome',
    '/fr/lucis-chapter': '/fr/newsletter/lucis-chapter',
    '/fr/experiments': '/fr/newsletter',
    '/fr/experiments/sleep': '/fr/newsletter/sleep',
    '/fr/experiments/testosterone': '/fr/newsletter/testosterone',
    '/fr/experiments/supplements': '/fr/newsletter/supplements',
    '/fr/experiments/max-biomarkers': '/fr/newsletter/max-biomarkers',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
