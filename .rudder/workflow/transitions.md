# 异常流转

> 本文件回答「**异常情况怎么走**」。状态取值见 [`states.md`](states.md)，门禁见 [`gates.md`](gates.md)。
>
> 共 4 类：实施检查失败 / 任务不一致 / 需求变更 / 归档。

## 1. 实施检查失败

1. `rudder-implement` 按顺序执行 typecheck、lint、build、check:skills、check:req。
2. 任一命令失败时，读取错误并自动修复，最多执行 3 轮。
3. 第 3 轮仍失败时，将 `implement.md` 保持为 `IN_PROGRESS`，记录失败命令与修复尝试，停止并向人工报告。
4. 通过全部检查后，才允许将 `implement.md` 置为 `COMPLETED`。

## 2. 任务不一致（check-req 失败）

`scripts/check-req.js` 报错时（I1 拆解不完备 / I2 虚假完成 / status 与勾选不一致 /
`README.md` 顶层状态推导不一致 / 依赖闭包与 `STALE` 不一致）：

1. 立即停止当前阶段推进。
2. 修正 `tasks.md`（补拆解或如实回退勾选）或 `README.md` 的 `status` / `stale` 字段，
   直至 `npm run check:req` 退出码 0。

> 校验内容与实现见 [`states.md`](states.md) §2 与 [`gates.md`](gates.md) §5。

## 3. 需求变更（范围蔓延 / Scope Creep）

当需求处于 Plan 未批准（`plan.md`=`DRAFT`）、已批准（`plan.md`=`APPROVED`）或实施中
（`implement.md`=`IN_PROGRESS`）时发生范围变更，**绝不允许就地默默改代码**，必须走以下变更控制协议：

1. **评估与更新 Plan**：更新 `plan.md` 的 User Stories 与 AC，并在文件末尾追加/更新
   `## 📝 Change Log`（记录**日期、内容、原因、影响范围**四要素）。
2. **状态降级**：`plan.md` 重置为 `DRAFT`，等待人工重新批准。
3. **级联失效（Cascade Invalidation）**：契约已变，旧证据全部作废——逐文件清单：
   - `tasks.md` → `DRAFT`（旧任务清单需重新拆解）
   - `implement.md` → `OUTDATED`（清空核心实现摘要）
   - `README.md` → 顶层 `status` = `IMPLEMENTING`（推导结果）
4. **代码冻结**：在人工回复"PRD 批准"前，**严禁**修改 `src/` 下任何代码。
5. **重新批准**：人工批准后，`OUTDATED` 由 Implement 阶段重置回 `IN_PROGRESS` 起算，
   重新走 Tasks → Implement。

### 4.1 跨 REQ 传导（下游标记 STALE）

本 REQ 的契约变更**不一定**影响依赖它的下游 REQ。判定分两步，**机器只做第一步**：

1. **机器**：依据 `MASTER-PRD.md` 的 `AUTO-INDEX` 依赖列计算直接与间接依赖闭包，
   把闭包内每个 REQ 的 `README.md` 标 `stale: true`，并写入 `stale_reason`（触发源 REQ-ID）与 `stale_since`。
2. **人**：对每个 `STALE` 逐个裁决「契约是否真受影响」——一跳一裁决。
   - **未受影响** → 完成必要的 Implement 检查后摘除 `STALE`（`stale: false`，清空 `stale_reason` / `stale_since`）。
   - **真受影响** → 该下游 REQ 走一遍本节 §3 的完整协议，其**自己的下游**再被标 `STALE`（下一跳，再裁决一次）。

> 标记时会话 Agent **MUST NOT** 自行判定"未受影响"并摘除 `STALE`，也 **MUST NOT** 自行推进该 REQ 的任何阶段。
> 完整规则（闭包计算、`STALE` 与 `OUTDATED` 的区别）见 [`../analysis/dependency.md`](../analysis/dependency.md)。

### 4.2 归档后变更（Post-DONE Change）

若目标 REQ 已 `DONE` / 已归档，**禁止就地修改**。必须新建 REQ（如 REQ-002），
在 `plan.md` 中注明"继承/扩展自 REQ-001"，保持历史证据不可变。

## 5. 整体回滚

需要丢弃全部实现时：

- `tasks.md` 重置为 `DRAFT`
- `implement.md` 重置为 `PENDING`
- `plan.md` **保持 `APPROVED` 不变**
- `README.md` 顶层 `status` 同步回 `PLANNED`

然后从 Tasks 阶段重新开始。

> **与 §3 的区别**：整体回滚是**丢弃实现但契约不变**，故 `plan.md` 保持 `APPROVED`，状态回到**初值**；
> 需求变更是**契约本身变了**，故 `plan.md` 退回 `DRAFT`，实现进入 `OUTDATED` **失效态**。

## 6. 归档（Archive，Commit 的后置动作）

当 `commit.md` = `DONE` 后，执行归档：

1. `git mv requirements/REQ-XXX-<kebab-name>/ requirements/archive/<YYYY-MM>-REQ-XXX-<kebab-name>/`
   （**必须用 `git mv` 保留重命名历史**）。
2. 运行 `node scripts/sync-master-prd.js`，更新 `MASTER-PRD.md` 索引（一次扫描即含最终路径）。
3. 回填 `commit.md` 的 `archived: true`、`archived_at`、`archive_path`。
4. **归档即封存**：已归档需求的任何后续变更，应**开新 REQ**，不就地修改归档目录。

> 归档失败（如 `git mv` 冲突）时停止并报告，不得丢弃需求目录。
> 归档顺序必须是「**先移动，后同步**」——否则索引会记下已失效的旧路径。
