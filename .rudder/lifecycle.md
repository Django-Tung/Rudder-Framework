# Requirement Lifecycle — 状态机与门控

> 本文件是需求流转的**权威定义**，被 `AGENTS.md` 第 2 条直接引用。
> 每个需求拥有独立目录 `requirements/REQ-XXX-<kebab-name>/`，内含 **6 个**产物文件。
> 每个文件通过 **YAML frontmatter 的 `status` 字段**记录自身流转状态；
> Agent 执行任一动作后，必须**立刻**更新对应文件的 `status`。
>
> **例外文档**：`requirements/MASTER-PRD.md` 是全局文档，不属于任何阶段，
> frontmatter 用 `type: master-prd` 标记，**不设 `status` / `phase`**。

## 1. 阶段与产物总览

| 阶段 | 产物（证据文件） | 负责命令 | 负责技能 |
|------|-----------------|---------|---------|
| 1. Plan | `plan.md` | `/rudder-plan` | `rudder-plan` |
| 2. Tasks | `tasks.md` | `/rudder-implement`（起始步骤） | `rudder-implement` |
| 3. Implement | `implement.md` | `/rudder-implement` | `rudder-implement` |
| 4. Verify | `verify.md` | `/rudder-verify` | `rudder-verify` |
| 5. Review | `review.md` | `/rudder-review` | `rudder-review` |
| 6. Commit | `commit.md` | `/rudder-commit` | `rudder-commit` |

> **Archive 不是阶段**，是 Commit 的**后置动作**（见 §4.6）。
> **Import**（`/rudder-import`）是 pre-lifecycle 工具，不属于状态机（见 `.rudder/policies/import.md`）。

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

### 2.2 `tasks.md` — 任务清单

```
DRAFT ──[在 Implement 起始，按 plan.md 拆解]──► READY ──[逐条勾选至全部完成]──► DONE
  ▲                                                                              │
  └──────────────[review 打回 / 需求变更，需重新拆解]───────────────────────────┘
```

状态取值：`DRAFT` | `READY` | `DONE`
初值 / 重置值：`DRAFT`

- `status` **由勾选状态推导**且必须一致：无任务 → `DRAFT`；存在未勾选项 → `READY`；全部勾选 → `DONE`。
- 该一致性由 `scripts/check-tasks.js` 断言（防"先勾完再写代码"）。

### 2.3 `implement.md` — 代码实施

```
PENDING ──[开始实施]──► IN_PROGRESS ──[编码完成]──► COMPLETED
                            ▲                          │
                            │                          │
                            └────[review 打回返工]──────┘
```

状态取值：`PENDING` | `IN_PROGRESS` | `COMPLETED` | `OUTDATED`
初值：`PENDING`

- `OUTDATED` 为**需求变更专属失效态**（见 §4.4）：契约已变，旧实现作废。人工重新批准后，由 Implement 阶段重置回 `IN_PROGRESS` 起算。

### 2.4 `verify.md` — 机器验证

```
PENDING ──[三项检查全部 0 错误]──► PASS
   └─────[连续失败 3 次]────────► FAIL
```

状态取值：`PENDING` | `PASS` | `FAIL` | `INVALIDATED`
初值：`PENDING`

- `FAIL` 为**阻断态**：出现即停止自动修复循环，向人工报告，不得推进到 Review。
- `INVALIDATED` 为**需求变更专属失效态**（见 §4.4）：契约已变，旧验证证据作废。重新批准后重新执行 Verify，状态从 `PENDING` 起算。
- 从 `FAIL` 恢复需人工介入；修复后重新执行 Verify，状态回到 `PENDING` 起算。

### 2.5 `review.md` — 代码审查

```
PENDING ──[自检清单填写完毕]──► PENDING_HUMAN_REVIEW
                                         │
                          ┌──────────────┴──────────────┐
                    [人工通过]                    [人工打回]
                          ▼                             ▼
                      APPROVED                 CHANGES_REQUESTED
```

状态取值：`PENDING` | `PENDING_HUMAN_REVIEW` | `APPROVED` | `CHANGES_REQUESTED` | `INVALIDATED`
初值：`PENDING`

- `CHANGES_REQUESTED` 为**阻断态**：触发返工流程（见 §4.3）。
- `INVALIDATED` 为**需求变更专属失效态**（见 §4.4）：契约已变，旧审查记录作废。重新批准后重新走 Review，状态从 `PENDING` 起算。
- **只有人工**可以将 `PENDING_HUMAN_REVIEW` 转为 `APPROVED`，Agent 不得自行批准。

### 2.6 `commit.md` — 归档提交

```
PENDING ──[git commit 成功]──► DONE
```

状态取值：`PENDING` | `DONE`
初值：`PENDING`

- `commit.md` 额外承载归档字段（Archive 不单独成文件，见 §4.6）：
  `archived: true|false`、`archived_at: <YYYY-MM-DD>`、`archive_path: <相对路径>`。

## 3. 门控条件（Gate）

> 进入任一阶段前，必须先校验前置产物的状态。**门控不通过则立即停止并报告缺失项**，不得越级推进。

| 阶段 | 进入本阶段的前置条件 | 本阶段产出的状态 |
|------|---------------------|-----------------|
| Plan | 无 | `plan.md` = `DRAFT` → `APPROVED` |
| Tasks | `plan.md` = `APPROVED` | `tasks.md` = `DRAFT` → `READY` |
| Implement | `plan.md` = `APPROVED` ∧ `tasks.md` = `READY` | `implement.md` = `IN_PROGRESS` → `COMPLETED` |
| Verify | `implement.md` = `COMPLETED` | `verify.md` = `PASS` 或 `FAIL` |
| Review | `verify.md` = `PASS` | `review.md` = `PENDING_HUMAN_REVIEW` → `APPROVED` 或 `CHANGES_REQUESTED` |
| Commit | `plan`=`APPROVED` ∧ `tasks`=`DONE` ∧ `implement`=`COMPLETED` ∧ `verify`=`PASS` ∧ `review`=`APPROVED` | `commit.md` = `DONE` |

**Commit 是唯一需要五项前置全部满足的阶段。** 任一不满足时，必须停止并逐项报告缺失状态。

## 4. 异常流转

### 4.1 验证失败（verify → FAIL）

1. 自动修复循环**最多执行 3 轮**。
2. 第 3 轮仍未通过时，将 `verify.md` 的 `status` 置为 `FAIL`。
3. 记录三轮的失败命令、错误摘要与已尝试的修复措施。
4. 停止流程并向人工报告，**不得进入 Review 阶段**。

### 4.2 任务不一致（check-tasks 失败）

`scripts/check-tasks.js` 报错时（I1 拆解不完备 / I2 虚假完成 / status 与勾选不一致）：

1. 立即停止当前阶段推进。
2. 修正 `tasks.md`（补拆解或如实回退勾选），直至 `npm run check:tasks` 退出码 0。

### 4.3 审查打回（review → CHANGES_REQUESTED）

人工回复"要求修改：[具体问题]"时：

1. 将 `review.md` 的 `status` 置为 `CHANGES_REQUESTED`，作为**本轮审查被打回**的记录留存。
2. 将 `implement.md` 重置为 `IN_PROGRESS`，携带人工意见退回实施。
3. 将 `verify.md` 重置为 `PENDING`（旧验证证据随代码变更作废）。
4. 将 `tasks.md` 重置为 `DRAFT`（返工后需重新拆解/勾选）。
5. 返工完成后，将 `review.md` 重置为 `PENDING`，**重新执行** Verify → Review 全流程。

### 4.4 需求变更（范围蔓延 / Scope Creep）

当需求处于 Plan 未批准（`plan.md`=`DRAFT`）、已批准（`plan.md`=`APPROVED`）或实施中（`implement.md`=`IN_PROGRESS`）时发生范围变更，**绝不允许就地默默改代码**，必须走以下变更控制协议：

1. **评估与更新 Plan**：更新 `plan.md` 的 User Stories 与 AC，并在文件末尾追加/更新 `## 📝 Change Log`（记录日期、内容、原因、影响范围）。
2. **状态降级**：`plan.md` 重置为 `DRAFT`，等待人工重新批准。
3. **级联失效（Cascade Invalidation）**：契约已变，旧证据全部作废：
   - `tasks.md` → `DRAFT`（旧任务清单需重新拆解）
   - `implement.md` → `OUTDATED`（清空核心实现摘要）
   - `verify.md` → `INVALIDATED`（清空验证日志）
   - `review.md` → `INVALIDATED`（清空审查记录）
4. **代码冻结**：在人工回复“PRD 批准”前，**严禁**修改 `src/` 下任何代码。
5. **重新批准**：人工批准后，`OUTDATED` / `INVALIDATED` 由对应阶段重置回 `PENDING` 起算，重新走 Tasks → Implement → Verify → Review。

#### 归档后变更（Post-DONE Change）

若目标 REQ 已 `DONE` / 已归档，**禁止就地修改**。必须新建 REQ（如 REQ-002），在 Plan 中注明“继承/扩展自 REQ-001”，保持历史证据不可变。

### 4.5 整体回滚

需要丢弃全部实现时（如 `git reset --hard`）：将 `tasks.md` 重置为 `DRAFT`，`implement.md` 与 `verify.md` 重置为 `PENDING`，
`review.md` 重置为 `PENDING`，`plan.md` 保持 `APPROVED` 不变，然后从 Tasks 阶段重新开始。

### 4.6 归档（Archive，Commit 的后置动作）

当 `commit.md` = `DONE` 后，执行归档：

1. `git mv requirements/REQ-XXX-<kebab-name>/ requirements/archive/<YYYY-MM>-REQ-XXX-<kebab-name>/`（**必须用 `git mv` 保留重命名历史**）。
2. 运行 `node scripts/sync-master-prd.js`，更新 `MASTER-PRD.md` 索引（一次扫描即含最终路径）。
3. 回填 `commit.md` 的 `archived: true`、`archived_at`、`archive_path`。
4. **归档即封存**：已归档需求的任何后续变更，应**开新 REQ**，不就地修改归档目录。

> 归档失败（如 `git mv` 冲突）时停止并报告，不得丢弃需求目录。归档顺序必须是「先移动，后同步」。

## 5. 状态重置的默认值

> 重置某项状态时，一律回到该产物的**初值**（即 §2 各节标注的初值，也等于 `.rudder/templates/` 中对应模板的 frontmatter 初值）。

| 产物 | 初值 / 重置值 |
|------|--------------|
| `plan.md` | `DRAFT` |
| `tasks.md` | `DRAFT` |
| `implement.md` | `PENDING` |
| `verify.md` | `PENDING` |
| `review.md` | `PENDING` |
| `commit.md` | `PENDING` |

> ⚠️ 上表的“重置值”适用于**常规回滚**（review 打回 §4.3、整体回滚 §4.5）。
> `OUTDATED`（implement）与 `INVALIDATED`（verify / review）是**需求变更专属失效态**（§4.4），
> 表示“旧证据作废、等待重新批准”，不属于“重置回初值”；重新批准后由对应阶段重置回 `PENDING` 起算。
