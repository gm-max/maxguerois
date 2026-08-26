import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// REQ-4 — sitemap generated from the content collection so <lastmod> can't drift.
// Articles not in the collection (lucis-chapter) are added explicitly.
const SITE = 'https://maxguerois.com';
const LUCIS_DATE = '2026-06-09';

export const GET: APIRoute = async () => {
    const experiments = await getCollection('experiments');
    const en = experiments.filter((e) => (e.data.locale || 'en') === 'en');
    const fr = experiments.filter((e) => e.data.locale === 'fr');
    const newest = experiments.map((e) => e.data.date).sort().reverse()[0];

    type Entry = { loc: string; lastmod: string; priority: string };
    const urls: Entry[] = [];

    // English
    urls.push({ loc: `${SITE}/`, lastmod: newest, priority: '1.0' });
    urls.push({ loc: `${SITE}/newsletter`, lastmod: newest, priority: '0.9' });
    for (const e of en) urls.push({ loc: `${SITE}/newsletter/${e.data.slug}`, lastmod: e.data.date, priority: '0.8' });
    urls.push({ loc: `${SITE}/newsletter/lucis-chapter`, lastmod: LUCIS_DATE, priority: '0.8' });

    // French
    urls.push({ loc: `${SITE}/fr`, lastmod: newest, priority: '0.9' });
    urls.push({ loc: `${SITE}/fr/newsletter`, lastmod: newest, priority: '0.8' });
    // Landing du funnel Instagram. Indexée (D14) : le doublon sémantique avec
    // /fr/newsletter est théorique tant que le blog n'est pas positionné, alors
    // que le trafic organique perdu serait réel.
    urls.push({ loc: `${SITE}/fr/peptides`, lastmod: newest, priority: '0.9' });
    for (const e of fr) urls.push({ loc: `${SITE}/fr/newsletter/${e.data.slug}`, lastmod: e.data.date, priority: '0.7' });
    urls.push({ loc: `${SITE}/fr/newsletter/lucis-chapter`, lastmod: LUCIS_DATE, priority: '0.7' });

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n')}
</urlset>
`;

    return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
