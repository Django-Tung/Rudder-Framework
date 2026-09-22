# `verify.md` 产物规格（阶段 4. Verify）

> 本文件定义 `verify.md` 该长什么样。状态取值见 [`../workflow/states.md`](../workflow/states.md) §1.4。
> 模板（初值来源）见 [`../templates/verify.md`](../templates/verify.md)。

## 1. 定位

`verify.md` 是**不可伪造的机器证据**。核心原则：**证据优于承诺**——
Agent 不得口头声称"代码没问题"，必须留下命令与**逐字**终端输出。

## 2. 结构

| 小节 | 内容 |
|---|---|
| `## 状态 (Status)` | 当前 `status` 值的人类可读副本 |
| `## 机器验证 (Machine Verification)` | 每条命令一节，含 `命令` / `结果` / `输出`（代码块粘贴**完整**终端输出） |
| `## 架构检查 (Architecture Checks)` | 复选框清单，见 §4 |
| `## 范围检查 (Scope Check)` | 复选框清单，见 §4 |
| `## 修复记录 (Fix Log)` | 表格：`轮次` / `失败项` / `错误信息摘要` / `修复措施` / `修复后结果` |
| `## 最终结论 (Final Result)` | 逐项列出各检查的最终结论与综合结果 |

## 3. 机器验证的命令族

**必须**按序执行并逐条记录：

| 命令 | 断言 |
|---|---|
| `npm run typecheck` | 类型无误 |
| `npm run lint` | 无 `any` / `console.log` / `debugger` 等 |
| `npm run build` | 生产构建通过 |
| `npm run check:skills` | 技能投影与权威源无漂移（与前三项**同级**） |
| `npm run check:req` | tasks 勾选一致性、顶层状态推导、依赖闭包与 `STALE` 一致性 |

> `check:skills` 与 `check:req` 不是"附加项"：任一的非零退出**必须**导致 `verify.md` **不进入 `PASS`**。

## 4. 检查清单

**架构检查**：
- [ ] UI 组件未直接 import `src/mocks/`
- [ ] Service 层包含网络延迟模拟（300-800ms）
- [ ] 无 `any` 类型使用
- [ ] 无遗留的 `console.log` 调试语句

**范围检查**：
- [ ] 未修改与本需求无关的文件
- [ ] 未引入技术栈之外的依赖

## 5. 自动修复闭环

1. 任一命令失败 → **必须**读取终端报错、自动修复代码、重跑。
2. **最多 3 轮**。每一轮都记入 `## 修复记录` 表格。
3. 3 轮内通过 → 记录**完整**终端输出，`status` = `PASS`，并同步 `README.md` 顶层 `status` 为 `VERIFIED`。
4. 3 轮后仍失败 → **立即停止**，`status` = `FAIL`，向人工报告，**NEVER proceed to Review**。

> `FAIL` 是**阻断态**（[`../workflow/gates.md`](../workflow/gates.md) §2）。
> 从 `FAIL` 恢复需人工介入；修复后重新执行 Verify，`status` 回到 `PENDING` 起算。

## 6. 输出约束

- 终端输出**必须逐字粘贴**——不得摘要、不得只贴最后一行、不得凭记忆重写。
- 失败时的错误报告与分析说明用**简体中文**。
- `INVALIDATED` 时**清空验证日志**（见 [`../workflow/transitions.md`](../workflow/transitions.md) §4）。
