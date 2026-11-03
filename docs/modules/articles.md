# 文章 · 开发日志

## 一句话

站点的主体：用 Markdown 写的学习记录、项目复盘和随笔。第一用户是站长本人。

## 当前状态

- 入口：首页 `/` 直接显示最新一篇；单篇地址 `/<slug>/`
- 已有 2 篇：
  - `2026-11-03-cairn-starts.md`（第一块石头）
  - `2026-11-03-static-site-is-enough.md`（静态站够不够用）
- 草稿目录 `content\drafts\` 目前为空
- 草稿（frontmatter `draft: true`）不会出现在首页、列表和静态路由里

## 文件地图

| 作用 | 文件 |
| --- | --- |
| 文章正文 | `content\posts\YYYY-MM-DD-slug.md` |
| 草稿 | `content\drafts\slug.md` |
| 内容集合与字段校验 | `site\src\content.config.ts` |
| 首页（最新一篇） | `site\src\pages\index.astro` |
| 单篇文章路由 | `site\src\pages\[id].astro` |
| 文章正文组件 | `site\src\components\post-article.astro` |
| 文章列表 | `site\src\components\post-list.astro` |
| 左侧目录 | `site\src\components\sidebar.astro` |
| 页面骨架 / 顶栏 | `site\src\layouts\base.astro` |
| 日期格式 | `site\src\utils\date.ts` |

## 数据来源

自己写。没有外部抓取。

## 已完成

- Markdown 自动索引：`glob({ pattern: '*.md', base: '../content/posts' })`
- frontmatter：`title`、`date`、`description`、`draft`
- 首页显示最新一篇，侧栏按年份/日期列出全部文章
- 单篇静态路由：`getStaticPaths()` 生成 `/<slug>/`
- 草稿过滤：`draft: true` 的文章不进列表和路由

## 未完成 / 下一步

- RSS 和归档页：PLAN 的 Phase 0 提到过，目前没做
- 标签、分类、搜索：按红线，80 篇之前不做
- 文章配图：约定放 `assets\images\<slug>\`，目前还没有文章用到

## 最近变更

| 日期 | 版本 | 内容 |
| --- | --- | --- |
| 2026-11-03 | v0.14.0 | 补本开发日志 |
| 2026-11-03 | v0.2.x | 双栏目录、顶栏改版，文章阅读体验调整 |
| 2026-11-03 | v0.1.0 | 文章集合、首页、单篇路由 |

## 接手提示

- 新文章文件名必须是 `YYYY-MM-DD-slug.md`，全小写、英文、连字符。
- 草稿先放 `content\drafts\`，写完挪进 `content\posts\`。
- frontmatter 至少要有 `title` 和 `date`；`draft: true` 会被过滤。
- 加完文章直接 `npm run dev` 看首页；构建用 `npm run build`。
- 不要为单篇文章新增页面；文章就是内容，不是功能。
