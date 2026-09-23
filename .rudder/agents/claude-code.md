# Claude Code — 读取约定与上下文边界

> 本文件是 **Agent 层**：回答「Claude Code 这个 runtime **读到什么、边界在哪**」。
> 规则本身见 [`../constitution.md`](../constitution.md) 与 [`../workflow/lifecycle.md`](../workflow/lifecycle.md)，本文件不重复它们。

## 1. 入口文件与读取顺序

Claude Code 每次会话按以下顺序加载（前一份指向后一份）：

| 顺序 | 文件 | 作用 |
|---|---|---|
| 1 | `AGENTS.md` | 宪法层：四条 Core Directives，指向 `CLAUDE.md` 与 `.rudder/` |
| 2 | `CLAUDE.md` | 会话入口：硬性约束速查、工程结构、常用命令 |
| 3 | `.rudder/README.md` | 规则体系导航：告诉你接下来该读哪一份 |
| 4 | 按任务类型分流 | 见 §2 |

**不要只读 `CLAUDE.md` 就开始写代码**——它是导读，不是规则本身。

## 2. 按任务类型分流

| 任务 | 必读 |
|---|---|
| 走需求生命周期 | [`../workflow/lifecycle.md`](../workflow/lifecycle.md) → [`states.md`](../workflow/states.md) → [`gates.md`](../workflow/gates.md) |
| 写/改代码 | [`../constitution.md`](../constitution.md) §2 / §3 |
| 导入文档 | [`../import/sources.md`](../import/sources.md) → [`../analysis/decomposition.md`](../analysis/decomposition.md) |
| 处理依赖 / 变更传播 | [`../analysis/dependency.md`](../analysis/dependency.md) → [`../workflow/transitions.md`](../workflow/transitions.md) §4 |
| 改技能行为 | [`../../skills/`](../../skills/)（**只改这里**，然后 `npm run sync:skills`） |

## 3. 上下文边界

### 3.1 Plan → Commit 窗口的读取约束

在处理某个 REQ 的 Plan → Commit 期间，**仅允许**读取：

- `requirements/MASTER-PRD.md`
- 当前 REQ 的目录（`requirements/REQ-XXX-<kebab-name>/`）

**禁止**读取其他 REQ 的目录内容或源码上下文。理由：LLM 的上下文会被无关需求污染，
这是"一次只推进一个 REQ"约束的机制保障。

### 3.2 导入阶段的例外

导入阶段**不受** §3.1 约束——它必须读取外部待导入文档与 `MASTER-PRD.md`
才能判定全局规则与独立功能点。见 [`../import/sources.md`](../import/sources.md) §4。

### 3.3 技能的读取

`.claude/commands/rudder-*.md` 是**生成物**，Claude Code 读取它们来执行技能，
但它们**不是**权威源。要改技能行为，改 `skills/rudder-<name>.md`（见 [`../constitution.md`](../constitution.md) §6）。

## 4. 触发方式

Claude Code 通过**斜杠命令**触发技能，参数由 `argument-hint` 声明：

| 命令 | 参数 |
|---|---|
| `/rudder-plan` | `[REQ-ID or Description]` |
| `/rudder-implement` | `[REQ-ID]` |
| `/rudder-verify` | `[REQ-ID]` |
| `/rudder-review` | `[REQ-ID]` |
| `/rudder-commit` | `[REQ-ID]` |
| `/rudder-change` | `[REQ-ID] [Change Description]` |
| `/rudder-import` | `[Document Path]` |

> 与 Hermes 的差异：Hermes 用自然语言触发词（`triggers`），Claude Code 用斜杠命令 +
> `argument-hint`。两套 frontmatter schema **不可约**，这正是"单一源 → 两个投影"的必要性来源
> （见 `scripts/sync-skills.js`）。

## 5. 输出与验证约定

- **交互语言**：所有澄清问题、报告、批准提示用**简体中文**。
- **证据**：不得口头声称"已通过"。Verify 阶段必须把命令的完整终端输出写入 `verify.md`。
- **状态同步**：每次阶段动作后**立刻**更新产物 `status` **与** `README.md` 顶层 `status`，
  然后跑 `npm run check:req` 确认一致。
- **变更纪律**：范围变更走 `/rudder-change`，**不得**就地改代码
  （见 [`../workflow/transitions.md`](../workflow/transitions.md) §4）。
