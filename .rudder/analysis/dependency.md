# 依赖门禁与变更传播

> 本文件回答「**REQ 之间的依赖怎么用**」：如何门禁、变更如何跨 REQ 传播、`STALE` 怎么标记与摘除。
> 依赖边的**唯一来源**是 `MASTER-PRD.md` 的 `AUTO-INDEX` 依赖列（最终派生自各 REQ 的 `README.md` 的 `deps`）。
> 分工：**机器算闭包与标记（结构），人裁决契约是否真受影响（语义）**。

## 1. Plan 依赖门禁

进入 Plan 阶段的前置条件**必须**是「其依赖的每个 REQ 的 `plan.md` 均为 `APPROVED`」，
**而非** `COMMITTED`。

REQ 真正依赖的是依赖方「**定下来要做什么**」（`plan.md` 中的 types / mocks / services 契约），
不是它已提交。要求对方先提交会让并行开发退化成串行，收益为零。

门禁的阻断行为（含逐项报告）见 [`../workflow/gates.md`](../workflow/gates.md) §3。

## 2. 依赖图的质量

**依赖图越密 = 拆分质量越差。**

级联裁决的次数与依赖边数量正相关，每条依赖边都是一次潜在的人工裁决成本。
因此「**每个 REQ 尽可能自洽**」是 Plan 阶段的质量目标，而不是"以后再说"的优化项。

- 创建或修改 REQ 时，`README.md` 的 `deps` **必须如实**记录跨 REQ 的契约依赖；
- **禁止**为省去登记而遗漏已知依赖——漏登记的依赖不会消失，只会在变更时**静默地**让下游失真。

## 3. `STALE` 与 `OUTDATED` / `INVALIDATED` 是两套机制

这两个概念容易混淆，在此**显式区分**：

| | `OUTDATED`（implement）/ `INVALIDATED`（verify、review） | `STALE` |
|---|---|---|
| **触发** | **同一 REQ 内**的契约变更 | **跨 REQ** 的上游变更 |
| **落盘** | 对应**产物文件**的 `status` | `README.md` 的 `stale` **布尔字段** |
| **判定者** | 机器（变更即作废，无条件） | 机器标记，**人裁决**是否真受影响 |
| **后果** | 该产物作废，回对应阶段重做 | 未受影响则重新 verify 后摘除；真受影响才回 `IMPLEMENTING` |

**`STALE` 不进入顶层 `status` 枚举**——它是与阶段正交的标记（见 [`../workflow/states.md`](../workflow/states.md) §2.2）。

判定者不同是关键：`OUTDATED` 是"证据必然作废"，`STALE` 是"**可能**受影响，等人判断"。
把二者合并会让机器替人做语义判断。

## 4. 闭包计算与标记

上游 REQ 发生契约变更时，机器**必须**依据 `AUTO-INDEX` 的依赖列计算**直接与间接**依赖闭包，
并把闭包内每个 REQ 标记为 `STALE`。

标记时**必须**同时写入：

- `stale: true`
- `stale_reason`：**触发它的上游 REQ-ID**（即变更源头，不是中间那一跳）
- `stale_since`：日期

**标记不改变阶段**：`STALE` REQ 的顶层 `status` 保持原值不变，其 6 个产物的 `status` **不得**被自动修改。

## 5. 懒级联：机器算闭包 → 人裁决 → 一跳一裁决

```text
REQ-001 契约变更
  ↓ 机器：读 AUTO-INDEX 的依赖列，算直接 + 间接依赖闭包
  ↓ 机器：把闭包内每个 REQ 的 README.md 标 stale: true（stale_reason = REQ-001）
  ↓ 人：对每个 STALE 判断「契约是否真受影响」
       ├─ 没受影响 → 重新跑 verify 通过 → stale: false（清空 reason / since）
       └─ 真受影响 → 标 OUTDATED / INVALIDATED（transitions §4）
                    → 顶层 status 回 IMPLEMENTING
                    → 把它的下游再标 STALE（下一跳，再裁决一次）
```

### 5.1 「一跳一裁决」的含义

变更传播**一跳一跳走**，每跳人裁决一次。真受影响的 REQ **必须先把自身处理完**，
其下游的 `STALE` 标记**在下一跳才产生裁决动作**——不得一次性把整条链上的裁决都做了。

**上游未受影响时下游不受牵连**：REQ-001 变更、REQ-003 被标 `STALE`、人裁决 REQ-003 未受影响，
则 REQ-005（依赖 REQ-003）**不得**被标 `STALE`，也**不得**发起针对它的裁决。

### 5.2 摘除与升级规则

| 裁决结论 | 动作 |
|---|---|
| **未受影响** | 重新执行 Verify 并通过后，摘除 `STALE`（`stale: false`，清空 `stale_reason` 与 `stale_since`） |
| **真受影响** | 走完整变更控制协议：`implement.md` → `OUTDATED`、`verify.md` / `review.md` → `INVALIDATED`、`plan.md` → `DRAFT`；顶层 `status` 随推导回到 `IMPLEMENTING`；随即把**它的下游**标 `STALE` |

### 5.3 Agent 不得代替人裁决

处于 `stale: true` 且尚未经人裁决的 REQ：

- Agent **MUST NOT** 自行判定"未受影响"并摘除 `STALE`；
- Agent **MUST NOT** 自行推进该 REQ 的任何阶段（包括跑 Verify 来自证清白）。

机器只负责**标记**与**算闭包**，语义判断权在人。

## 6. 与脚本的关系

- 依赖边**只从 `AUTO-INDEX` 依赖列读取**，无第二处来源（避免 `README.md` 与索引不一致时产生歧义）。
- 闭包与 `STALE` 的一致性由 `npm run check:req` 断言：标记缺失、`stale_reason` 指向错误、
  或已被裁决却未摘除，协议失败（见 [`../workflow/gates.md`](../workflow/gates.md) §5）。
