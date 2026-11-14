import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const CATEGORIES = {
  study: { name: '学习', english: 'Study', desc: '每天的课程、语言、算法与踩坑记录' },
  thoughts: { name: '思考', english: 'Thoughts', desc: '读书、复盘、情绪与想明白的事' },
  about: { name: '关于', english: 'About', desc: '这个小站怎么来的，以及它正在变成什么样' },
} as const;

export type Category = keyof typeof CATEGORIES;

/** URL 用 slug（文件名去掉 .md；去掉年份目录，保持 /posts/<YYYY-MM-DD>-<name>/ 单段） */
export function postSlug(post: Post): string {
  const file = post.id.split('/').pop() ?? post.id;
  return file.replace(/\.md$/, '');
}

/** 日期 → 2026-11-14（固定 UTC，避免时区把日期推前一天） */
export function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  })
    .format(d)
    .replace(/\//g, '-');
}

export function fmtDateShort(d: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(d);
}

/** 已发布文章：过滤草稿与未来日期，按日期倒序、pin 优先 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection(
    'posts',
    ({ data }) => !data.draft && data.date.valueOf() <= Date.now(),
  );
  return posts.sort((a, b) => {
    if (a.data.pin !== b.data.pin) return a.data.pin ? -1 : 1;
    return b.data.date.valueOf() - a.data.date.valueOf();
  });
}

export async function getPostsByCategory(category: Category): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.category === category);
}

export function getTags(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/** 系列：按 order 升序，返回同系列（含当前） */
export function getSeries(posts: Post[], series: string): Post[] {
  return posts
    .filter((p) => p.data.series === series)
    .sort((a, b) => a.data.order - b.data.order || a.data.date.valueOf() - b.data.date.valueOf());
}

/** 相关文章：同 category + 相同 tag 数加权，取 3 篇 */
export function relatedPosts(posts: Post[], current: Post, limit = 3): Post[] {
  return posts
    .filter((p) => p.id !== current.id)
    .map((p) => {
      let score = 0;
      if (p.data.category === current.data.category) score += 2;
      score += p.data.tags.filter((t) => current.data.tags.includes(t)).length;
      if (p.data.series && p.data.series === current.data.series) score += 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.valueOf() - a.p.data.date.valueOf())
    .slice(0, limit)
    .map((x) => x.p);
}
