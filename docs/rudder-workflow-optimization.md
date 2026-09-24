# Rudder 工作流优化方案

> 状态：待人工确认
> 日期：2026-09-24
> 范围：Plan 确认、实施流程、实施后变更

## 1. 背景与目标

当前 Rudder 工作流存在三个使用问题：

1. `rudder-plan` 生成 PRD 后，用户确认需求并不能稳定地将 `plan.md` 推进到 `APPROVED`，因此后续 `/rudder-implement` 仍可能被门禁阻断。
2. Verify 与 Review 被拆成独立阶段，增加了用户必须记忆和执行的命令，也使实施完成后的反馈路径变长。
3. 代码实施完成后，用户发现细节需要调整时，现有 `rudder-change` 主要面向范围蔓延，缺少一个清晰的实施后修改入口。

本方案的目标是：

- 让用户确认 PRD 后可以顺利进入实施阶段；
- 保留用户显式执行 `/rudder-implement`，不因 PRD 批准而自动修改代码；
- 移除独立的 Verify 与 Review 阶段；
- 为实施完成后的调整提供明确命令；
- 保留需求契约变更时的冻结、重新确认和证据失效机制。

## 2. 已确认的设计决策

### 2.1 实施仍由用户显式触发

用户确认 PRD 后，系统只完成以下动作：

- 将 `plan.md` 的 `status` 从 `DRAFT` 改为 `APPROVED`；
- 同步 REQ 顶层状态；
- 执行 `npm run check:req`；
- 提示用户执行 `/rudder-implement REQ-XXX`。

系统不在 Plan 确认后自动开始写代码。

### 2.2 移除 Verify 与 Review

接受将 Verify 和 Review 从标准生命周期中彻底移除：

- 不再把 `verify.md`、`review.md` 作为 REQ 产物；
- 不再提供 `rudder-verify`、`rudder-review` 两个标准命令；
- 实施阶段完成后，用户直接决定是否提交；
- 原 Verify 的机器检查并入 `rudder-implement` 的完成步骤；
- 原 Review 的人工确认改为实施完成后的普通用户反馈，不再作为独立状态阶段。

## 3. 新生命周期

标准流程调整为：

```text
Plan → Tasks → Implement → Commit
```

实施完成后的反馈分为两类：

```text
Implement 完成
  ├─ 无需调整 → Commit
  └─ 需要调整 → rudder-adjust → 重新 Implement 或直接修正
```

已提交或已归档的需求仍然不可原地修改；需要新建 REQ 承载后续需求。

## 4. Plan 确认机制

### 4.1 正常确认

`rudder-plan` 在展示完整 PRD 后，必须使用明确的确认提示：

> 请 Review。确认无误后，请回复：**PRD 批准，状态改为 APPROVED**

当用户回复包含明确批准语义时，命令应：

1. 检查 `plan.md` 中不存在未解决的重大澄清问题；
2. 更新 `plan.md` 的 `status: APPROVED`；
3. 同步 `README.md` 顶层状态；
4. 运行 `npm run check:req`；
5. 提示用户执行 `/rudder-implement REQ-XXX`。

### 4.2 确认不清楚时重新确认

新增命令：

```text
/rudder-plan-confirm REQ-XXX
```

命令职责：

- 读取当前 `plan.md`；
- 汇总待澄清问题、未完成的确认项、AC、页面结构和技术契约；
- 明确指出当前不能批准的原因；
- 请求用户逐项补充或确认；
- 用户确认完整后，再将 `plan.md` 改为 `APPROVED`。

该命令不修改 `src/`，也不在确认不完整时推进状态。

## 5. 新 REQ 产物结构

每个未归档 REQ 调整为 5 个文件：

```text
requirements/REQ-XXX-<kebab-name>/
├── README.md
├── plan.md
├── tasks.md
├── implement.md
└── commit.md
```

### 5.1 `README.md`

保留 REQ 元数据、依赖关系、顶层状态和 STALE 信息。

### 5.2 `plan.md`

保留需求背景、用户故事、AC、页面结构、三态规范和技术契约。

### 5.3 `tasks.md`

保留任务拆解和勾选状态。

### 5.4 `implement.md`

除实施摘要外，新增机器检查证据区，记录：

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run check:skills`
- `npm run check:req`

所有命令通过后，`implement.md` 才能设置为 `COMPLETED`。

### 5.5 `commit.md`

提交门禁只检查：

- `plan.md = APPROVED`；
- `tasks.md = DONE`；
- `implement.md = COMPLETED`。

## 6. 状态设计调整

### 6.1 阶段产物状态

建议保留以下状态：

- `plan.md`：`DRAFT`、`APPROVED`
- `tasks.md`：`DRAFT`、`READY`、`DONE`
- `implement.md`：`PENDING`、`IN_PROGRESS`、`COMPLETED`、`OUTDATED`
- `commit.md`：`PENDING`、`DONE`

### 6.2 REQ 顶层状态

建议简化为：

| 顶层状态 | 推导条件 |
| --- | --- |
| `PLANNED` | `plan` 为 `DRAFT` 或 `APPROVED`，且 `implement = PENDING` |
| `IMPLEMENTING` | `implement` 为 `IN_PROGRESS` 或 `OUTDATED` |
| `IMPLEMENTED` | `implement = COMPLETED` 且 `commit = PENDING` |
| `COMMITTED` | `commit = DONE` |

`README.md` 的顶层状态仍然是派生值，由 `npm run check:req` 校验。

## 7. `rudder-implement` 调整

`rudder-implement` 继续覆盖 Tasks 和 Implement 两个步骤，但完成时增加统一验证：

1. 检查 `plan.md = APPROVED`；
2. 创建或更新 `tasks.md`；
3. 按 Types → Mocks → Services → UI 顺序实施；
4. 勾选并完成所有任务；
5. 顺序执行 typecheck、lint、build、check:skills、check:req；
6. 失败时最多自动修复 3 轮；
7. 通过后，将命令输出写入 `implement.md`；
8. 设置 `implement.md = COMPLETED`；
9. 同步 README 顶层状态为 `IMPLEMENTED`；
10. 提示用户检查实施结果，并选择提交或调整。

这不是恢复 Verify 阶段，而是实施完成的必要质量门槛。

## 8. 新增 `rudder-adjust`

新增命令：

```text
/rudder-adjust REQ-XXX [修改内容]
```

### 8.1 适用范围

命令用于 `implement.md = COMPLETED` 且尚未提交的需求。

已提交或已归档的 REQ 不允许使用该命令原地修改。

### 8.2 命令行为

1. 读取 `plan.md`、`tasks.md`、`implement.md` 和用户的修改描述；
2. 判断修改是否影响需求契约；
3. 用中文展示影响分析并请求用户确认；
4. 根据确认结果进入对应路径。

### 8.3 不改变契约的小修改

如果修改只涉及实现细节，且不改变 AC、页面结构、数据模型、依赖或范围：

- 直接更新任务清单和实施记录；
- 将 `implement.md` 置为 `IN_PROGRESS`；
- 允许用户再次执行 `/rudder-implement REQ-XXX`；
- 重新执行实施完成检查；
- 通过后恢复 `implement.md = COMPLETED`。

### 8.4 改变契约的需求变更

如果修改影响 AC、页面结构、技术契约、依赖或 Non-Goals：

- 更新 `plan.md` 并追加 Change Log；
- `plan.md = DRAFT`；
- `tasks.md = DRAFT`；
- `implement.md = OUTDATED`；
- 冻结 `src/` 修改；
- 同步 REQ 顶层状态为 `IMPLEMENTING`；
- 请求用户重新确认 PRD；
- 确认后重新执行 `/rudder-implement`。

该路径复用现有 `rudder-change` 的需求变更原则，但通过 `rudder-adjust` 提供实施后入口。

## 9. Commit 调整

`rudder-commit` 的前置条件改为：

```text
plan = APPROVED
∧ tasks = DONE
∧ implement = COMPLETED
```

提交前仍执行必要的代码清理和最终检查。提交成功后继续执行原有归档动作：

1. 使用 `git mv` 移动 REQ 目录；
2. 更新 `MASTER-PRD.md` 索引；
3. 回填 `commit.md` 的归档字段；
4. 归档后的 REQ 封存，不允许原地变更。

## 10. 需要同步修改的文件

实施本方案时，需要同步更新以下范围：

- `skills/rudder-plan.md`
- 新增 `skills/rudder-plan-confirm.md`
- `skills/rudder-implement.md`
- 新增 `skills/rudder-adjust.md`
- `skills/rudder-commit.md`
- `skills/rudder-change.md`
- `.rudder/workflow/lifecycle.md`
- `.rudder/workflow/states.md`
- `.rudder/workflow/gates.md`
- `.rudder/workflow/transitions.md`
- `.rudder/requirement/structure.md`
- `.rudder/templates/README.md`
- `.rudder/templates/implement.md`
- `.rudder/templates/commit.md`
- 删除或废弃 `.rudder/templates/verify.md`
- 删除或废弃 `.rudder/templates/review.md`
- `scripts/check-req.js`
- `README.md`
- `CLAUDE.md` 与 `AGENTS.md` 中引用的流程说明（如有过时内容）
- 运行 `npm run sync:skills` 更新命令投影

现有 `requirements/REQ-*` 目录需要单独迁移，不能在规则修改时静默改变历史证据。

## 11. 待确认事项

以下内容在正式实施方案前仍需确认：

1. `rudder-plan-confirm` 是否采用独立命令名，还是作为 `rudder-plan` 的重复调用模式？
2. `rudder-adjust` 对不改变契约的小修改，是否允许命令直接修改代码，还是必须再次由用户执行 `/rudder-implement`？
3. 现有已创建的 `verify.md` 与 `review.md` 是迁移为历史附件后删除，还是保留在现有 REQ 目录中并仅对新 REQ 使用 5 文件结构？
4. 现有 `REQ-001` 是否作为迁移样例一起调整，还是只修改框架规则，不改当前需求目录？

在这些事项确认前，不修改框架规则和现有需求产物。
