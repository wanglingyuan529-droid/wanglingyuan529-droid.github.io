import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 站点根 URL：改为朋友自己的账号时只改这一处
const SITE = 'https://wanglingyuan529-droid.github.io';

export default defineConfig({
  site: SITE,
  // 作为 <username>.github.io 仓库发布时，base 留空即可（根路径）。
  // 如果改成普通仓库（如 AinSoph），取消下一行注释并把仓库名填入：
  // base: '/AinSoph',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'min-dark',
      wrap: true,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
