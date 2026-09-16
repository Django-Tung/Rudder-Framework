# Requirement Lifecycle — 状态机与门控

> 本文件是需求流转的**权威定义**，被 `AGENTS.md` 第 2 条直接引用。
> 每个需求拥有独立目录 `requirements/REQ-XXX-<kebab-name>/`，内含 5 个产物文件。
> 每个文件通过 **YAML frontmatter 的 `status` 字段**记录自身流转状态；
> Agent 执行任一动作后，必须**立刻**更新对应文件的 `status`。

## 1. 阶段与产物总览

| 阶段 | 产物（证据文件） | 负责命令 | 负责技能 |
|------|-----------------|---------|---------|
| 1. Plan | `plan.md` | `/rudder-plan` | `rudder-plan` |
| 2. Implement | `implement.md` | `/rudder-implement` | `rudder-implement` |
| 3. Verify | `verify.md` | `/rudder-verify` | `rudder-verify` |
| 4. Review | `review.md` | `/rudder-review` | `rudder-review` |
| 5. Commit | `commit.md` | `/rudder-commit` | `rudder-commit` |

## 2. 各产物状态枚举

> ⚠️ 每个产物**只允许**使用本节为其列出的取值。表中未列出的状态一律非法。

### 2.1 `plan.md` — 需求规划

```
DRAFT ──[人工批准：回复"PRD 批准"]──► APPROVED
  ▲                                      │
  └──────────[需求变更，退回重审]─────────┘
```

状态取值：`DRAFT` | `APPROVED`
初值：`DRAFT`

### 2.2 `implement.md` — 代码实施

```
PENDING ──[开始实施]──► IN_PROGRESS ──[编码完成]──► COMPLETED
                            ▲                          │
                            │                          │
                            └────[review 打回返工]──────┘
```

状态取值：`PENDING` | `IN_PROGRESS` | `COMPLETED`
初值：`PENDING`

### 2.3 `verify.md` — 机器验证

```
PENDING ──[三项检查全部 0 错误]──► PASS
   └─────[连续失败 3 次]────────► FAIL
```

状态取值：`PENDING` | `PASS` | `FAIL`
初值：`PENDING`

- `FAIL` 为**阻断态**：出现即停止自动修复循环，向人工报告，不得推进到 Review。
- 从 `FAIL` 恢复需人工介入；修复后重新执行 Verify，状态回到 `PENDING` 起算。

### 2.4 `review.md` — 代码审查

```
PENDING ──[自检清单填写完毕]──► PENDING_HUMAN_REVIEW
                                         │
                          ┌──────────────┴──────────────┐
                    [人工通过]                    [人工打回]
                          ▼                             ▼
                      APPROVED                 CHANGES_REQUESTED
```

状态取值：`PENDING` | `PENDING_HUMAN_REVIEW` | `APPROVED` | `CHANGES_REQUESTED`
初值：`PENDING`

- `CHANGES_REQUESTED` 为**阻断态**：触发返工流程（见 §4.2）。
- **只有人工**可以将 `PENDING_HUMAN_REVIEW` 转为 `APPROVED`，Agent 不得自行批准。

### 2.5 `commit.md` — 归档提交

```
PENDING ──[git commit 成功]──► DONE
```

状态取值：`PENDING` | `DONE`
初值：`PENDING`

## 3. 门控条件（Gate）

> 进入任一阶段前，必须先校验前置产物的状态。**门控不通过则立即停止并报告缺失项**，不得越级推进。

| 阶段 | 进入本阶段的前置条件 | 本阶段产出的状态 |
|------|---------------------|-----------------|
| Plan | 无 | `plan.md` = `DRAFT` |
| Implement | `plan.md` = `APPROVED` | `implement.md` = `IN_PROGRESS` → `COMPLETED` |
| Verify | `implement.md` = `COMPLETED` | `verify.md` = `PASS` 或 `FAIL` |
| Review | `verify.md` = `PASS` | `review.md` = `PENDING_HUMAN_REVIEW` → `APPROVED` 或 `CHANGES_REQUESTED` |
| Commit | `plan`=`APPROVED` ∧ `implement`=`COMPLETED` ∧ `verify`=`PASS` ∧ `review`=`APPROVED` | `commit.md` = `DONE` |

**Commit 是唯一需要四项前置全部满足的阶段。** 任一不满足时，必须停止并逐项报告缺失状态。

## 4. 异常流转

### 4.1 验证失败（verify → FAIL）

1. 自动修复循环**最多执行 3 轮**。
2. 第 3 轮仍未通过时，将 `verify.md` 的 `status` 置为 `FAIL`。
3. 记录三轮的失败命令、错误摘要与已尝试的修复措施。
4. 停止流程并向人工报告，**不得进入 Review 阶段**。

### 4.2 审查打回（review → CHANGES_REQUESTED）

人工回复"要求修改：[具体问题]"时：

1. 将 `review.md` 的 `status` 置为 `CHANGES_REQUESTED`，作为**本轮审查被打回**的记录留存。
2. 将 `implement.md` 重置为 `IN_PROGRESS`，携带人工意见退回实施。
3. 将 `verify.md` 重置为 `PENDING`（旧验证证据随代码变更作废）。
4. 返工完成后，将 `review.md` 重置为 `PENDING`，**重新执行** Verify → Review 全流程。

### 4.3 需求变更（范围蔓延）

Plan 阶段之后再需要变更范围时：

1. 将 `plan.md` 退回 `DRAFT`，更新 Scope / AC / UI 文案。
2. 将 `implement.md` 重置为 `PENDING`，`verify.md` 重置为 `PENDING`。
3. 重新走"人工批准"门控，批准后方可继续实施。

### 4.4 整体回滚

需要丢弃全部实现时（如 `git reset --hard`）：将 `implement.md` 与 `verify.md` 重置为 `PENDING`，
`review.md` 重置为 `PENDING`，`plan.md` 保持 `APPROVED` 不变，然后从 Implement 阶段重新开始。

## 5. 状态重置的默认值

> 重置某项状态时，一律回到该产物的**初值**（即 §2 各节标注的初值，也等于 `.rudder/templates/` 中对应模板的 frontmatter 初值）。

| 产物 | 初值 / 重置值 |
|------|--------------|
| `plan.md` | `DRAFT` |
| `implement.md` | `PENDING` |
| `verify.md` | `PENDING` |
| `review.md` | `PENDING` |
| `commit.md` | `PENDING` |
