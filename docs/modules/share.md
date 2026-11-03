# 分享 · 开发日志

## 一句话

做出来的小东西放这里：图片、工具、建模。左侧分类，右侧一次显示一条，用 hash 切换。

## 当前状态

- 入口：`/share/`
- 3 个分类、4 条内容：
  - 图片分享：鹈鹕骑自行车、大象弹钢琴（矢量动图）
  - 工具分享：在线计算器（页面内可用）
  - 建模分享：太阳系（Three.js 3D，可拖动旋转）
- 单页切换，不跳路由

## 文件地图

| 作用 | 文件 |
| --- | --- |
| 分类与条目数据 | `site\src\data\shares.ts` |
| 页面与切换脚本 | `site\src\pages\share.astro` |
| 左侧分类导航 | `site\src\components\share-nav.astro` |
| 左侧栏容器 | `site\src\components\share-sidebar.astro` |
| 图片分享组件 | `site\src\components\share-illustration.astro` |
| 计算器 | `site\src\components\share-calculator.astro` |
| 太阳系 3D | `site\src\components\share-solar.astro` |
| 图片素材 | `assets\images\share-pelican-bike\01.svg`、`assets\images\share-elephant-piano\01.svg` |

## 数据来源

自己制作。图片是手写 SVG 动图，太阳系和计算器是前端代码。

## 已完成

- 分类 → 条目两层结构，左侧导航从 `shares.ts` 自动生成
- hash 切换（`#calculator` 等），刷新可直达
- 图片分享：SVG 内联 + Web Animations API 暂停/播放
- 工具分享：计算器在页面内直接可用
- 建模分享：Three.js 太阳系，自托管依赖，无 CDN

## 未完成 / 下一步

- 新条目按需添加；没有固定排期
- 窄屏下的右侧内容还未专门优化
- 条目封面/预览图目前没有统一约定

## 最近变更

| 日期 | 版本 | 内容 |
| --- | --- | --- |
| 2026-11-03 | v0.14.0 | 补本开发日志 |
| 2026-11-03 | v0.8.0–v0.8.2 | 图片分享改为矢量动图；修复动画不播放；加暂停开关 |
| 2026-11-03 | v0.4.0 | 分类 → 条目切换；新增《大象弹钢琴》；修正鹈鹕主体 |
| 2026-11-03 | v0.3.0 | 新增分享版块：图片、工具、建模 |

## 接手提示

- 加一条分享要改两处：
  1. `site\src\data\shares.ts` 加一个 `{ id, title, sub }`
  2. `site\src\pages\share.astro` 加一个 `<section id="...">`，里面放对应组件
- `id` 同时是左侧链接的 hash，必须唯一。
- 新图片放 `assets\images\share-<slug>\`，在页面里用 `?raw` 引入。
- 加 Three.js 组件时参考 `share-solar.astro`：用 `renderer.setAnimationLoop`，`ResizeObserver` 适配容器，不引 CDN。
- 改完跑 `npm run build`；分享页的脚本在页面底部，注意别破坏 hash 切换。
