import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 文章住在外面的 content/posts/，这里只做索引，不复制。
const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: '../content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
