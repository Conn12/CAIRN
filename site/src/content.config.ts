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

const learning = defineCollection({
  loader: glob({ pattern: '*.md', base: '../content/learning' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    sub: z.string(),
    status: z.string().default(''),
    order: z.number().default(0),
    demo: z.string().optional(),
    stack: z.array(z.string()).default([]),
  }),
});

export const collections = { posts, learning };
