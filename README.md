# AinSoph · 阿因索菲的每日笔记

一个用 Astro + Markdown 搭的个人笔记站：每天写一个 Markdown 文件，`git push`，GitHub Pages 自动更新。

线上地址（演示）：<https://wanglingyuan529-droid.github.io/>

---

## 每天怎么写

```bash
# 1. 生成当天笔记骨架（可选，也可以手动复制模板）
pnpm new:note

# 2. 写内容（任何编辑器都行，比如 Obsidian / VS Code）
#    文件在 content/posts/<年>/<YYYY-MM-DD>-<slug>.md

# 3. 发布
git add content/ && git commit -m "note: 今天学到的东西" && git push
```

推送之后，GitHub Actions 会自动构建并发布，约 1 分钟线上可见。

### Front matter 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✅ | 中文标题，随便写多长 |
| `date` | ✅ | `"2026-11-14"`（**一定要加引号**） |
| `category` | ✅ | `study`（学习） / `thoughts`（思考） / `about`（关于本站） |
| `tags` | — | 数组，如 `["java", "算法"]` |
| `summary` | — | 列表页显示的一句话摘要 |
| `series` | — | 系列名，配合 `order` 排序 |
| `order` | — | 系列里的顺序 |
| `draft` | — | `true` 时不出现在线上 |
| `pin` | — | `true` 时在首页/列表置顶 |

> 字段写错时 `pnpm build` 会直接报错并指出文件——不会悄悄生成一个坏页面。

---

## 目录结构

```
content/posts/        ← 唯一写作入口（Obsidian 可直接打开这一层）
src/pages/            ← 页面路由：首页、列表、详情、归档、标签、搜索、关于
src/components/       ← 世界树、文章列表等组件
src/styles/           ← 设计 token 与排版规则
public/               ← 图标、封面等静态资源
scripts/new-note.mjs  ← 每天生成笔记骨架
.github/workflows/    ← 部署流水线
```

---

## 本地预览

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # 构建 + 生成搜索索引
pnpm preview    # 预览构建产物
```

> 本地没有 Node 也能写：直接在 GitHub 网页里新建/编辑 Markdown 文件，提交后 Actions 会构建。

---

## 部署（首次配置）

1. 把仓库推到 GitHub。
2. **Settings → Pages → Source 选 “GitHub Actions”**。
3. push 到 `main` 后，Actions 会自动构建部署。

两种仓库形态：

- 仓库名 `<你的用户名>.github.io` → 网址 `https://<用户名>.github.io/`（本配置默认，`base` 留空）。
- 普通仓库（如 `ainsoph`）→ 网址 `https://<用户名>.github.io/ainsoph/`，需在 `astro.config.mjs` 里设置 `base: '/ainsoph'`。

---

## 设计说明

- 配色「林间夜·青玉」：正文 17px / 行高 1.85 / 中文零字距，全部对比度 ≥ 7:1（AAA）。
- 首页“左文字 / 右树”：树在画框里，鼠标移入才开始生长，长完即停，不耗电。
- 叶子密度随文章数增加：每写十篇，树就长一点。
- 暗/亮主题跟随系统，可用右上角按钮切换。

---

## 从旧站迁移（可选）

旧站内容的浏览器导出 JSON（旧版 `pages/assistant.html` 的“导出全部备份”）：

```bash
node scripts/import-localstorage.mjs ~/Downloads/ainsoph-all-backup.json
```

脚本会把研究记录、认知痕迹转成 Markdown 草稿，放到 `content/posts/<年>/`，并**不会**覆盖已有文件。
