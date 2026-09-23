# `analysis.md` 产物规格

> 本文件定义 IMP 在 `analyzed` 状态时产出的 `analysis.md` 的结构。
> 拆分判定见 [`decomposition.md`](decomposition.md)，依赖与闭包见 [`dependency.md`](dependency.md)。

## 1. 定位

`analysis.md` 是 **AI 对归一化文档的语义分析产物**，人读。
它与 `pending_maps`（机器读）**同时产生**，共同构成 `analyzed` 状态的达成条件：

- `analysis.md` 回答「这份文档**说了什么**」；
- `pending_maps` 回答「据此**要开哪些 REQ**」。

> 二者是**步骤合并、产物两个**：分析 + 拆分在同一步骤完成，但没有 `DECOMPOSED` 状态。

## 2. 结构：9 个小节

`analysis.md` **必须**包含以下 9 个小节，顺序固定：

| # | 小节 | 内容 | 为什么需要 |
|---|---|---|---|
| 1 | `Business Goal` | 这份文档要解决的业务问题、期望收益 | 判定拆分优先级的前提 |
| 2 | `Actors` | 涉及的角色的角色与职责 | 后续 User Story 的「作为…」来源 |
| 3 | `Functional Requirements` | 文档中明确提出的功能诉求（逐条） | 拆分为独立功能点的候选池 |
| 4 | `Business Rules` | 跨功能的约束、校验规则、计算规则 | 判定「全局规则」的候选池 |
| 5 | `Non-functional Requirements` | 性能、兼容性、可访问性等非功能诉求 | 避免在 Plan 阶段才暴露 |
| 6 | `Dependencies` | 功能之间、与外部系统之间的依赖 | 直接决定 `pending_maps` 的 `dependencies` |
| 7 | `Constraints` | 技术、时间、合规、组织层面的限制 | 划清 Non-Goals 的依据 |
| 8 | `Ambiguities` | 文档中**说不清**的地方 | 澄清问题的来源 |
| 9 | `Risks` | 已知风险与不确定项 | 供 Plan 阶段评估 |

### 2.1 小节 4 与「全局业务规则」的关系

`Business Rules` 里识别出的**确实跨需求共享**的条目，最终要**归入**
`requirements/MASTER-PRD.md` 的「全局业务规则」章节——而不是留在 `analysis.md` 里。
`analysis.md` 是**中间产物**，不是最终载体。

### 2.2 小节 8 与「澄清问题清单」的关系

`Ambiguities` 是问题清单的**来源**，但 `analysis.md` **必须**另外含一个明确的
**「澄清问题清单」章节**，且**条目数 ≥ 1**：

- 该章节是 `scripts/check-import.js` 的断言对象；
- 章节缺失或条目数为 0 时，导入**视为未完成**，**不得**推进到 `analyzed`。

澄清问题的强制要求见 [`decomposition.md`](decomposition.md) §3。

## 3. 写作约束

- 正文用**简体中文**；小节标题保留英文（对齐本表，便于脚本与人工定位）。
- **禁止**在分析阶段补全文档未写明的内容。推测必须写进 `Ambiguities` 并转成澄清问题，
  不得直接写进 `Functional Requirements` 或 `Business Rules`。
- 每条功能诉求尽量标注**原文位置**（如小节标题或段落编号），保持与 `imported.md` 的可追溯性。
