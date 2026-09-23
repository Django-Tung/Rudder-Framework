# Rudder 原型工程 — 会话入口

> 本文件是 **Claude Code** 的入口上下文。规则冲突时，以下列文件为**权威**：
>
> | 文件 | 管什么 |
> |------|--------|
> | `AGENTS.md` | 工程宪法（四条 Core Directives） |
> | `.rudder/constitution.md` | 代码**该长什么样**（技术栈 / 语言 / 架构 / 反馈闭环 / 技能权威源） |
> | `.rudder/workflow/lifecycle.md` | 流程**怎么走**（阶段与产物总览） |
> | `.rudder/workflow/states.md` | 状态**取哪些值**（枚举与顶层状态推导） |
> | `.rudder/workflow/gates.md` | **何时允许**进入下一阶段 |
> | `.rudder/workflow/transitions.md` | **异常情况**怎么走 |
> | `.rudder/README.md` | 规则体系总导航（不知道读哪份时先读它） |
>
> 本文件只是导读，不重复它们的规则。**不要只读本文件就开始写代码。**

## 快速开始

| 命令 | 作用 |
|------|------|
| `/rudder-import [文档路径]` | 路径 A：导入 .docx/.md/.txt → 分析拆分 → **暂停等人工批准** → 批量产出 REQ 目录 |
| `/rudder-plan [需求描述]` | 路径 B：澄清需求 → 生成 `requirements/REQ-XXX-*/plan.md`（PRD + 技术契约） |
| `/rudder-implement [REQ-ID]` | 拆解 `tasks.md` 后按契约实施 Types → Mocks → Services → UI |
| `/rudder-verify [REQ-ID]` | 跑 typecheck / lint / build / check:skills / check:req，自动修复，记录机器证据 |
| `/rudder-review [REQ-ID]` | 对照 `plan.md` 的 AC 逐条核对，交人工审批 |
| `/rudder-commit [REQ-ID]` | 校验五项前置状态 → 原子 git 提交 + 归档 |
| `/rudder-change [REQ-ID] [变更]` | 需求变更：更新 PRD + 级联失效 + 代码冻结，并向下游传导 `STALE` |

完整流程见 `README.md`。

## 硬性约束

违反以下任一条，会在 `verify` 或 `review` 阶段被打回。

**语言**
- 所有沟通、需求文档、UI 文案、commit message 用**简体中文**；代码与变量名用英文。

**技术栈（不得引入清单外依赖）**
- React 19 + TypeScript(strict) + Vite + Tailwind CSS v4 + Zustand + Lucide React
- 禁止重型 UI 库（Ant Design、MUI 等）、禁止 Redux
- 依赖豁免：`scripts/` 下 Node 工具脚本可用 `devDependencies`（不得被 `src/` import，见 `constitution.md` §2）

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
- 严格遵循 `.rudder/workflow/` 下的四份规则文件，不得越级推进。
- `plan.md` 的 `APPROVED` **只能由人工写入**，Agent 不得自行批准。
- 进入 Plan 阶段前，`README.md` 中 `deps` 列出的每个 REQ 的 `plan.md` **必须已是 `APPROVED`**。
- 每个需求的产物落在 `requirements/REQ-XXX-*/` 下，**7 个文件**——6 个阶段产物 + 承载顶层状态的 `README.md`，
  各自记录自己 frontmatter 里的 `status`。
- 每次阶段动作后，**必须同步更新 `README.md` 的顶层 `status`**（派生值），再由 `npm run check:req` 断言一致。

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

skills/                       技能的唯一手写权威源（rudder-<name>.md × 7）
requirements/REQ-XXX-name/    {README,plan,tasks,implement,verify,review,commit}.md（7 个）
requirements/IMP-YYYYMMDD-NNN/ 文档导入管道（source/ + imported.md + metadata.yaml + analysis.md）
requirements/MASTER-PRD.md    全局业务规则、术语表、需求索引 + 待批准拆分（pending_maps）
requirements/_inbox/          临时暂存，仅保留 fixtures/（脚本扫描时跳过）
requirements/archive/         已归档需求与 IMP
scripts/                      确定性工具脚本（sync-skills / sync-master-prd / check-req / check-import / import-docx）
docs/                         框架级设计文档（非需求产物）
.rudder/                      规则与模板（只读，除非在改框架本身）
```

导入路径统一使用 `@` 别名（`@/*` → `src/*`），配置见 `tsconfig.json` 与 `vite.config.ts`。

## 常用命令

```bash
npm run dev          # 开发服务器
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # 生产构建
npm run check:req    # REQ 结构与顶层状态推导校验
npm run check:skills # 技能投影与权威源漂移校验
npm run sync:skills  # 从 skills/ 重新生成两个 runtime 的投影
npm run sync:master  # 重新生成 MASTER-PRD.md 的索引块
```

## 两个注意事项

1. **技能不要改投影，改源**：`skills/rudder-<name>.md` 是**唯一手写源**；
   `.claude/commands/rudder-*.md` 与 `.hermes/skills/rudder-*/SKILL.md` 都是
   `scripts/sync-skills.js` 生成的产物，**手改会在下次生成时被覆盖**。
   改完源后跑 `npm run sync:skills`，再用 `npm run check:skills` 确认无漂移。
2. **改框架本身时**：修改 `.rudder/` 下的规则或模板后，确认 `AGENTS.md` / `CLAUDE.md` / `README.md`
   三处引用没有因此过时（`.rudder/README.md` 是规则体系的导航入口）。
