# 物理模型 · 开发日志

## 一句话

站点的第四个版块：放可交互的 3D 物理模型，用来理解硬件内部结构。目前有一个 STM32F103C8T6 系统结构模型。

## 当前状态

- 入口：`/models/`（单页，全屏 3D 舞台）
- 已有 1 个模型：STM32 系统结构（`mcu-3d`）
- 状态：可用；尚未公网部署
- 当前版本：`v0.14.0`
- 单模型详细交接：`docs\models\mcu-3d.md`

## 文件地图

| 作用 | 文件 |
| --- | --- |
| 版块页面 | `site\src\pages\models.astro` |
| 3D 舞台与 HUD | `site\src\components\model-mcu3d.astro` |
| 场景装配 | `site\src\scripts\mcu-3d\main.js` |
| 模块 / 线路 / 章节 / 数据流 | `site\src\scripts\mcu-3d\content.js` |
| 几何生成（封装、走线、纹理） | `site\src\scripts\mcu-3d\geometry.js` |
| 模块与线路讲解 | `site\src\scripts\mcu-3d\info.js` |
| 样式 | `site\src\styles\mcu-3d.css` |
| 全宽页面支持 | `site\src\layouts\base.astro`（`bare` 属性） |
| 旧工具目录指针 | `tools\README.md` |
| 决策记录 | `docs\decisions\2026-11-03-physical-models.md` |

## 运行方式

- 纯前端：Astro 静态页 + Three.js 0.187（`site\node_modules`）
- 开发：`cd site && npm run dev` → `http://localhost:4321/models/`
- 构建：`npm run build` → `site/dist/models/`
- 无后端、无数据库、无 CDN；不支持 WebGL2 的浏览器无法显示
- 几何和纹理全部程序化生成，不加载外部模型

## 数据来源

- 《STM32中文参考手册V10》第 2 章（24–33 页）、第 6 章时钟树（56 页）
- 《STM32教程（HAL版）_讲义》第 9 页（C8T6 资源）、第 30 页（存储器映像）
- 《STM32F103产品手册（中文）》
- 型号口径：C8T6（64KB Flash / 20KB SRAM / DMA1 7 通道）；FSMC、DMA2 标“本型号无”

## 已完成

- 站点第四版块、顶栏入口、全宽舞台
- 严格按参考手册图1的拓扑布置模块和走线
- 实物化模块：芯片封装、引脚、键合线、交叉开关、外设小板、晶振、玻璃罩
- 铜走线 + 过孔 + 箭头 + 线路标签
- 六个章节、五种数据流（取指/取数/外设/DMA/时钟）
- 点击模块、模块标签、总线标签、总线本体都能看「是什么 / 做什么 / 怎么用」
- PCB 与晶圆纹理、环境反射、Bloom

## 未完成 / 下一步

1. **版块结构**：拆成 `/models/` 索引页 + `/models/<slug>/` 每模型独立页；抽共享 `ModelStage`；建 `models.ts` 注册表。
2. **准确性**：补 SDIO（图1 有、C8T6 无，可做虚体）；DMA 请求拆成 APB2/APB1 到 DMA1/DMA2 多条。
3. **实物感**：可选接入真实 GLB 元件（封装、板卡），资产放 `assets\models\`。
4. **移动端**：窄屏 HUD 和面板仍偏挤。
5. **部署**：等远程仓库和托管配置。

## 最近变更

| 日期 | 版本 | 内容 |
| --- | --- | --- |
| 2026-11-03 | v0.14.0 | 补本开发日志与总交接 |
| 2026-11-03 | v0.13.0 | 修复点击坐标偏移；模块/标签/总线可点击；17 条总线补解析 |
| 2026-11-03 | v0.12.0 | ICode 改为直连 Flash 接口；FSMC 实体化；补模块讲解 |
| 2026-11-03 | v0.11.0 | 按图1重构场景与实物化模块 |
| 2026-11-03 | v0.10.0 | 新增站点物理模型版块，工具并入站点 |
| 2026-11-03 | v0.9.0 | 独立 3D 工具（`tools\mcu-3d`，已迁走） |

## 接手提示

- 先读 `docs\models\mcu-3d.md`，再动代码。
- 数据都在 `content.js`：先改布局/线路，再改 `main.js` 的装配。
- 点击拾取必须用画布矩形计算坐标（画布在站点顶栏下面），不要再改回 `clientX / innerHeight`。
- 标签现在可点击，拖动请从空白处开始。
- 改完必须 `npm run build`；可用无头浏览器截图检查，不要只靠开发服务器。
