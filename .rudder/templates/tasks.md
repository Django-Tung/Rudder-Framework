---
id: REQ-XXX
status: READY
phase: tasks
created: ""
---

# 任务清单: [需求名称]

> 本文件是 Implement 阶段的执行进度清单，由 AI 依据 `plan.md` 拆解，并在实施过程中实时勾选。
> **status 由勾选状态推导**：`DRAFT`（未拆解）| `READY`（已拆解，存在未勾选项）| `DONE`（全部勾选）。
> `scripts/check-tasks.js` 断言 status 与勾选一致（防"先勾完再写代码"）。

## 状态 (Status)

READY

## 任务拆解 (Task Breakdown)

> 每条任务须标注对应验收标准编号（如 AC-1），`check-tasks.js` 断言每条 AC 至少被一条任务覆盖（不变量 I1）。
> 分类（Types/Mocks/Services/UI）按 Contract-First 顺序；若需求无 UI，则省略 UI 分类并在此注明。

### 类型定义 (Types)

- [ ] [T-01] 定义 `src/types/xxx.ts`（对应 AC-x）

### Mock 数据 (Mocks)

- [ ] [T-02] 实现 `src/mocks/xxx.ts`，含 300-800ms 延迟（对应 AC-x）

### 服务层 (Services)

- [ ] [T-03] 实现 `src/services/xxx.ts`（对应 AC-x）

### UI 层 (UI)

- [ ] [T-04] 实现页面组件，处理 Loading/Error/Empty 三态（对应 AC-x）

## 门控 (Gate)

- 进入 Commit 前：`status` = `DONE`（无未勾选项，`check-tasks.js` 断言不变量 I2）
