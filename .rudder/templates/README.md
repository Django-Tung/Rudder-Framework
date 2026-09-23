---
id: REQ-XXX
title: [中文需求名称]
status: PLANNED
source: 人工登记
deps: []
stale: false
stale_reason: ""
stale_since: ""
---

# [需求名称]（REQ-XXX）

> 本文件承载 REQ 级元数据。frontmatter 字段 schema 见 `.rudder/requirement/structure.md` §2。
> `status` 是**派生值**，由 6 个阶段产物的 `status` 推导得出（推导表见 `.rudder/workflow/states.md` §2），
> 由 `npm run check:req` 断言一致——**每次阶段动作后必须同步更新**。

## 1. 需求概要

| 项 | 内容 |
|---|---|
| 需求 ID | REQ-XXX |
| 名称 | [中文需求名称] |
| 来源 | [IMP-YYYYMMDD-NNN 或 `人工登记`] |
| 依赖 | [REQ-YYY，无则填「无」] |
| 当前阶段 | [Plan / Tasks / Implement / Verify / Review / Commit] |

## 2. 产物索引

| 文件 | 状态 | 说明 |
|---|---|---|
| [`plan.md`](plan.md) | `DRAFT` | 需求规划（PRD + 技术契约） |
| [`tasks.md`](tasks.md) | `DRAFT` | 任务清单 |
| [`implement.md`](implement.md) | `PENDING` | 代码实施记录 |
| [`verify.md`](verify.md) | `PENDING` | 机器验证证据 |
| [`review.md`](review.md) | `PENDING` | 代码审查记录 |
| [`commit.md`](commit.md) | `PENDING` | 提交与归档记录 |

## 3. STALE 裁决记录

> 被上游变更标记 `stale: true` 时，在此记录裁决过程。
> 规则见 `.rudder/analysis/dependency.md` §5——**只有人能裁决**，Agent 不得自行摘除。

| 日期 | 触发源 | 裁决结论 | 依据 |
|---|---|---|---|
| — | — | — | — |
