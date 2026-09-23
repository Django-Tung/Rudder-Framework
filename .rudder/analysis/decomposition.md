# 拆分判定 — 全局规则 vs 独立功能点

> 本文件回答「**一段内容该归到 MASTER-PRD 还是该开一个 REQ**」。
> 产物结构见 [`analysis.md`](analysis.md)，拆分后的依赖问题见 [`dependency.md`](dependency.md)。

## 1. 两类归宿

| 类别 | 判定 | 归宿 |
|---|---|---|
| **全局规则 / 术语** | 跨需求共享，或定义了所有需求都要遵守的约束 | `requirements/MASTER-PRD.md` 的「全局业务规则 / 术语表」 |
| **独立功能点** | 可以被单独验收、单独交付的一段功能 | `pending_maps[i].requirements[]` 中的一个 REQ 条目 |

## 2. 判定准则

按以下顺序自问，**首个命中即定类**：

1. **它是否表达一个相对独立的用户目标或功能块？**
   - 是 → 先作为**候选独立功能点**，详细可验收边界交给 `/rudder-plan`。
   - 否，因为它只是"所有功能都要遵守的" → **候选全局规则**。
2. **去掉它，其它功能还成立吗？**
   - 其它功能不成立 → 标为**候选全局规则**（如"所有金额保留两位小数"）。
   - 其它功能不受影响 → 标为**候选独立功能点**。
3. **它描述的是"是什么"还是"怎么算"？**
   - "怎么算 / 怎么校验" 且跨功能 → **候选全局规则**。
   - "用户能做什么" → **候选独立功能点**。

### 2.1 边界示例

| 内容 | 判定 | 理由 |
|---|---|---|
| 「金额一律保留两位小数，四舍五入」 | 全局规则 | 跨功能共享的计算约束，无法单独验收 |
| 「用户可以导出报表为 Excel」 | 独立功能点 | 可单独验收，有独立 AC |
| 「所有列表页默认每页 20 条」 | 全局规则 | 跨功能的展示约定 |
| 「管理员可以重置用户密码」 | 独立功能点 | 可单独验收 |
| 「系统使用 RBAC 权限模型」 | 全局规则 | 架构级约束，横切所有功能 |

## 3. 澄清问题强制要求

**判定模糊时，Agent MUST 标记为待 Plan 确认并输出结构化问题，MUST NOT 擅自猜测补全。**

具体要求：

1. **记录不确定性**：可以先放入候选功能点或候选规则，但必须标记待 Plan 确认。
2. **输出结构化澄清问题**：每条为可回答的封闭式或开放式问题，用**中文**。
3. **等待人工回答**后再继续拆分。
4. `analysis.md` 的「待 Plan 确认」按需记录问题；详细澄清在 `/rudder-plan` 阶段完成。

## 4. 拆分产物写入 `pending_maps`

拆分结论写入 `requirements/MASTER-PRD.md` frontmatter 的 `pending_maps` 字段（**列表**）：

```yaml
pending_maps:
  - imp: IMP-20260922-001          # 对应 IMP-ID
    status: DRAFT                  # DRAFT | APPROVED
    created_at: 2026-09-22
    requirements:
      - id: REQ-001
        title: 用户登录
        priority: high
        dependencies: []
      - id: REQ-003
        title: 登录审计
        priority: medium
        dependencies: [REQ-001]
```

**`pending_maps` 是列表**，不是单个对象——多个 IMP 并存时各自持有独立的 `status`，
不会被后一次导入覆盖。

## 5. 批准与收尾

1. IMP 在 `analyzed` 状态**不得**自动产出 REQ 目录。
2. `/rudder-import` **内部暂停**，展示拆分结果（REQ 清单、标题、依赖关系）并请人工确认（中文）。
3. 人工确认后：该条目 `status` → `APPROVED`，为其中**每个** REQ 创建目录与 7 个产物文件，
   IMP 的 `metadata.yaml.status` → `approved`。
4. **立即从 `pending_maps` 移除该条目**——REQ 此后由 `AUTO-INDEX` 承接，
   **不得在两处同时登记**。

> 批准点是 `/rudder-import` 命令**内部的暂停**，**不是**一个独立的批准命令。
> 这与 `/rudder-plan` 等待"PRD 批准"的既有交互范式一致。

## 6. 路径 B 跳过拆分

路径 B（人驱动增量）**不经过** `pending_maps`：直接创建 REQ 目录，`deps` 由**人**填写，
`AUTO-INDEX` 的「来源」列记为 `人工登记`。因此路径 B 的第一个批准点是 `plan.md` 的 `APPROVED`。
