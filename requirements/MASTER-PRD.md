---
type: master-prd
title: 全局业务规则与需求索引
updated: 2026-09-22
generator: scripts/sync-master-prd.js
# ---------------------------------------------------------------------------
# pending_maps：待批准的拆分（**管道数据，不是阶段状态**）
#
# 由 /rudder-import 在 `analyzed` 状态写入，人工批准后**立即移除**该元素；
# 其下的 REQ 由下方 AUTO-INDEX 承接，**不得在两处同时登记**。
#
# 列表元素字段：
#   imp          — 对应的 IMP-ID（IMP-YYYYMMDD-NNN）
#   status       — DRAFT | APPROVED
#   created_at   — 创建日期（YYYY-MM-DD）
#   requirements — 待创建的 REQ 列表，每项含：
#                    id / title / priority / dependencies（可为空列表）
#
# 字段定义见 .rudder/analysis/decomposition.md §2。
# 多份 IMP 并存时各自持有独立 status，互不覆盖。
# ---------------------------------------------------------------------------
pending_maps: []
---

# 全局业务规则与需求索引（MASTER-PRD）

> 本文件是全局唯一真相源，汇总跨需求共享的业务规则、术语表与需求状态索引。
> **索引表由 `scripts/sync-master-prd.js` 确定性维护**，只改下方标记块内内容；标记块外由人工维护。
> 依 `.rudder/workflow/lifecycle.md` §0，本文件是**例外文档**：不设 `status` / `phase`，不属于任何阶段。
> 其 `pending_maps` 字段是**管道数据**（待批准的拆分）而非阶段状态，不违反该约束。

## 1. 全局业务规则 (Global Rules)

> 跨需求共享的规则放这里。子需求 `plan.md` 涉及全局规则变更时，以"增量声明"标注
> （如 `> 需同步更新 MASTER-PRD.md 的全局技术契约`），由归档脚本统一同步到本节，
> **禁止 AI 直接覆写本节现有内容**。

| 编号 | 规则 | 来源 |
|---|---|---|
| BR-1 | 所有金额字段单位为人民币元 | IMP-20260922-001「供应商管理模块需求说明」§一 |
| BR-2 | 所有时间字段统一使用 `YYYY-MM-DD` 格式 | IMP-20260922-001「供应商管理模块需求说明」§一 |

## 2. 术语表 (Glossary)

| 术语 | 定义 |
|------|------|
| （暂无） | |

## 3. 需求状态索引 (Requirement Index)

<!-- BEGIN:AUTO-INDEX -->
| 需求ID | 名称 | 状态 | Phase | 依赖 | 来源 | 路径 |
|------|------|------|------|------|------|------|
| REQ-001 | 供应商列表 | PLANNED | Plan | — | IMP-20260922-001 | REQ-001-supplier-list/ |
| REQ-002 | 列表异常与重试入口 | PLANNED | Plan | — | IMP-20260922-001 | REQ-002-list-error-retry/ |
<!-- END:AUTO-INDEX -->

> 本索引由 `node scripts/sync-master-prd.js` 生成与更新；校验一致性用 `node scripts/sync-master-prd.js --check`。
