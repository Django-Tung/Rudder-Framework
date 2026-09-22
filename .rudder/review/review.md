# `review.md` 产物规格（阶段 5. Review）

> 本文件定义 `review.md` 该长什么样。状态取值见 [`../workflow/states.md`](../workflow/states.md) §1.5。
> 模板（初值来源）见 [`../templates/review.md`](../templates/review.md)。

## 1. 定位

`review.md` 是**自检 + 人工审批**的记录。分两段：

1. **Agent 自检**：对照 `plan.md` 逐项核对，填写清单 → `status` = `PENDING_HUMAN_REVIEW`。
2. **人工审批**：**只有人工**可以把 `PENDING_HUMAN_REVIEW` 转为 `APPROVED`，
   Agent **不得**自行批准。

## 2. 结构

| 小节 | 内容 |
|---|---|
| `## 状态 (Status)` | 当前 `status` 值的人类可读副本 |
| `## 需求符合度 (Requirement Compliance)` | 表格：`AC 编号` / `场景描述` / `是否实现` / `备注` |
| `## 架构合规 (Architecture)` | 复选框清单 |
| `## 范围合规 (Scope)` | 复选框清单 |
| `## 代码质量 (Code Quality)` | 复选框清单 |
| `## 界面质量 (UI/UX)` | 复选框清单 |
| `## 发现的问题 (Findings)` | 不符合预期之处；无则写「无。」 |
| `## 人工审批 (Human Review)` | `状态` / `审批人` / `审批意见` / `审批日期` |

### 2.1 需求符合度表格

**逐条对照 `plan.md` 的 AC**，一行一条，AC 编号**必须**与 `plan.md` 一致
（编号规范见 [`../requirement/acceptance.md`](../requirement/acceptance.md)）。
这是 Review 阶段人工核对的**唯一基准**。

### 2.2 四类清单

**架构合规**：
- [ ] 依赖方向正确：UI → `src/services/` → `src/mocks/`
- [ ] 类型定义完整，无 `any`
- [ ] 状态管理合理（Zustand / Context）

**范围合规**：
- [ ] 仅实现了 In Scope 的功能
- [ ] 未触碰 Non-goals 中的内容
- [ ] 未修改其他 REQ 的代码

**代码质量**：
- [ ] 无未使用的 import
- [ ] 无调试用 `console.log`
- [ ] 无注释掉的死代码
- [ ] 组件拆分合理，单文件未过度膨胀

**界面质量**：
- [ ] 所有用户可见文案为简体中文
- [ ] Loading 状态已处理（骨架屏/Spinner）
- [ ] Error 状态已处理（错误提示 + 重试）
- [ ] Empty 状态已处理（空状态提示）
- [ ] 交互元素有 hover/active 反馈
- [ ] 响应式布局（Mobile + Desktop）

**Page Structure 合规**（最重要的单项）：对照 `plan.md` 的
「📐 页面结构与组件骨架」，核对实际代码的组件树与布局是否**完全一致**，无未授权的增删。

## 3. 门禁与流转

| 转变 | 条件 / 触发 |
|---|---|
| `PENDING` → `PENDING_HUMAN_REVIEW` | 门禁：`verify.md` = `PASS`；自检清单填写完毕 |
| `PENDING_HUMAN_REVIEW` → `APPROVED` | **仅人工**，回复"Review 通过，状态改为 APPROVED" |
| `PENDING_HUMAN_REVIEW` → `CHANGES_REQUESTED` | 人工回复"要求修改：[具体问题]" |
| `INVALIDATED` | 仅由需求变更触发 |

**打回的级联重置**（[`../workflow/transitions.md`](../workflow/transitions.md) §3）：
`implement.md` → `IN_PROGRESS`、`verify.md` → `PENDING`、`tasks.md` → `DRAFT`、
`README.md` 顶层 `status` → `IMPLEMENTING`。返工完成后 `review.md` 重置为 `PENDING`，
**重新执行** Verify → Review 全流程。

**批准时**：同步 `README.md` 顶层 `status` 为 `REVIEWED`。

## 4. 内容约束

- `review.md` 的自检意见与清单细节**必须**用**简体中文**书写。
- 请求人工 Review 的提示**必须**用中文：
  > "代码自检已完成，请进行人工 Review。确认无误后，请回复：**Review 通过，状态改为 APPROVED**。如需修改，请指出具体问题。"
- `INVALIDATED` 时**清空审查记录**。
