import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 内容模型（唯一"字段真相"）。
 * 写错字段时，astro build 会直接报错并指出哪个文件——这是对 vibe coding 最友好的护栏。
 *
 * 约定：
 *  - 一个文件 = 一篇笔记；文件名 YYYY-MM-DD-<ascii-slug>.md
 *  - category 只能取 study / thoughts / about 三枝之一
 *  - date 必须加引号："2026-11-14"（YAML 裸日期会被解析成 Date，引号后统一按字符串/Date 兼容处理）
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1, '标题不能为空'),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      summary: z.string().default(''),
      category: z.enum(['study', 'thoughts', 'about']),
      tags: z.array(z.string()).default([]),
      series: z.string().optional(),
      order: z.number().default(0),
      cover: image().optional(),
      draft: z.boolean().default(false),
      pin: z.boolean().default(false),
      lang: z.string().default('zh-CN'),
    }),
});

export const collections = { posts };
