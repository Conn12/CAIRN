# tools · 工具部门

每个工具一个子目录。

## 现有工具

- **mcu-3d**：STM32F103C8T6 系统结构 3D 解剖。2026-11-03 起并入站点「物理模型」版块。
  - 入口：`/models/mcu-3d/`（站点内；模型架在 `/models/`）
  - 源码：`site\src\scripts\mcu-3d\`
  - 样式：`site\src\styles\mcu-3d.css`
  - 组件：`site\src\components\model-mcu3d.astro`

本地运行：`cd site && npm run dev`，打开 `http://localhost:4321/models/`。
