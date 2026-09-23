# 需求生命周期 — 阶段与产物总览

> 本文件是需求流转的**流程起点**，由 `AGENTS.md` Core Directive 2 引用。
> 本文件只回答「有哪些阶段、产出哪个文件、谁负责」——状态取值见 [`states.md`](states.md)，
> 前置条件见 [`gates.md`](gates.md)，异常路径见 [`transitions.md`](transitions.md)。

## 0. 双层模型

Rudder 同时维护**两层**状态，二者职责不同：

| 层 | 承载处 | 回答的问题 |
|---|---|---|
| **REQ 顶层状态** | `requirements/REQ-XXX-<kebab-name>/README.md` 的 `status` | 这个需求**整体**走到哪了 |
| **阶段产物状态** | 6 个阶段产物各自的 frontmatter `status` | 这个**文件**自身的流转状态 |

顶层状态**由阶段产物状态推导得出**，`README.md` 中存储的只是它的持久化副本；
两者的一致性由 `scripts/check-req.js` 断言。推导表见 [`states.md`](states.md) §2。

### 例外文档：`requirements/MASTER-PRD.md`

`requirements/MASTER-PRD.md` 是全局文档，**不属于任何阶段**：

- frontmatter 用 `type: master-prd` 标记，**不设 `status` / `phase`**；
- 其 `AUTO-INDEX` 索引块由 `scripts/sync-master-prd.js` 派生维护；
- 其 `pending_maps` 字段承载「待批准的拆分」，是**管道数据**而非阶段状态，
  因此**不违反**上述「不设 `status` / `phase`」的约束（见 [`../requirement/structure.md`](../requirement/structure.md)）。

它也是两条入口的共同主记录：首次进入 `/rudder-import` 或 `/rudder-plan` 时必须初始化；之后记录已确认的项目级 UI 主风格、全局业务规则、术语、待批准拆分和 REQ 索引。

## 1. 阶段与产物总览

| 阶段 | 产物（证据文件） | 负责命令 | 负责技能 |
|------|-----------------|---------|---------|
| 1. Plan | `plan.md` | `/rudder-plan` | `rudder-plan` |
| 2. Tasks | `tasks.md` | `/rudder-implement`（起始步骤） | `rudder-implement` |
| 3. Implement | `implement.md` | `/rudder-implement` | `rudder-implement` |
| 4. Verify | `verify.md` | `/rudder-verify` | `rudder-verify` |
| 5. Review | `review.md` | `/rudder-review` | `rudder-review` |
| 6. Commit | `commit.md` | `/rudder-commit` | `rudder-commit` |

每个 REQ 目录完整含 **7 个**文件（上述 6 个产物 + 承载顶层状态的 `README.md`），
结构见 [`../requirement/structure.md`](../requirement/structure.md)。

> **Archive 不是阶段**，是 Commit 的**后置动作**（见 [`transitions.md`](transitions.md) §6）。
> **Import 不是阶段**，是**终止式管道**（`imported → analyzed → approved → archived`），
> 见 [`../import/sources.md`](../import/sources.md)。

## 2. 需求的两条入口

| 路径 | 触发 | 是否经过 `pending_maps` | 第一个批准点 |
|---|---|---|---|
| **路径 A（批量）** | `/rudder-import <文档>` → 分析拆分 → 人工批准拆分 | 是 | 拆分批准（`pending_maps[i].status` = `APPROVED`） |
| **路径 B（增量）** | 人工直接描述需求 → `/rudder-plan` | 否 | `plan.md` 的 `APPROVED` |

两条入口在 `plan.md` 被批准之后**完全汇流**，后续阶段无差别。

两条入口在产出正式分析或 PRD 前，都必须完成两项人工确认：

1. 确认项目 UI 主风格，并写入 `MASTER-PRD.md`；
2. 回答所有影响范围、业务规则、边界、依赖或 UI 行为的澄清问题。

未完成确认时只能停留在提问/草稿阶段，不得猜测补全或推进门禁。

## 3. 阶段间的依赖门禁

进入 Plan 阶段前，必须确认**其依赖的每个 REQ 的 `plan.md` 均为 `APPROVED`**（而非 `COMMITTED`）——
真正被依赖的是对方「定下来要做什么」的契约，不是它已提交。详见 [`gates.md`](gates.md) §3 与
[`../analysis/dependency.md`](../analysis/dependency.md)。

## 4. 状态更新责任

Agent 执行任一阶段动作后，必须**立刻**更新：

1. 对应产物文件的 `status`（取值见 [`states.md`](states.md) §1）；
2. 该 REQ `README.md` 的顶层 `status`（推导结果见 [`states.md`](states.md) §2）。

第 2 项不是可选的收尾动作——`npm run check:req` 会断言二者一致，不一致即失败。
