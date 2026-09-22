# REQ 目录结构

> 本文件回答「**一个 REQ 目录里有哪些文件、`README.md` 的 frontmatter 各字段是什么类型**」。
> `status` 的**取值与推导**在 [`../workflow/states.md`](../workflow/states.md) 定义，本文件**只引用不复述**。

## 1. 目录结构：7 个文件

每个需求**必须**拥有独立目录 `requirements/REQ-XXX-<kebab-name>/`，内含 **7 个**产物文件：

```text
requirements/REQ-XXX-<kebab-name>/
├── README.md        ← REQ 级元数据：顶层状态与依赖（本文件 §2）
├── plan.md          ← 阶段 1. Plan
├── tasks.md         ← 阶段 2. Tasks
├── implement.md     ← 阶段 3. Implement
├── verify.md        ← 阶段 4. Verify
├── review.md        ← 阶段 5. Review
└── commit.md        ← 阶段 6. Commit
```

- `<kebab-name>` 用小写英文与连字符（如 `user-login`）。
- 6 个阶段产物的规格见 [`../workflow/lifecycle.md`](../workflow/lifecycle.md) §1；
  各自的 `status` 取值见 [`../workflow/states.md`](../workflow/states.md) §1。
- 旧版本的 6 文件结构（无 `README.md`）**已废弃**。

## 2. `README.md` frontmatter 字段 schema

```yaml
---
id: REQ-003
title: 用户登录
status: IMPLEMENTING
source: 人工登记
deps: [REQ-001]
stale: false
stale_reason: ""
stale_since: ""
---
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✅ | REQ 编号，形如 `REQ-003` |
| `title` | string | ✅ | 中文需求名，`AUTO-INDEX` 的「名称」列来源 |
| `status` | enum | ✅ | **顶层状态**，取值见 [`../workflow/states.md`](../workflow/states.md) §2 |
| `source` | string | ✅ | `AUTO-INDEX` 的「来源」列来源：`IMP-YYYYMMDD-NNN`（路径 A）或字面量 `人工登记`（路径 B） |
| `deps` | string[] | ✅ | 跨 REQ 的契约依赖，无依赖时写 `[]` |
| `stale` | boolean | ✅ | 是否被上游变更标记为待裁决 |
| `stale_reason` | string | 条件 | `stale: true` 时**必须**存在：触发它的**上游 REQ-ID** |
| `stale_since` | string | 条件 | `stale: true` 时**必须**存在：标记日期 `YYYY-MM-DD` |

### 2.1 `status` 是派生值

`status` **由 6 个阶段产物的 `status` 推导得出**，`README.md` 中存储的只是它的**持久化副本**。

- 推导表：见 [`../workflow/states.md`](../workflow/states.md) §2（**唯一定义处**）。
- 一致性由 `npm run check:req` 断言，不符时报出期望值与实际值。

### 2.2 `stale` 的语义

`stale` 是**跨 REQ** 的正交标记，**不进入** `status` 枚举。它与
`OUTDATED` / `INVALIDATED`（同一 REQ 内的失效态）是**两套机制**，
区别见 [`../analysis/dependency.md`](../analysis/dependency.md) §3。

### 2.3 初值

新建 REQ 时：`status: PLANNED`、`deps` 由**人工确认**（路径 B）或取自 `pending_maps`（路径 A）、
`stale: false`。`plan.md` 的初值为 `DRAFT`。重置默认值表见
[`../workflow/states.md`](../workflow/states.md) §3。

## 3. `deps` 的填写要求

- **如实记录**跨 REQ 的契约依赖，**禁止**为省去登记而遗漏已知依赖。
- 依赖的**语义**是「我需要它 `plan.md` 中定下的 types / mocks / services 契约」，
  不是「我 import 了它的文件」。
- 填写影响两处：Plan 阶段的依赖门禁（[`../workflow/gates.md`](../workflow/gates.md) §3）
  与变更传播的闭包计算（[`../analysis/dependency.md`](../analysis/dependency.md) §4）。
- 依赖图越密 = 拆分质量越差，应尽量让每个 REQ 自洽。

## 4. 与 `MASTER-PRD.md` 的关系

- `MASTER-PRD.md` 的 `AUTO-INDEX` 索引块中，`状态` / `依赖` / `来源` 三项**从各 REQ 的 `README.md` 读取**，
  由 `scripts/sync-master-prd.js` 生成，**不引入第二处真相源**。
- 「来源」列取值是 `IMP-YYYYMMDD-NNN`（路径 A）或字面量 `人工登记`（路径 B）。
- **`MASTER-PRD.md` 是例外文档**：不设 `status` / `phase`（见 [`../workflow/lifecycle.md`](../workflow/lifecycle.md) §0）。
  其 `pending_maps` 字段是**管道数据**而非阶段状态，不违反该约束；
  它承载的是「已拆分、待批准」的 REQ 条目，批准后条目被移除、REQ 由 `AUTO-INDEX` 承接。

## 5. 归档后的结构

归档时整个目录被 `git mv` 到 `requirements/archive/<YYYY-MM>-REQ-XXX-<kebab-name>/`，
**内部结构不变**，仍是 7 个文件。归档即封存，**不得就地修改**
（见 [`../workflow/transitions.md`](../workflow/transitions.md) §6）。
