# 阶段门禁（Gate）

> 本文件回答「**何时允许进入下一阶段**」。状态取值见 [`states.md`](states.md)，异常路径见 [`transitions.md`](transitions.md)。
>
> 总原则：进入任一阶段前，必须先校验前置产物的状态。**门控不通过则立即停止并报告缺失项**，不得越级推进。

## 1. 门控表

| 阶段 | 进入本阶段的前置条件 | 本阶段产出的状态 |
|------|---------------------|-----------------|
| Plan | `MASTER-PRD.md` 已存在且 UI 主风格已人工确认；所有重大澄清问题已回答；依赖方 `plan.md` = `APPROVED`（路径 A 另需拆分已 `APPROVED`） | `plan.md` = `DRAFT` → `APPROVED` |
| Tasks | `plan.md` = `APPROVED` | `tasks.md` = `DRAFT` → `READY` |
| Implement | `plan.md` = `APPROVED` ∧ `tasks.md` = `READY` | `implement.md` = `IN_PROGRESS` → `COMPLETED` |
| Commit | `plan`=`APPROVED` ∧ `tasks`=`DONE` ∧ `implement`=`COMPLETED` | `commit.md` = `DONE` |

**Commit 是唯一需要全部前置满足的阶段。** 任一不满足时，必须停止并逐项报告三个前置状态的当前值与期望值，且不得产生 `commit.md`。

## 2. Gate 总览（判定顺序）

```text
依赖门禁 ──► Plan ──► Tasks ──► Implement ──► Commit
  (§3)        │         │           │            │          │          │
              │         │           │            └─ 三项前置全满足
              │         │           │
              │         │           └─────────────────────── implement = COMPLETED
              │         └────────────────────────────────── tasks = READY ∧ plan = APPROVED
              │         └──────────────────────────────────────────────── plan = APPROVED
              └────────────────────────────────────────────────────────── 依赖方 plan = APPROVED
```

**阻断态**（出现即停止，不得推进）：

- `check-req` 报错 → 停止推进并修正 `tasks.md` / `README.md`（[`transitions.md`](transitions.md) §2）。

## 3. 依赖门禁（跨 REQ）

**进入 Plan 阶段的前置条件是「其依赖的每个 REQ 的 `plan.md` 均为 `APPROVED`」，而非 `COMMITTED`。**

REQ 真正依赖的是依赖方「**定下来要做什么**」——即 `plan.md` 中的 types / mocks / services 契约——
不是它已经提交。要求对方先 `COMMITTED` 会让并行开发退化为串行开发，收益为零。

判定依据：本 REQ `README.md` 的 `deps` 字段（经由 `MASTER-PRD.md` 的 `AUTO-INDEX` 依赖列派生）。

### 3.1 被允许

- REQ-003 依赖 REQ-001；REQ-001 的 `plan.md` = `APPROVED`，但 `commit.md` 仍为 `PENDING`
  → REQ-003 **允许**进入 Plan 阶段，**不因** REQ-001 未提交而阻断。

### 3.2 被阻断

- REQ-003 依赖 REQ-001；REQ-001 的 `plan.md` = `DRAFT`
  → REQ-003 **不得**进入 Plan 阶段；Agent **必须**报告被阻断的具体依赖项与其当前状态。

> 依赖图越密 = 拆分质量越差。依赖于人裁决的级联次数与依赖边数量正相关，
> 因此「每个 REQ 尽可能自洽」是 Plan 阶段的质量目标。详见 [`../analysis/dependency.md`](../analysis/dependency.md)。

## 4. 作用域门禁（上下文边界）

Plan → Commit 窗口内，Agent **仅允许**读取 `requirements/MASTER-PRD.md` 与当前 REQ 目录。

**导入阶段例外**：导入必须同时读取外部待导入文档与 `MASTER-PRD.md` 才能判定全局/局部；首次导入若主文档不存在，必须先创建并确认 UI 主风格，
故不在该约束内。见 [`../import/sources.md`](../import/sources.md) §4。

## 5. 机器门禁（确定性脚本）

人工状态门禁之外，以下脚本是**确定性**的，退出码非 0 即视为未通过：

| 阶段 | 命令 | 断言内容 |
|---|---|---|
| Implement | `npm run check:req` | tasks 勾选一致性（I1 / I2）、`README.md` 顶层状态推导一致性、依赖闭包与 `STALE` 一致性 |
| Implement | `npm run check:skills` | 技能投影与权威源无漂移 |
| Implement | `node scripts/check-import.js <IMP 目录>` | IMP 的 `metadata.yaml` / `analysis.md` 齐备且取值合法 |
| Commit | `npm run sync:master -- --check` | `MASTER-PRD.md` 的 `AUTO-INDEX` 与各 REQ 的 `README.md` 一致 |

> `check:skills` 与 `typecheck` / `lint` / `build` **同级**：任一非零退出都必须阻止 `implement.md` 进入 `COMPLETED`。
