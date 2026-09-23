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

## 2. 🛠️ 前端技术栈（STRICT）

- **核心**：React 19+（仅限函数组件与 Hooks）。
- **语言**：TypeScript（Strict 模式）。**禁止 `any`**。
- **构建**：Vite。
- **样式**：**只用 Tailwind CSS**。唯一允许存在的 CSS 文件是 `src/index.css`（Tailwind 入口，内容仅限 `@import 'tailwindcss';`）。**除该入口外，禁止任何自定义 `.css` / `.scss`**，所有样式一律通过 Tailwind utility class 表达。禁止重型 UI 库（Ant Design、MUI 等）。
- **状态**：Zustand 或 React Context。禁止 Redux。
- **图标**：Lucide React。
- **Lint 强制**：禁止 `debugger`；`src/` 下禁止 `console.log`（允许 `console.warn` / `console.error`）。

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

## 4. 🔄 强制反馈闭环

- 任何代码变更后，**必须**自动运行 `npm run build` 与 `npm run lint`（或 `npm run typecheck`）。
- 若失败，读取终端报错、自动修复、重跑，直到 0 错误。
- **逃生舱**：连续 3 轮仍失败时**必须停止**，将 `verify.md` 状态置为 `FAIL` 并上报人工，
  不得继续推进（详见 [`workflow/transitions.md`](workflow/transitions.md) §1）。

## 5. 🧹 垃圾回收

- 任何 `git commit` 之前，清理未使用的 import、非调试用的 `console.log`、注释掉的死代码。

## 6. 📚 技能权威源约定

技能（`rudder-plan` / `rudder-implement` / `rudder-verify` / `rudder-review` /
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
