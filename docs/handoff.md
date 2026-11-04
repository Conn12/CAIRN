# 跨 AI 交接说明

> 目的：不管换成哪个 AI 接手，都能从仓库恢复上下文；交回 Claude 时也能无缝继续。
> 核心原则：**仓库是唯一事实来源，AI 的记忆不算数。**

## 一、把这段提示词复制给接手的 AI

```text
你是 CAIRN 项目的接手开发者。项目在 D:\CAIRN。

先不要写代码，按顺序读：
1. CLAUDE.md
2. docs/site-log.md
3. docs/handoff.md
4. docs/modules/physical-models.md
5. docs/models/ec-s100-watch.md
6. docs/version-log.md 最后 5 条

然后运行：
git status
git log --oneline --decorate -10
git tag --sort=-v:refname | head -5

读完后用 5 行以内复述：
- 当前版本和远程状态
- 已完成 / 未完成
- 你准备先改哪些文件
- 你准备怎么验证
等我确认后再动手。

硬规则：
- 不新增顶层目录，不改根目录 5 个文件。
- 依赖只进 site/node_modules 或 .local；不装全局包，不写 C 盘。
- 不改 CLAUDE.md 的红线、目录规则、API 配置，除非我明确同意。
- 不提交 .claude / .local / API key。
- 每个版本：提交 + 打标签 + 更新 docs/version-log.md + 更新对应模块日志。
- 改完必须 npm run build 通过；3D 页面要截图检查。
- 不自动 push；交接时按 docs/handoff.md 的流程处理。
```

## 二、当前状态（v0.17.1）

- 项目：Astro + Markdown 静态站，零后端；物理模型用 Three.js。
- 远程：`https://github.com/Conn12/CAIRN`（私有）；`main` 已同步。
- 当前版本：`v0.17.1`。
- 物理模型版块：
  - `/models/`：模型架
  - `/models/mcu-3d/`：STM32F103C8T6 系统结构（已完成）
  - `/models/ec-s100-watch/`：EC-S100 手表演示台（第一版）
- EC-S100 现状：
  - 32×22 模块化底板 + STM32F411 核心板 + 16 块可插拔模块（共 17 项）
  - 模块不合并：屏幕、触摸、5 个传感器、存储、充电、电池、蓝牙、语音、马达、按键、LED、光敏各自独立
  - 每块模块有 2.54 排针、引脚丝印、引脚标签和引脚表
  - 屏幕镜像 240×280；当前 10/22 个页面
  - 传感器滑块、OTA 全流程、单模块/全部插拔已实现
- 下一步：补齐 EC-S100 剩余 12 个页面；按实物照片精修模块；抽共享 ModelStage。

## 三、工作规则

以 `CLAUDE.md` 为准，重点：

- 根目录只放 5 个文件；可见顶层目录固定。
- 每个文件只有一个家；引用，不复制。
- 临时文件进 `.local\tmp\`；用完删。
- 不装全局包，不写 C 盘。
- 每个版本：提交 + 标签 + `docs/version-log.md` + 对应模块日志。
- 交接前必须 `git status` 干净，`main` 与 `origin/main` 同步。

## 四、交回记录：另一个 AI 停止时必须写

文件命名：

```
docs/handoff-return-YYYY-MM-DD.md
```

模板在 `docs/handoff-return-template.md`，必须写清：

- 本次完成
- 提交和标签
- 当前版本 / 远程状态
- 验证结果（构建、截图、测试）
- 未完成 / 已知问题
- 下一步建议
- 需要老大确认的问题

写完提交、打标签（如果要发版）、push。

## 五、交回 Claude 的流程

1. 接手的 AI 把代码提交干净，`main` 与远程同步，写好交回记录。
2. 老大双击 `start.bat` 启动 Claude（会自动接上最近会话，或 `/resume`）。
3. 对 Claude 说：

   ```text
   读 CLAUDE.md、docs/site-log.md、docs/handoff.md，
   以及 docs/handoff-return- 最新的记录。
   先核对 git status / log / tag，复述当前状态和下一步，不要直接改代码。
   ```

4. Claude 核对仓库、读日志、确认后再继续。

## 六、分支与远程

- 建议接手 AI 在 `ai/<名字>` 分支工作，完成并验证后合并到 `main`；也可以直接在 `main` 上小步提交。
- 每个版本打标签：`vX.Y.Z`。
- 交接前：`git status` 干净，`main` 与 `origin/main` 一致。
- 如果接手 AI 不能 push：让它在本地提交，导出 `git bundle` 或 zip；老大再 push。
- 不要把整个 `D:\CAIRN` 发给外部 AI：里面有个人文章、日志和配置。只给工作目录或必要的私有仓库权限。

## 七、EC-S100 的红线（别改错）

- **17 个模块不要合并**：5 个传感器、触摸、存储、充电、电池、蓝牙、语音、马达、按键、LED、光敏都是独立模块。
- 屏幕是 240×280，不要改比例。
- 模块引脚以 `docs/models/ec-s100-watch.md` 和 `content.js` 为准。
- 不要为了好看删模块、合并模块。

## 八、给 Claude 的提示（老大复制用）

```text
继续 CAIRN 的物理模型开发。先读 CLAUDE.md、docs/site-log.md、docs/handoff.md、
docs/models/ec-s100-watch.md，以及 docs/handoff-return- 最新的记录。
核对 git status / log / tag 后，告诉我当前状态和下一步，再动代码。
```
