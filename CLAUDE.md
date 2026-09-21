# Rudder 原型工程 — 会话入口

> 本文件是 **Claude Code** 的入口上下文。规则冲突时，以下列文件为**权威**：
>
> | 文件 | 管什么 |
> |------|--------|
> | `AGENTS.md` | 工程宪法（四条 Core Directives） |
> | `.rudder/policies/core.md` | 代码**该长什么样**（技术栈 / 语言 / 架构 / 反馈闭环） |
> | `.rudder/lifecycle.md` | 流程**怎么走**（状态机 + 门控 + 异常流转） |
>
> 本文件只是导读，不重复它们的规则。**不要只读本文件就开始写代码。**

## 快速开始

| 命令 | 作用 |
|------|------|
| `/rudder-plan [需求描述]` | 澄清需求 → 生成 `requirements/REQ-XXX-*/plan.md`（PRD + 技术契约） |
| `/rudder-import [文档路径]` | 导入 .docx/.md/.txt，归一化 Markdown 并智能拆分 |
| `/rudder-implement [REQ-ID]` | 拆解 tasks.md 后按契约实施 Types → Mocks → Services → UI |
| `/rudder-verify [REQ-ID]` | 跑 typecheck / lint / build / check:tasks，自动修复，记录机器证据 |
| `/rudder-review [REQ-ID]` | 对照 `plan.md` 的 AC 逐条核对，交人工审批 |
| `/rudder-commit [REQ-ID]` | 校验五项前置状态 → 原子 git 提交 + 归档 |

完整流程见 `README.md`。

## 硬性约束

违反以下任一条，会在 `verify` 或 `review` 阶段被打回。

**语言**
- 所有沟通、需求文档、UI 文案、commit message 用**简体中文**；代码与变量名用英文。

**技术栈（不得引入清单外依赖）**
- React 19 + TypeScript(strict) + Vite + Tailwind CSS v4 + Zustand + Lucide React
- 禁止重型 UI 库（Ant Design、MUI 等）、禁止 Redux
- 依赖豁免：`scripts/` 下 Node 工具脚本可用 `devDependencies`（不得被 `src/` import，见 core.md §2）

**由 lint 强制（`npm run lint` 会以 exit 1 拦截）**
- 禁止 `any`
- `src/` 下禁止 `console.log`（允许 `console.warn` / `console.error`）；`scripts/` 的 Node 脚本不受此限
- 禁止 `debugger`

**架构**
- 依赖方向：**UI → `src/services/` → `src/mocks/`**。UI **不得**直接 import mocks。
- 契约优先：先写 `src/types/`，再写 mocks / services / UI。
- Service 函数一律返回 `Promise`，且必须用 `setTimeout` 模拟 **300-800ms** 延迟。
- 所有取数 UI 必须处理 **Loading / Error / Empty** 三态。

**样式**
- 唯一的 CSS 文件是 `src/index.css`（内容仅限 `@import 'tailwindcss';`）。其余样式一律用 Tailwind utility class。

**流程**
- 严格遵循 `.rudder/lifecycle.md`，不得越级推进。
- `plan.md` 的 `APPROVED` **只能由人工写入**，Agent 不得自行批准。
- 每个需求的产物落在 `requirements/REQ-XXX-*/` 下，6 个文件（含 `tasks.md`）各记录自己 frontmatter 里的 `status`。

## 工程结构

```
src/
├── types/        契约类型定义（先写这里）
├── mocks/        模拟数据（含延迟）
├── services/     对外数据接口（UI 只能调这里）
├── stores/       Zustand store
├── components/   通用组件
├── pages/        页面
├── App.tsx
└── main.tsx

requirements/REQ-XXX-name/   {plan,tasks,implement,verify,review,commit}.md
requirements/MASTER-PRD.md   全局业务规则与需求索引（脚本维护索引块）
requirements/_inbox/         导入中间产物（脚本扫描时跳过）
requirements/archive/        已归档需求
scripts/                     确定性工具脚本（sync-master-prd / check-tasks / check-import / import-docx）
.rudder/                     规则与模板（只读，除非在改框架本身）
```

导入路径统一使用 `@` 别名（`@/*` → `src/*`），配置见 `tsconfig.json` 与 `vite.config.ts`。

## 常用命令

```bash
npm run dev        # 开发服务器
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # 生产构建
```

## 两个注意事项

1. **双份维护**：`.claude/commands/rudder-*.md`（Claude Code 用）与 `.hermes/skills/rudder-*/SKILL.md`（Hermes Agent 用）
   是同一套流程的两种表述，内容必须保持等价——**改一份就要改另一份**。
2. **改框架本身时**：修改 `.rudder/` 下的规则或模板后，记得确认 `.claude/` 与 `.hermes/` 两处没有因此过时。
