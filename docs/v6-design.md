# Rudder Framework V6 · 需求生命周期与规则体系（最终设计）

> **⚠️ 本文已实现，现状请以 `.rudder/` 为准。**
> 本文是 V6 整改的**设计记录**，其内容已由变更 `v6-requirement-lifecycle` 落地。
> 文中出现的 `.rudder/lifecycle.md` / `.rudder/policies/` 路径是**设计时的旧路径**，
> 现已分别迁移到 `.rudder/workflow/{lifecycle,states,gates,transitions}.md` 与
> `.rudder/constitution.md` / `.rudder/import/`。规则现状一律以 `.rudder/README.md` 导航为准。
>
> **定位**：本文是 V6 整改的**最终定稿**，收敛自 `docs/v6-uparade.md` 的探索性整改计划。
> 与 `v6-uparade.md` 冲突时，以本文为准；旧文档保留作历史，不再更新。
> 逐文件的详细状态枚举现以 `.rudder/workflow/states.md` 为权威，本文只给出结构与决策。

## 一、核心原则

### 1.1 四层分离

| 层 | 回答 | 落点 |
| -- | -- | -- |
| Rules | 什么必须做 / 禁止做 | `.rudder/` |
| Workflow | 当前状态 / 下一步去哪 | `.rudder/workflow/` 状态机 |
| Skills | 某能力怎么做 | `skills/` 权威源 |
| Agent | 谁执行 | Claude Code / Hermes |

### 1.2 AI = 工具（人主导，AI 起草）

Import / 分析 / 拆分 / 规划全程，AI 是**起草工具**，人是**主导者**。AI 提供速度，人拥有正确性。

### 1.3 机器管结构，人管语义

* 机器管：字段齐全、格式正确、可追溯（`check-import` / `check-req` 等确定性脚本）。
* 人管：拆得对不对、意图对不对、边界对不对（人工批准点）。

## 二、两条入口

```
路径 A · 批量（文档驱动）
  文档 → Import → 分析+拆分 → map APPROVED ──► 产出 N 个 REQ（含 plan skeleton）
                                                    │
路径 B · 增量（人驱动）                             │
  需求描述 → 澄清 → 建 1 个 REQ，登记进 map ─────────┘
                                                    ▼
                                  REQ 生命周期（两路完全一致）
                                  Plan → Implement → Verify → Review → Commit
```

* 路径 A 的 map 由拆分一次生成；路径 B 的 map 由人一条条登记。
* IMP 管道（Import → 分析+拆分 → map 批准）只在路径 A 存在，路径 B 跳过拆分。

## 三、对象模型

| 对象 | 类型 | 生命周期 | 备注 |
| -- | -- | -- | -- |
| IMP 文档 | 终止式管道 | 导入 → 分析+拆分 → map 批准 → 归档 | 路径 A 专属 |
| REQ | 真状态机 | Plan → … → Commit（可回环） | 两路共用 |
| requirement-map | 数据载体 | 随 REQ 增删更新 | 依赖机制的载体 |

## 四、REQ 生命周期与状态机

```text
PLANNED → IMPLEMENTING → VERIFYING → VERIFIED → REVIEWING → REVIEWED → COMMITTED
              ▲              ▲                                  │
              │              │                                  │
              └── verify fail 回环 ─────────────────────────────┘
              └── review fail / 需求变更级联失效 ────────────────┘
```

阶段与产物：

| 阶段 | 产物 | 状态（权威见 lifecycle.md） |
| -- | -- | -- |
| Plan | plan.md | DRAFT → APPROVED |
| Tasks | tasks.md | DRAFT / READY / DONE |
| Implement | implement.md | PENDING → IN_PROGRESS → COMPLETED |
| Verify | verify.md | PASS / FAIL |
| Review | review.md | PENDING_HUMAN_REVIEW → APPROVED |
| Commit | commit.md | DONE |

> 变更 / 级联产生的附加状态（OUTDATED / INVALIDATED / STALE）见 §五与 `lifecycle.md`。

## 五、依赖与变更

### 5.1 依赖门禁：卡「契约」

REQ-003 的 Plan 门禁 = 「其依赖的每个 REQ 的 `plan.md` 均为 `APPROVED`」（而非 COMMITTED）。

> REQ 真正依赖的是依赖方「定下来要做什么」（plan 里的 types / mocks / services），不是它已提交。

### 5.2 变更跨边传播：懒级联 + 人裁决

```text
REQ-001 变更
  ↓ 机器：算依赖闭包，把直接 + 间接依赖者标 STALE（书务）
  ↓ 人：对每个 STALE 判断「契约是否真受影响」（语义）
       ├─ 没受影响 → 重新 verify 通过 → 摘掉 STALE
       └─ 真受影响 → 回 IMPLEMENTING，并把它的下游再标 STALE
```

* 一跳一跳走，每跳人裁决一次；深度问题自然解决（REQ-003 真受影响，才轮到 REQ-005 标 STALE）。
* 分工自洽：机器管结构（闭包可确定算出），人管语义（契约是否真受影响只能人判）。
* 依赖图越密 = 拆分越差（见 §1 独立性要求），依赖稀少 → 裁决次数少 → 多出的那一步不重。

### 5.3 人工批准点

* 路径 A：map `DRAFT ──[人工确认拆分]──► APPROVED`，杠杆最高的一道闸。
* 路径 B：第一个批准点就是 Plan `APPROVED`。

## 六、规则与技能分层

| 内容 | 放哪 | 谁读 |
| -- | -- | -- |
| 声明式（状态机 / 门禁 / 约束） | `.rudder/` | 各 runtime 运行时读 |
| 程序式（怎么做某技能） | `skills/` 权威源 | 生成进 `.claude/commands/` + `.hermes/skills/` |

```text
skills/rudder-<name>.md          ← 唯一手写源
    frontmatter: claude { description, argument-hint }
                 hermes { name, description, triggers }
    共享正文: Goal / Execution Steps / 交互约束
        ↓  sync-skills.js（确定性，--check 拦截漂移）
    ├─► .claude/commands/rudder-<name>.md
    └─► .hermes/skills/rudder-<name>/SKILL.md
```

* 保留两个 runtime（Claude Code + Hermes）。
* 两个 runtime 的 schema 不可约不同（`argument-hint` vs `triggers`），故只能「单一源 → 两个投影」。
* 权威源以 Hermes 丰富版为主体种子，补 Claude 专属字段（`argument-hint`）。

## 七、Gate 总览

| Gate | 前置条件 | 机器 / 人 |
| -- | -- | -- |
| Plan Gate | 依赖方 plan APPROVED；map（路径 A）APPROVED | 机器（结构） + 人（APPROVED） |
| Implement Gate | plan APPROVED | 机器 |
| Verify Gate | typecheck / lint / build 全 PASS | 机器 |
| Review Gate | verify PASS，无 Blocker | 人 |
| Commit Gate | verify PASS + review APPROVED | 机器 |

## 八、追溯链

* 路径 A（长链）：`文档 → 导入 → 分析 → REQ → AC → 实现 → 验证证据 → Review → Commit`
* 路径 B（短链）：`描述 → REQ → AC → 实现 → 验证证据 → Review → Commit`
