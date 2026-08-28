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
    // Titre court affiche sur /peptides. Le `title` sert de repli. Le titre
    // d'article porte sa promesse complete et fait 70 a 80 signes ; dans une
    // liste, il ecrase la phrase qui le suit.
    shortTitle: z.string().optional(),
    // Phrase courte affichee sur /peptides sous le titre. Le `tagline` sert de
    // repli. Elle vit ICI et non dans le composant : une table cote code
    // demandait une modification a chaque publication, ce qui est exactement
    // ce que la selection automatique des 3 derniers venait de supprimer.
    takeaway: z.string().optional(),
    category: z.string(),
    date: z.string(),
    slug: z.string(),
    ogImage: z.string().optional(),
    cover: z.string().optional(),
    locale: z.enum(['en', 'fr']).optional().default('en'),
  }),
});

export const collections = { experiments };
