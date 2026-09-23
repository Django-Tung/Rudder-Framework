# 语义分析: [来源文档名称]（IMP-YYYYMMDD-NNN）

> 本产物的 9 个小节规格见 `.rudder/analysis/analysis.md`。
> 小节标题保留英文便于脚本与人工定位，正文用简体中文。
> ⚠️ **禁止**在分析阶段补全文档未写明的内容——推测写进 `Ambiguities` 并转成澄清问题，
> 不得直接写进 `Functional Requirements` 或 `Business Rules`。

## Business Goal

[这份文档要解决的业务问题、期望收益]

## Actors

| 角色 | 职责 |
|---|---|
| [角色名] | [职责] |

## Functional Requirements

> 文档中明确提出的功能诉求，逐条列出。每条尽量标注原文位置（小节标题/段落），
> 保持与 `imported.md` 的可追溯性。此节是「独立功能点」的候选池。

- [FR-1] [功能诉求]（原文：§x.x）
- [FR-2] [功能诉求]（原文：§x.x）

## Business Rules

> 跨功能的约束、校验规则、计算规则。此节是「全局规则」的候选池。
> 最终确认跨需求共享的条目，归入 `requirements/MASTER-PRD.md` 的「全局业务规则」。

- [BR-1] [规则]
- [BR-2] [规则]

## Non-functional Requirements

- [NFR-1] [性能 / 兼容性 / 可访问性等]

## Dependencies

| 功能 / 模块 | 依赖对象 | 说明 |
|---|---|---|
| [功能] | [功能 / 外部系统] | [说明] |

> 此节直接决定 `pending_maps` 中各 REQ 条目的 `dependencies` 字段。

## Constraints

- [技术 / 时间 / 合规 / 组织层面的限制]

## Ambiguities

> 文档中**说不清**的地方。每一条都应转化成下方「澄清问题清单」中的问题。

- [模糊点 1]
- [模糊点 2]

## Risks

- [已知风险 / 不确定项]

---

## ❓ 澄清问题清单

> ⚠️ **强制章节**：`scripts/check-import.js` 断言本章节存在且**条目数 ≥ 1**。
> 缺失或为空时，导入**视为未完成**，不得推进到 `analyzed` 状态。
> 条目为可回答的封闭式或开放式问题，用中文。至少 1 条是**下限而非目标**。

- [ ] 问题 1：[例如：忘记密码是跳转新页面还是弹窗？]
- [ ] 问题 2：[例如：这段描述属于全局规则还是某个独立功能点？]

---

## 🌳 需求树（供人工确认拆分）

> 供 `/rudder-import` 内部暂停时展示给人工确认。拆分结论同时写入
> `requirements/MASTER-PRD.md` 的 `pending_maps` 字段。

```text
[Epic]
├── REQ-XXX [功能点名称]        priority: [high|medium|low]   dependencies: []
└── REQ-YYY [功能点名称]        priority: [high|medium|low]   dependencies: [REQ-XXX]
```

**Completeness**：`High` | `Medium` | `Low` —— 为 `Medium` / `Low` 的功能点在 `/rudder-plan` 阶段必须先澄清。
