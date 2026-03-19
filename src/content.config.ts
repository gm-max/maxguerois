import { defineCollection, z } from 'astro:content';

const experiments = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    category: z.string(),
    date: z.string(),
    slug: z.string(),
    ogImage: z.string().optional(),
  }),
});

export const collections = { experiments };
