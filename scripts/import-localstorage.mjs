#!/usr/bin/env node
/**
 * 旧站 localStorage 导出 JSON → Markdown 迁移脚本（一次性、可选）。
 *
 * 用法：
 *   node scripts/import-localstorage.mjs <backup.json>
 *
 * 输入来自旧版 pages/assistant.html 的「导出全部备份」，结构形如：
 *   { research: { math: [{title, body, date}], circuit: [], cad: [], mcu: [] },
 *     cognition: [{title, mood, body, date}],
 *     game: [{game, name, s, e, type, state}],
 *     site: {sub, d1, d2, f} }
 *
 * 规则：
 *   - 研究记录 → category=study，tags=[科目]，series=研究记录-<科目>
 *   - 认知痕迹 → category=thoughts，正文首行写「> 心情：xxx」
 *   - 游戏活动 → data/games.json（表格数据不塞正文）
 *   - 大厅文案 → data/site.json
 *   - 不覆盖任何已存在文件（同名加 -migrated 后缀）
 */
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('用法：node scripts/import-localstorage.mjs <backup.json>');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const SUBJECTS = { math: '数学', circuit: '电路', cad: 'CAD', mcu: '单片机' };
const OUT = 'content/posts';
const DATA = 'data';

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(DATA, { recursive: true });

const yamlStr = (s) => JSON.stringify(String(s ?? ''));

function writePost({ date, title, category, tags = [], series, summary = '', body = '' }) {
  const d = (date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const year = d.slice(0, 4);
  const slugBase = `${d}-migrated-${(title || 'untitled')
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'untitled'}`;
  let rel = path.join(OUT, year, `${slugBase}.md`);
  let n = 2;
  while (fs.existsSync(rel)) {
    rel = path.join(OUT, year, `${slugBase}-${n}.md`);
    n++;
  }
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  const fm = [
    '---',
    `title: ${yamlStr(title || '无题')}`,
    `date: ${yamlStr(d)}`,
    `category: "${category}"`,
    `tags: [${tags.map((t) => yamlStr(t)).join(', ')}]`,
    series ? `series: ${yamlStr(series)}` : null,
    summary ? `summary: ${yamlStr(summary)}` : null,
    'draft: false',
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n');
  fs.writeFileSync(rel, fm + body + '\n', 'utf8');
  return rel;
}

let created = 0;

// 1) 研究记录
if (raw.research && typeof raw.research === 'object') {
  for (const [key, records] of Object.entries(raw.research)) {
    if (!Array.isArray(records)) continue;
    const subject = SUBJECTS[key] || key;
    records.forEach((r, i) => {
      if (!r || !(r.title || r.body)) return;
      const rel = writePost({
        date: r.date,
        title: r.title || `${subject} 记录 ${i + 1}`,
        category: 'study',
        tags: [subject],
        series: `研究记录-${subject}`,
        summary: (r.body || '').split('\n')[0].slice(0, 120),
        body: `## ${r.title || '记录'}\n\n${r.body || ''}\n`,
      });
      console.log('research →', rel);
      created++;
    });
  }
}

// 2) 认知痕迹
if (Array.isArray(raw.cognition)) {
  raw.cognition.forEach((c, i) => {
    if (!c || !c.body) return;
    const rel = writePost({
      date: c.date,
      title: c.title || `感悟 ${c.date || i + 1}`,
      category: 'thoughts',
      tags: ['感悟'],
      summary: c.body.slice(0, 120),
      body: `> 心情：${c.mood || '平静'}\n\n${c.body}\n`,
    });
    console.log('cognition →', rel);
    created++;
  });
}

// 3) 游戏活动 → JSON
if (Array.isArray(raw.game) && raw.game.length) {
  fs.writeFileSync(path.join(DATA, 'games.json'), JSON.stringify(raw.game, null, 2), 'utf8');
  console.log(`game → data/games.json（${raw.game.length} 条）`);
}

// 4) 大厅文案 → JSON
if (raw.site && typeof raw.site === 'object') {
  fs.writeFileSync(path.join(DATA, 'site.json'), JSON.stringify(raw.site, null, 2), 'utf8');
  console.log('site → data/site.json');
}

console.log(`\n完成：新建 ${created} 篇 Markdown。请抽查后再 git add / commit。`);
