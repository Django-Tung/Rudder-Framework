---
type: master-prd
title: 全局业务规则与需求索引
updated: 2026-09-21
generator: scripts/sync-master-prd.js
---

# 全局业务规则与需求索引（MASTER-PRD）

> 本文件是全局唯一真相源，汇总跨需求共享的业务规则、术语表与需求状态索引。
> **索引表由 `scripts/sync-master-prd.js` 确定性维护**，只改下方标记块内内容；标记块外由人工维护。
> 依 `.rudder/lifecycle.md` §2，本文件是**例外文档**：不设 `status` / `phase`，不属于任何阶段。

## 1. 全局业务规则 (Global Rules)

> 跨需求共享的规则放这里。子需求 `plan.md` 涉及全局规则变更时，以"增量声明"标注
> （如 `> 需同步更新 MASTER-PRD.md 的全局技术契约`），由归档脚本统一同步到本节，
> **禁止 AI 直接覆写本节现有内容**。

（暂无）

## 2. 术语表 (Glossary)

| 术语 | 定义 |
|------|------|
| （暂无） | |

## 3. 需求状态索引 (Requirement Index)

<!-- BEGIN:AUTO-INDEX -->
| 需求ID | 名称 | 状态 | Phase | 路径 |
|--------|------|------|-------|------|
<!-- END:AUTO-INDEX -->

> 本索引由 `node scripts/sync-master-prd.js` 生成与更新；校验一致性用 `node scripts/sync-master-prd.js --check`。
