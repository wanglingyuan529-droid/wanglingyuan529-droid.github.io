import fs from 'node:fs';
import path from 'node:path';

/**
 * 生成当天笔记骨架：pnpm new:note [slug]
 * 输出：content/posts/<年>/<YYYY-MM-DD>-<slug>.md
 */
const now = new Date();
const iso = now.toISOString().slice(0, 10);
const year = String(now.getFullYear());
const slug = (process.argv[2] || 'note').replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
const file = path.join('content', 'posts', year, `${iso}-${slug}.md`);

if (fs.existsSync(file)) {
  console.error(`已存在：${file}`);
  process.exit(1);
}

const tpl = `---
title: "（待填标题）"
date: "${iso}"
category: "study"        # study | thoughts | about
tags: []
summary: ""
draft: false
---

## 今天学了什么


## 卡在哪


## 用自己的话复述


`;

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, tpl, 'utf8');
console.log(`created ${file}`);
console.log('写完记得改 title / category / tags，再 git add + commit + push。');
