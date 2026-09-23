# 状态取值 — 枚举与推导

> 本文件是**所有状态取值的唯一定义处**。其他文件（含 `gates.md` / `transitions.md` / `requirement/structure.md`）只引用本节，**不复述**。
> 冲突时以本文件为准。

状态分两层（见 [`lifecycle.md`](lifecycle.md) §0）：

- **§1 阶段产物状态**：6 个产物各自的 frontmatter `status`。
- **§2 REQ 顶层状态**：`README.md` 的 `status`，**由 §1 推导得出**。

---

## 1. 阶段产物状态枚举

> ⚠️ 每个产物**只允许**使用本节为其列出的取值。表中未列出的状态一律非法。

### 1.1 `plan.md` — 需求规划

```
DRAFT ──[人工批准：回复"PRD 批准"]──► APPROVED
  ▲                                      │
  └──────────[需求变更，退回重审]─────────┘
```

状态取值：`DRAFT` | `APPROVED`
初值：`DRAFT`

### 1.2 `tasks.md` — 任务清单

```
DRAFT ──[在 Implement 起始，按 plan.md 拆解]──► READY ──[逐条勾选至全部完成]──► DONE
  ▲                                                                              │
  └──────────────[review 打回 / 需求变更，需重新拆解]───────────────────────────┘
```

状态取值：`DRAFT` | `READY` | `DONE`
初值 / 重置值：`DRAFT`

- `status` **由勾选状态推导**且必须一致：无任务 → `DRAFT`；存在未勾选项 → `READY`；全部勾选 → `DONE`。
- 该一致性由 `scripts/check-req.js` 断言（防"先勾完再写代码"）。

### 1.3 `implement.md` — 代码实施

```
PENDING ──[开始实施]──► IN_PROGRESS ──[编码完成]──► COMPLETED
                            ▲                          │
                            │                          │
                            └────[review 打回返工]──────┘
```

状态取值：`PENDING` | `IN_PROGRESS` | `COMPLETED` | `OUTDATED`
初值：`PENDING`

- `OUTDATED` 为**需求变更专属失效态**（见 [`transitions.md`](transitions.md) §4）：契约已变，旧实现作废。人工重新批准后，由 Implement 阶段重置回 `IN_PROGRESS` 起算。

### 1.4 `verify.md` — 机器验证

```
PENDING ──[三项检查全部 0 错误]──► PASS
   └─────[连续失败 3 次]────────► FAIL
```

状态取值：`PENDING` | `PASS` | `FAIL` | `INVALIDATED`
初值：`PENDING`

- `FAIL` 为**阻断态**：出现即停止自动修复循环，向人工报告，不得推进到 Review。
- `INVALIDATED` 为**需求变更专属失效态**（见 [`transitions.md`](transitions.md) §4）：契约已变，旧验证证据作废。重新批准后重新执行 Verify，状态从 `PENDING` 起算。
- 从 `FAIL` 恢复需人工介入；修复后重新执行 Verify，状态回到 `PENDING` 起算。

### 1.5 `review.md` — 代码审查

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

- `CHANGES_REQUESTED` 为**阻断态**：触发返工流程（见 [`transitions.md`](transitions.md) §3）。
- `INVALIDATED` 为**需求变更专属失效态**（见 [`transitions.md`](transitions.md) §4）：契约已变，旧审查记录作废。重新批准后重新走 Review，状态从 `PENDING` 起算。
- **只有人工**可以将 `PENDING_HUMAN_REVIEW` 转为 `APPROVED`，Agent 不得自行批准。

### 1.6 `commit.md` — 归档提交

```
PENDING ──[git commit 成功]──► DONE
```

状态取值：`PENDING` | `DONE`
初值：`PENDING`

- `commit.md` 额外承载归档字段（Archive 不单独成文件，见 [`transitions.md`](transitions.md) §6）：
  `archived: true|false`、`archived_at: <YYYY-MM-DD>`、`archive_path: <相对路径>`。

---

## 2. REQ 顶层状态枚举与推导

`README.md` 的顶层 `status` **只允许**取以下 7 个值之一，且 **必须由 6 个阶段产物的 `status` 推导得出**：

| 顶层 `status` | 推导条件 |
|---|---|
| `PLANNED` | `plan.md` ∈ {`DRAFT`,`APPROVED`} ∧ `implement.md` = `PENDING` |
| `IMPLEMENTING` | `implement.md` ∈ {`IN_PROGRESS`,`OUTDATED`} 或 `review.md` = `CHANGES_REQUESTED` |
| `VERIFYING` | `implement.md` = `COMPLETED` ∧ `verify.md` ∈ {`PENDING`,`FAIL`} |
| `VERIFIED` | `verify.md` = `PASS` ∧ `review.md` = `PENDING` |
| `REVIEWING` | `verify.md` = `PASS` ∧ `review.md` = `PENDING_HUMAN_REVIEW` |
| `REVIEWED` | `review.md` = `APPROVED` ∧ `commit.md` = `PENDING` |
| `COMMITTED` | `commit.md` = `DONE` |

**判定顺序**：上表**自上而下**匹配，首个满足者即结果。这与判据本身不冲突（各行互斥），但脚本实现须固定此顺序。

### 2.1 为什么落盘而不是纯推导

`tasks.md` 的 `status` 已有完全相同的先例——它由勾选状态推导且必须一致，由脚本断言。
沿用同一范式，不发明新机制：**落盘保证人可读、脚本可断言，推导规则保证它不会成为第二处真相源。**

### 2.2 `stale` 不进入该枚举

`stale` 是与阶段**正交**的跨 REQ 标记，与走到了哪个阶段无关，因此单独一个布尔字段，
**不进入** `status` 枚举。它与 `OUTDATED` / `INVALIDATED` 是两套机制，区别见
[`../analysis/dependency.md`](../analysis/dependency.md) §3。

### 2.3 一致性责任

- 执行任何阶段动作并更新了阶段产物 `status` 后，Agent **必须**同步更新 `README.md` 的 `status`，使其等于上表的推导结果。
- `npm run check:req` 断言二者一致；不符时脚本以非零退出码报告该 REQ，并指出**期望值与实际值**。

---

## 3. 状态重置的默认值

> 重置某项状态时，一律回到该产物的**初值**（即 §1 各节标注的初值，
> 也等于 [`../templates/`](../templates/) 中对应模板的 frontmatter 初值）。
> **`tasks.md` 是唯一例外**：它的值由勾选状态推导（见 §1.2 与 `check-req.js` 的一致性断言），
> 模板给出的是**已拆解态** `READY`，而"未拆解"的初值是 `DRAFT`——两者不是同一个场景。

| 产物 | 初值 / 重置值 |
|------|--------------|
| `plan.md` | `DRAFT` |
| `tasks.md` | `DRAFT`（未拆解）/ `READY`（已拆解，含未勾选项） |
| `implement.md` | `PENDING` |
| `verify.md` | `PENDING` |
| `review.md` | `PENDING` |
| `commit.md` | `PENDING` |
| `README.md`（顶层状态） | `PLANNED` |

> ⚠️ 上表的"重置值"适用于**常规回滚**（review 打回 [`transitions.md`](transitions.md) §3、整体回滚 §5）。
> `OUTDATED`（implement）与 `INVALIDATED`（verify / review）是**需求变更专属失效态**
> （[`transitions.md`](transitions.md) §4），表示"旧证据作废、等待重新批准"，
> **不属于**"重置回初值"；重新批准后由对应阶段重置回 `PENDING` 起算。
