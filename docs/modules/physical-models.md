# 物理模型 · 开发日志

## 一句话

站点的第四个版块：放可交互的 3D 物理模型，用来理解硬件内部结构。目前有一个 STM32F103C8T6 系统结构模型。

## 当前状态

- 入口：`/models/`（模型架，列出所有模型）
- 已有 2 个模型：
  - `/models/mcu-3d/`：STM32 系统结构
  - `/models/ec-s100-watch/`：EC-S100 手表演示台（第一版）
- 状态：可用；尚未公网部署
- 当前版本：`v0.15.0`
- 单模型详细交接：`docs\models\mcu-3d.md`、`docs\models\ec-s100-watch.md`

## 文件地图

| 作用 | 文件 |
| --- | --- |
| 模型架 | `site\src\pages\models\index.astro` |
| 模型注册表 | `site\src\data\models.ts` |
| 模型架侧栏 | `site\src\components\model-sidebar.astro` |
| STM32 页面 | `site\src\pages\models\mcu-3d.astro` |
| STM32 舞台与 HUD | `site\src\components\model-mcu3d.astro` |
| STM32 场景装配 | `site\src\scripts\mcu-3d\main.js` |
| STM32 数据 / 几何 / 讲解 | `site\src\scripts\mcu-3d\content.js`、`geometry.js`、`info.js` |
| EC-S100 页面 | `site\src\pages\models\ec-s100-watch.astro` |
| EC-S100 舞台、屏幕镜像 | `site\src\components\model-ec-s100.astro` |
| EC-S100 场景与逻辑 | `site\src\scripts\ec-s100\main.js`、`content.js` |
| EC-S100 样式 | `site\src\styles\ec-s100.css` |
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

- 站点第四版块、顶栏入口、模型架 + 每模型独立页
- `models.ts` 注册表，模型架/侧栏/计数都从它来
- STM32：按参考手册图1的拓扑、实物化模块、铜走线、六章、五种数据流、模块/总线点击讲解
- EC-S100 第一版：主控板 + 扩展板 + 可插拔屏幕模块；240×280 屏幕镜像；10 个页面；6 个章节；传感器滑块；器件点击；OTA 全流程（V2.6→V2.7）
- 插拔扩展板：扩展板升起、屏幕断电、镜像显示未连接

## 未完成 / 下一步

1. **EC-S100 全功能**：补齐 22 个 LVGL 页面（当前 10 个），还原原界面的布局、字体、图标和手势；NFC/二维码/围栏/天气页面的交互。
2. **EC-S100 实物细节**：等老大提供主板/扩展板/屏幕照片或尺寸，精修器件位置、表壳/连接器/排线。
3. **STM32 准确性**：补 SDIO（图1 有、C8T6 无）；DMA 请求拆成多条；真实 GLB 元件。
4. **共享舞台**：两个模型页目前各自维护 HUD；后续抽 `ModelStage`，统一章节/面板/工具条。
5. **移动端**：窄屏 HUD 和面板仍偏挤。
6. **部署**：等托管配置。

## 最近变更

| 日期 | 版本 | 内容 |
| --- | --- | --- |
| 2026-11-03 | v0.15.0 | 模型架 + 独立模型页；新增 EC-S100 演示台第一版 |
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
