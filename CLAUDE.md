# CAIRN — 项目规则

> 本文件在每个会话开始时自动加载。所有文件操作必须遵守以下规则。

---

## 项目是什么

CAIRN 是一个人的学习日志站。第一用户是站长本人。不追用户量，不做登录，零后端。

完整计划见 `PLAN.md`。

---

## 目录结构（已冻结，不得随意增删顶层目录）

```
D:\CAIRN\
├── CLAUDE.md                  根目录只放 5 个文件
├── PLAN.md
├── README.md
├── mindmap.html
├── start.bat                  启动入口（双击打开本项目）
│
├── content\                   内容部门：所有文字
│   ├── posts\                 正式文章
│   ├── drafts\                草稿
│   └── learning\              学习项目（项目总结）
│
├── assets\                    资源部门：所有非文字资源
│   ├── images\                图片
│   ├── models\                3D 模型（网站用）
│   └── files\                 附件（PDF、压缩包等）
│
├── tools\                     工具部门：每个工具一个子目录
│
├── site\                      工程部门：网站代码
│   ├── src\
│   └── public\
│
├── docs\                      档案部门
│   ├── decisions\             决策记录
│   └── archive\               废弃 / 临时 / 旧版本
│
├── .local\                    隐藏：本机缓存（不进版本库、不备份）
│   ├── npm-cache\             npm 依赖缓存
│   ├── npm-global\            npm 全局包（尽量不用）
│   ├── playwright\            浏览器内核
│   ├── models\                下载的模型权重
│   └── tmp\                   临时文件
│
└── .claude\                   隐藏：Claude Code 项目本地配置（不进版本库）
    └── settings.local.json    会话设置（推理档位等）
```

---

## 本地存储边界（重要）

**本项目的所有依赖、缓存、下载物，只允许落在 `D:\CAIRN\.local\`。**

- 不执行全局安装（禁止 `npm i -g`），依赖一律装进项目内的 `site\node_modules`。
- 不往 `%APPDATA%`、`C:\Users\...` 下放任何项目产生的东西。
- 需要下载模型权重时，下载到 `.local\models\`。
- 需要临时目录时，用 `.local\tmp\`。

**以下属于系统或开发环境本体，不在管辖范围内，也不要去动：**

- Node.js 本体：`C:\Program Files\nodejs`
- Claude Code 本体与配置：`C:\Users\Administrator\.claude`
- API Key：`C:\Users\Administrator\AppData\Local\ClaudeCodeLauncher`
- Windows 自身的临时目录、日志、更新缓存

> 注：以上重定向写在 `start.bat` 里，**只有通过 `start.bat` 启动才生效**。用其它方式启动时，需自行确认环境变量。

---

## 硬规则

1. **根目录只允许存在上面列出的 5 个文件。** 任何新文件先进子目录。
2. **每个文件只有一个“家”。** 需要多处使用时，引用，不复制。
3. **可见顶层目录固定为 6 个，不新增。** 另有 2 个隐藏目录：`.local\` 专放本机缓存，`.claude\` 放 Claude Code 项目本地配置。要放新东西，先找现有部门。
4. **目录深度不超过 3 层。** `D:\CAIRN\a\b\` 是极限。
5. **文件名一律全小写、英文、连字符分隔。** 不用中文、不用空格、不用大写、不用下划线。
6. **临时文件一律进 `.local\tmp\` 或 `docs\archive\`**，用完即删。
7. **禁止写入 C 盘。** 不装全局包，不改系统配置。

---

## 命名规则

| 类型 | 位置 | 格式 |
|---|---|---|
| 文章 | `content\posts\` | `YYYY-MM-DD-slug.md` |
| 草稿 | `content\drafts\` | `slug.md` |
| 学习项目 | `content\learning\` | `<slug>.md` |
| 文章配图 | `assets\images\<slug>\` | `01.png`、`02.png` |
| 3D 模型 | `assets\models\` | `<name>.glb` |
| 附件 | `assets\files\` | `<slug>-<description>.pdf` |
| 工具 | `tools\<name>\` | 目录名即工具名 |
| 决策记录 | `docs\decisions\` | `YYYY-MM-DD-<topic>.md` |

---

## 红线

- 不加登录、数据库、后端。
- 新点子先是一篇文章，不是一个新页面。
- 网站是索引，不是宿主；工具放 GitHub，站上只放文章和链接。
- 80 篇之前不做分类体系。
- 单篇文章不超过 2 小时。

---

## 技术栈

- Astro + Markdown
- 手写 CSS，不引 UI 框架
- 静态托管，零运行时
- 不用 Google Fonts、不用境外 CDN，资源全部自托管
- 包管理使用 npmmirror 镜像，缓存落在 `.local\npm-cache`

---

## 给 Claude 的约定

- 新建文件前，先确认它属于哪个部门；不确定就问，不要猜。
- 不在任何目录下随手创建临时文件。
- 修改目录结构前，必须先更新本文件并征得同意。
- 文件重命名或移动后，同步更新引用它的文章和配置。
- 任何安装、下载、构建产生的数据，先确认落点是否在 `D:\CAIRN\` 内。
- 给老大提供选择时，选项和说明一律用中文。

---

## 版本管理

- 每完成一个版本修改（功能、样式、结构），验证通过后提交到本地 Git，并打版本标签（从 `v0.1.0` 起）。
- 提交后同步更新 `docs\version-log.md`，写清这一版改了什么。
- 提交信息写清楚这次改了什么；不自动 push，远程仓库等明确指示。
- `.local\`、`.claude\` 不进版本库。
