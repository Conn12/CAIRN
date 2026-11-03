# STM32 系统结构 · 单模型交接

## 概览

- 模型：STM32F103C8T6 系统结构解剖
- 路由：`/models/mcu-3d/`（模型架在 `/models/`）
- 目的：把参考手册图1 的“系统结构”做成可旋转、可点击、可看数据流的 3D 线框
- 当前版本：`v0.15.0`

## 运行

```bash
cd site
npm run dev     # http://localhost:4321/models/mcu-3d/
npm run build   # 输出 site/dist/models/mcu-3d/
```

- 纯前端，Three.js `0.187` 从 `site/node_modules` 引入，无 CDN
- 需要支持 WebGL2 的现代浏览器
- 没有后端、数据库、登录；不加载外部模型文件，几何与纹理全部程序化生成

## 文件地图

| 作用 | 文件 |
| --- | --- |
| 页面 | `site\src\pages\models.astro` |
| 舞台 / HUD 结构 | `site\src\components\model-mcu3d.astro` |
| 场景装配、交互、章节 | `site\src\scripts\mcu-3d\main.js` |
| 模块、线路、章节、数据流数据 | `site\src\scripts\mcu-3d\content.js` |
| 芯片 / 走线 / 纹理生成 | `site\src\scripts\mcu-3d\geometry.js` |
| 模块与线路讲解 | `site\src\scripts\mcu-3d\info.js` |
| 样式 | `site\src\styles\mcu-3d.css` |
| 全宽页面支持 | `site\src\layouts\base.astro`（`bare`） |

## 数据结构

### BLOCKS

每个模块一条：

```js
{
  id,          // 唯一 id，也是 INFO 的 key
  kind,        // core / matrix / chip / bridge / board / mini / dma / rcc / ghost
  label, meta, // 悬浮标签和右侧面板副标题
  pos, size,   // [x, y, z] / [w, h, d]，单位是场景单位
  color,       // 顶盖 / 发光色
  group,       // core / bus / mem / periph / dma / clock / mini
  ghost,       // 旧字段，部分型号可用
  desc, tags,  // 简述和标签
}
```

APB1/APB2 上的小芯片由 `mini()` 批量生成，`id` 必须和 `INFO` 对应。

### TRACES

每条总线一条，`points` 按信号方向排列：

```js
{
  points,     // [[x,y,z], ...]，y 固定在晶圆表面上方
  width,      // 线宽，buildTrace 会再乘 1.3
  color,      // 箭头 / 数据流颜色
  dashed,     // 时钟、DMA 请求用虚线
  label,      // 线路标签；空字符串表示不显示标签
  labelPos,   // 标签位置
}
```

`main.js` 会为每条线生成：

- 铜走线圆柱 + 转角过孔
- 终点箭头
- 不可见的拾取圆柱（点击线本体用）

### CHAPTERS

```js
{
  no, title, narration, // 章节号、标题、底部旁白
  camera, target,       // 镜头位置 / 看向点
  flow,                 // 默认数据流
  labels,               // all / main / periph
  focus,                // 本章高亮的模块 id，'*' 表示全部
}
```

### FLOWS

```js
{
  label, color, speed, count,
  segments, // TRACES 的 id 数组，按流动方向
}
```

### INFO / TRACE_INFO

`info.js` 里两个映射：

- `INFO[id]`：每个模块的「是什么 / 做什么 / 怎么用」
- `TRACE_INFO[id]`：每条总线的「是什么 / 做什么 / 怎么用」

点击模块或线路时，`showPanel()` 会渲染成三段。

## 系统拓扑（按参考手册图1）

- **ICode**：Cortex-M3 → Flash 接口，直连，不经过总线矩阵
- **DCode**：Cortex-M3 → 总线矩阵
- **系统总线**：Cortex-M3 → 总线矩阵
- **DMA1 / DMA2**：作为主设备接入总线矩阵
- 总线矩阵的被动端口：Flash 接口、SRAM、FSMC、AHB2APB 桥
- **Flash 接口 ↔ Flash**
- **AHB 系统总线 → 桥接 2 / 桥接 1 → APB2 / APB1**
- **RCC**：复位与时钟，挂在 AHB 系统总线上
- **DMA 请求**：外设 → DMA 控制器

## 型号口径

按 C8T6：

- Flash 64KB，起始 `0x0800 0000`
- SRAM 20KB，起始 `0x2000 0000`
- DMA1 7 通道；DMA2 标“部分型号 · C8T6 无”
- FSMC 标“外部存储器 · C8T6 无”
- APB2：GPIOA–D、ADC1/2、TIM1、SPI1、USART1、EXTI/AFIO
- APB1：TIM2–4、USART2/3、I2C1/2、SPI2、CAN、USB、RTC/PWR/BKP、IWDG/WWDG
- APB1 最高 36MHz，APB2 最高 72MHz

## 交互

- 鼠标拖动旋转，滚轮缩放
- 点击模块本体、模块标签、总线标签、总线本体，右侧显示讲解
- 顶部章节 01–06；键盘 `←` / `→` 切换；URL `#01`–`#06` 可直达（在页面加载时读取）
- 底部数据流：跟随章节 / 取指 / 取数 / 外设 / DMA / 时钟
- 左侧开关：标签、描边、Bloom、自动旋转、重置视角

### 拾取注意

画布位于站点顶栏下方。`pick()` 必须用画布自身的 `getBoundingClientRect()` 计算鼠标坐标：

```js
const rect = renderer.domElement.getBoundingClientRect();
pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
```

不要改回 `clientX / window.innerWidth`，否则点击会整体上偏一个顶栏的高度。

## 已知缺口

- 图1 里的 **SDIO** 未建模（C8T6 没有）
- **DMA 请求**目前只有一条代表线；图1 是 APB2/APB1 分别向 DMA1/DMA2 发请求
- 所有元件仍是程序化几何，没有真实 GLB 模型
- 窄屏 HUD 偏挤，移动端未专门优化
- 章节 hash 只在首次加载时读取，运行中改 hash 不会切章（站内没有这种入口）
- 没有自动化测试；靠构建 + 无头浏览器截图验证

## 下一步建议

1. 版块扩展：`/models/` 索引页 + `/models/<slug>/`；抽共享 `ModelStage`；`models.ts` 注册表（详见 `docs\modules\physical-models.md`）
2. 补 SDIO 虚体、DMA 请求多线
3. 可选接入真实元件 GLB（`assets\models\`）
4. 移动端 HUD 和面板布局
5. 部署（等远程仓库 / 托管）

## 版本记录

| 版本 | 内容 |
| --- | --- |
| v0.9.0 | 独立工具 `tools\mcu-3d`，本地 `serve.bat` 启动 |
| v0.10.0 | 并入站点，新增“物理模型”版块 |
| v0.11.0 | 按图1重排；芯片封装、交叉开关、外设板、铜走线、键合线 |
| v0.12.0 | ICode 直连 Flash 接口；FSMC 实体化；模块三段讲解 |
| v0.13.0 | 修复拾取偏移；模块/标签/总线可点击；17 条总线解析 |
| v0.14.0 | 补开发日志与交接文档 |
| v0.15.0 | 物理模型改为模型架 + 独立页，本模型迁到 `/models/mcu-3d/` |

## 接手提示

1. 先读 `content.js` 的数据结构，再读 `main.js` 的装配顺序，最后看 `geometry.js`。
2. 改模块位置/尺寸只动 `content.js`；改外形动 `geometry.js`；改交互动 `main.js`。
3. 加模块时同时补 `INFO`；加线路时同时补 `TRACE_INFO`。
4. 改完必须 `npm run build`，并用无头浏览器截图确认；开发服务器能看不代表构建产物没问题。
5. 本模型的内容依据是参考手册和 HAL 讲义，改动数值前先核对页码，不要凭印象。
