# `implement.md` 产物规格（阶段 3. Implement）

> 本文件定义 `implement.md` 该长什么样。状态取值见 [`../workflow/states.md`](../workflow/states.md) §1.3。
> 模板（初值来源）见 [`../templates/implement.md`](../templates/implement.md)。

## 1. 定位

`implement.md` 是**代码实施的证据文件**——记录「按契约写了什么、改动了哪些文件、偏离了什么」。
它与 `tasks.md` 分工不同：`tasks.md` 是**进度清单**（勾选），`implement.md` 是**结果陈述**。

## 2. 结构

| 小节 | 内容 |
|---|---|
| `## 状态 (Status)` | 当前 `status` 值的人类可读副本 |
| `## 变更摘要 (Changes Summary)` | 按 Contract-First 顺序分四类，每类列出新增/修改的文件与说明 |
| `## 变更文件清单 (Files Changed)` | 表格：`文件路径` / `操作` / `说明` |
| `## 实施偏差 (Deviations)` | 若计划外的调整或发现 `plan.md` 设计问题，记录原因；无则写「无。」 |
| `## 遇到的问题与解决方案 (Issues & Resolutions)` | 表格：`问题` / `原因` / `解决方案` |
| `## 完成确认` | 复选框清单，见 §3 |

### 2.1 变更摘要的四类

固定按 **Contract-First 顺序**：

1. **类型定义 (Types)** — `src/types/`
2. **Mock 数据 (Mocks)** — `src/mocks/`，说明**延迟多少 ms**
3. **服务层 (Services)** — `src/services/`
4. **UI 组件 (Components)** — `src/components/` 或 `src/pages/`，说明处理了哪些状态

> 顺序不是排版偏好：它对应真实的实现顺序，`tasks.md` 的任务分类也按此排列。

## 3. 完成确认清单

```markdown
- [ ] 所有 Types 已定义
- [ ] 所有 Mocks 已创建（含网络延迟）
- [ ] 所有 Services 已实现
- [ ] 所有 UI 组件已完成（含 Loading/Error/Empty 状态）
- [ ] 所有界面文案为简体中文
```

这五项是**硬约束**（来源：[`../constitution.md`](../constitution.md) §2 / §3），
不是建议——Review 阶段的「架构合规」与「界面质量」会逐项核对。

## 4. 状态门禁

| 转变 | 条件 |
|---|---|
| `PENDING` → `IN_PROGRESS` | 门禁：`plan.md` = `APPROVED` ∧ `tasks.md` = `READY` |
| `IN_PROGRESS` → `COMPLETED` | `tasks.md` 全部勾选且 `tasks.md` = `DONE` |
| `COMPLETED` → `OUTDATED` | 仅由需求变更触发（[`../workflow/transitions.md`](../workflow/transitions.md) §4） |

**置为 `COMPLETED` 的同时必须**：更新 `README.md` 顶层 `status` 为 `VERIFYING`，并运行
`npm run check:req`（退出码必须为 0）。

## 5. 内容约束

- 正文与说明用**简体中文**。
- `OUTDATED` 时**清空核心实现摘要**——失效态的语义是"旧证据作废"，留着旧摘要会造成误读。
