# Rudder 工程宪法（Constitution）

> 本文件是 **Rules 层**：回答「什么东西**必须**长什么样」。
> 流程怎么走见 [`workflow/`](workflow/lifecycle.md)，技能怎么写见 [`../skills/`](../skills/)。
> 由 `AGENTS.md` Core Directive 3 引用。

## 0. 四层分离

| 层 | 位置 | 回答的问题 | 冲突时 |
|---|---|---|---|
| **Rules** | 本文件 | 东西必须长什么样 | 以本文件为准 |
| **Workflow** | [`workflow/`](workflow/lifecycle.md) | 需求怎么走 | 以 `workflow/` 为准 |
| **Skills** | [`../skills/`](../skills/) | Agent 怎么执行某阶段 | 不得与本文件冲突 |
| **Agent** | [`agents/`](agents/claude-code.md) | 每个 runtime 读到什么 | 不得与本文件冲突 |

**依赖方向单向**：Skills / Agents 受 Rules 与 Workflow 约束；Rules 与 Workflow **不引用**任何 runtime 的实现细节。

## 1. 🌐 语言约束（CRITICAL）

- **目标读者**：中文用户。
- **输出**：所有沟通、需求文档、UI 文案、commit message **必须**用**简体中文**。
- **例外**：代码、变量名、文件路径、纯技术术语（如 API、Loading、Toast）保留英文。
- **入口确认**：`/rudder-import` 与首次 `/rudder-plan` 必须在 `requirements/MASTER-PRD.md` 中建立或读取项目主记录，并向用户展示 [`design/visual.md`](design/visual.md) 的预设风格包供选择；用户可选、可指定「你决定」（此时采用默认预设 `P1`，**流程不得因此卡住**）；任何未明确的业务规则、范围、边界、依赖或 UI 行为必须先用中文提问，不得猜测。

## 2. 🛠️ 前端技术栈（STRICT）

- **核心**：React 19+（仅限函数组件与 Hooks）。
- **语言**：TypeScript（Strict 模式）。**禁止 `any`**。
- **构建**：Vite。
- **样式**：**只用 Tailwind CSS**。唯一允许存在的 CSS 文件是 `src/index.css`（Tailwind 入口）。**除该入口外，禁止任何自定义 `.css` / `.scss`**，所有样式一律通过 Tailwind utility class 表达。
  - `src/index.css` 的**唯一合法内容**为：`@import 'tailwindcss';` **加上**当前生效预设的 `@theme` 令牌块（取值见 [`design/visual.md`](design/visual.md) §4）。**除此之外不得写入任何规则。**
- **状态**：Zustand 或 React Context。禁止 Redux。
- **路由**：`react-router`。
- **图标**：Lucide React。
- **Lint 强制**：禁止 `debugger`；`src/` 下禁止 `console.log`（允许 `console.warn` / `console.error`）；`src/` 下禁止硬编码色值与外链图片（见 §2.1 / §3）。

### 2.1 视觉令牌与 UI 主风格

> 完整规范见 [`design/visual.md`](design/visual.md)。本节只列**强制项**。

- **色值唯一来源**：`src/index.css` 的 `@theme` 令牌块。`src/` 下**禁止**出现任意十六进制色值
  （`bg-[#3b82f6]`、`style={{ color: '#fff' }}`、SVG 的 `fill="#fff"` 均禁止），一律引用令牌生成的 utility class。
- **组件强制复用**：同类交互元素**必须**使用 `src/components/` 中的组件。确需新建的，
  须在 `implement.md` 说明现有组件为何不适用；新组件若具备通用性，**必须**下沉到该目录。
- **UI 主风格**：项目级决策，记录在 `requirements/MASTER-PRD.md`，取值必须是 `design/visual.md` 中
  定义的**预设包**之一（`P1` / `P2` / `P3` / `BRAND`），**不接受**自由文本描述。
  未确认时采用**默认预设 `P1`** 并记录「用户未指定」，流程**不得因此卡住**。

### 2.2 依赖白名单（STRICT）

- **禁止**引入**带预置视觉风格**的组件库（Ant Design、MUI、Chakra 等）——
  它们的外观会绕过本项目的令牌体系，导致 §2.1 失效。
- **允许 headless 无样式原语库**：只提供行为与无障碍语义、**不提供任何视觉样式**的原语库。
  白名单逐个登记：

  | 包 | 用途 |
  |---|---|
  | `react-router` | 路由与页面跳转 |
  | `@radix-ui/react-dialog` | Modal / Drawer 行为 |
  | `@radix-ui/react-select` | 下拉选择行为 |
  | `@radix-ui/react-dropdown-menu` | 菜单行为 |
  | `@radix-ui/react-tabs` | 标签页行为 |
  | `@radix-ui/react-tooltip` | 悬浮提示行为 |
  | `@radix-ui/react-switch` | 开关行为 |
  | `@radix-ui/react-popover` | 气泡卡片行为 |

  **新增任何依赖须经人工确认**，白名单不得成为万能口子。

> **依赖豁免（2026-09-21 增补）**：本节白名单约束的是前端运行时依赖（`dependencies`）。
> `scripts/` 下的 Node 工具/构建脚本允许引入 `devDependencies`，前提是该依赖**不被 `src/` 任何文件 import**，
> 因而不进入打包产物。校验方式：依赖位于 `devDependencies`；`src/` 全目录 grep 不到该包名；`dist/` 产物中亦无该包名。

## 3. 🛡️ Rudder 架构约束

- **依赖方向**：UI 组件**必须**从 `src/services/` 取数，**禁止**直接 import `src/mocks/`。
  完整方向为 **UI → `src/services/` → `src/mocks/`**。
- **契约优先**：先写 `src/types/`，再写 mocks / services / UI。
- **Mock 延迟**：所有 service 函数**必须**用 `setTimeout` 模拟 **300-800ms** 网络延迟。
- **UI 三态**：所有取数 UI **必须**显式处理 **Loading / Error / Empty** 三态。
- **路径别名**：导入统一用 `@` 别名（`@/*` → `src/*`），配置见 `tsconfig.json` 与 `vite.config.ts`。

### 3.1 本地资源（STRICT）

> 完整规范见 [`design/assets.md`](design/assets.md)。原型在**会议室投屏**下演示，网络不可靠，
> 因此**零外网依赖**是硬要求。

- **禁止** `src/` 中任何图片 / 字体 / 音视频资源的 **http(s) 外链**。
- **禁止**引入占位图服务（图床）。占位一律走 `src/components/PlaceholderImage`（本地 SVG）。
- 用户提供的品牌素材放 `public/brand/`，业务图片放 `public/assets/`；缺失时用统一占位组件，**不外链**。
- 允许 `data:` 内联的 base64 资源（本地自包含，合法）。

## 4. 🔄 强制反馈闭环

- 任何代码变更后，**必须**自动运行 `npm run build` 与 `npm run lint`（或 `npm run typecheck`）。
- 若失败，读取终端报错、自动修复、重跑，直到 0 错误。
- **逃生舱**：连续 3 轮仍失败时**必须停止**，将 `implement.md` 保持为 `IN_PROGRESS` 并上报人工，
  不得将实施标记为完成（详见 [`workflow/transitions.md`](workflow/transitions.md) §1）。

## 5. 🧹 垃圾回收

- 任何 `git commit` 之前，清理未使用的 import、非调试用的 `console.log`、注释掉的死代码。

## 6. 📚 技能权威源约定

技能（`rudder-plan` / `rudder-plan-confirm` / `rudder-implement` / `rudder-adjust` /
`rudder-commit` / `rudder-change` / `rudder-import`）遵循**单一源 + 双投影**：

| 位置 | 性质 |
|---|---|
| `skills/rudder-<name>.md` | **唯一手写权威源** |
| `.claude/commands/rudder-<name>.md` | 生成物，**禁止手改** |
| `.hermes/skills/rudder-<name>/SKILL.md` | 生成物，**禁止手改** |

- 修改技能行为时**只能**改 `skills/rudder-<name>.md`，然后运行 `npm run sync:skills`。
- `npm run check:skills` 逐字节比对投影与源；**任何漂移即失败**（纳入 Verify 阶段机器检查族）。
- 直接改投影文件属于违规——即使内容"看起来对"，下次生成也会被覆盖。

> 详细渲染规则（两段式 frontmatter、标题形态、`hermes-only` 区块）见
> `scripts/sync-skills.js` 的实现。

## 7. 📄 文档格式支持边界

需求文档导入**只支持** `.docx` / `.md` / `.txt`。
**PDF 与 xlsx 不受支持**，见 [`import/sources.md`](import/sources.md) §5 的 Non-Goal 声明。
