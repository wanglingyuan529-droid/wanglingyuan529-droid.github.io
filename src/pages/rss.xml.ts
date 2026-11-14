import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { getPosts, postSlug } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: 'AinSoph · 阿因索菲的每日笔记',
    description: '一个还在学习的人，每天把学到的东西钉在树上。',
    site: context.site ?? 'https://wanglingyuan529-droid.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary || post.data.title,
      link: `/posts/${postSlug(post)}/`,
      categories: post.data.tags,
    })),
    customData: '<language>zh-cn</language>',
  });
}
