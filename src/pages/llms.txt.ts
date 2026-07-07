import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// /llms.txt — an AI-agent-only guide to the site (the emerging GEO convention).
// Generated from the content collection so it can't drift when articles change.
// Mirrors sitemap.xml.ts: articles not in the collection (lucis-chapter) are
// added explicitly.
const SITE = 'https://maxguerois.com';

// lucis-chapter is intentionally not in the content collection (would bump an
// experiment off the home top-3). Kept in sync here by hand, same as the sitemap.
const LUCIS = {
    slug: 'lucis-chapter',
    date: '2026-06-09',
    title: 'Leaving Lucis',
    tagline: 'Why Max stepped away from Lucis, the company he co-founded, and what comes next.',
};

// Hard house rule: no em/en dashes anywhere. Sanitize source strings (a title
// or tagline may still contain one) before they reach the file.
const noDash = (s: string) => s.replace(/\s*—\s*/g, ': ').replace(/–/g, '-');

const INTRO = `# Max Guerois

> Max Guerois is a repeat founder based in Paris, writing in the open about health, longevity, and building his next startup. He co-founded Lucis, a preventive health company backed by Y Combinator and General Catalyst. This site publishes his open, self-experiment health protocols in plain language.

Max tracks his own biomarkers and shares what works and what does not: bloodwork, wearables, genome, supplements, training, sleep, and testosterone. Each entry below links to the full article.`;

export const GET: APIRoute = async () => {
    const experiments = await getCollection('experiments');
    const en = experiments
        .filter((e) => (e.data.locale || 'en') === 'en')
        .map((e) => ({ slug: e.data.slug, date: e.data.date, title: e.data.title, tagline: e.data.tagline }));

    // Newest first; merge lucis-chapter (not in the collection) in by date.
    const articles = [...en, LUCIS].sort((a, b) => b.date.localeCompare(a.date));

    const articleLines = articles
        .map((a) => `- [${noDash(a.title)}](${SITE}/newsletter/${a.slug}): ${noDash(a.tagline)}`)
        .join('\n');

    const body = `${INTRO}

## Newsletter articles

${articleLines}

## Newsletter hub

- [The newsletter](${SITE}/newsletter): Every article, plus the email signup. Two emails a month.

## Francais

A French version of every page is available under the /fr/ path, for example ${SITE}/fr/newsletter.

## About

- [Home](${SITE}): Who Max is, his biomarkers, and his founder story (Lucis, Zero Club, The Arch, Practup).
`;

    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
