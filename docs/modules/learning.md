# 学习 · 开发日志

## 一句话

项目复盘：把做出来的东西讲清楚——为什么做、怎么做、哪里翻车，不只记录步骤。

## 当前状态

- 入口：`/learning/`
- 1 个项目：`ota-upgrade`（STM32 串口 OTA 升级）
- 数据驱动：加一个 Markdown 文件就多一个项目
- 项目 01 带可交互的 OTA 流程演示（`demo: ota`）

## 文件地图

| 作用 | 文件 |
| --- | --- |
| 项目正文 | `content\learning\ota-upgrade.md` |
| 学习集合字段校验 | `site\src\content.config.ts`（`learning` 集合） |
| 页面与切换脚本 | `site\src\pages\learning.astro` |
| 左侧项目/章节导航 | `site\src\components\learning-sidebar.astro` |
| 导航条目 | `site\src\components\learning-nav.astro` |
| OTA 交互演示 | `site\src\components\ota-demo.astro`（约 990 行） |
| 页面骨架 / 顶栏 | `site\src\layouts\base.astro` |

## 数据来源

自己的项目笔记，结合 STM32 串口 IAP / YMODEM / AES 的实际调试过程。

## 已完成

- `content\learning\*.md` 自动索引，字段：`title`、`summary`、`sub`、`status`、`order`、`demo`、`stack`
- 左侧按 `order` 排序，正文按 `h2` 标题生成章节导航
- hash 直达（`#ota-upgrade`），滚动时高亮当前章节
- demo 注册表：`learning.astro` 里的 `demos = { ota: OtaDemo }`
- OTA 项目总结：三条升级路径、YMODEM、AES-256-CBC、边界与复盘

## 未完成 / 下一步

- 新项目按需添加；没有固定排期
- demo 需要在 `learning.astro` 手动注册，模型多了可以考虑自动映射
- 窄屏下的章节导航和 demo 布局还没专门优化

## 最近变更

| 日期 | 版本 | 内容 |
| --- | --- | --- |
| 2026-11-05 | v0.17.2 | 应用统一的站点配色、导航及版块标题标记。 |
| 2026-11-03 | v0.14.0 | 补本开发日志 |
| 2026-11-03 | v0.7.0 | OTA 演示改为 Three.js 三维数据流场景 |
| 2026-11-03 | v0.6.0 | 学习模块改为 `content/learning` 数据驱动；重写 OTA 总结 |
| 2026-11-03 | v0.5.0 | 新增学习版块与第一个项目 STM32 串口 OTA |

## 接手提示

- 新增项目：在 `content\learning\` 加 `<slug>.md`，写全 frontmatter；`h2` 会成为左侧章节。
- 需要演示：在 `site\src\pages\learning.astro` 里 `import` 组件，并加进 `demos` 映射，然后在 Markdown frontmatter 写 `demo: <key>`。
- 不放演示也可以，`demo` 省略即可。
- 正文里的表格和代码块按普通 Markdown 写；不需要额外组件。
- 改完跑 `npm run build`；注意学习页底部脚本依赖 `data-learning-view` / `data-chapter-project` 这些属性。
