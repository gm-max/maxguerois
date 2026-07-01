import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const experiments = defineCollection({
  // Content Layer glob loader (Astro 6 removed the legacy `type: 'data'`).
  // generateId derives the entry id from the file path so EN (root) and FR
  // (`fr/`) entries stay distinct — they share the same `slug` field, which
  // would otherwise collide and drop a whole locale.
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/experiments',
    generateId: ({ entry }) => entry.replace(/\.json$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    category: z.string(),
    date: z.string(),
    slug: z.string(),
    ogImage: z.string().optional(),
    cover: z.string().optional(),
    locale: z.enum(['en', 'fr']).optional().default('en'),
  }),
});

export const collections = { experiments };
