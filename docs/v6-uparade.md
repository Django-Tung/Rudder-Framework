---

# Rudder-OS 工程体系整改计划

**版本：V6.0**
**目标版本：Rudder-OS V6**
**整改类型：架构 / 流程 / Skills / Agent / 工程规范**
**核心范围：`.rudder`、`skills`、Requirement Workflow、Claude Code**

---

# 一、整改背景

Rudder-OS 当前已经具备以下基础能力：

* `.rudder` 项目规则
* Skills 技能体系
* Claude Code / Agent 执行能力
* `Plan → Implement → Verify → Review → Commit` 生命周期
* Requirement 文件化管理

当前体系的主要问题不是缺少流程，而是：

> **流程已经存在，但“需求进入系统之前”和“流程各阶段之间的边界、状态、门禁、证据”还不够明确。**

尤其是实际使用时，用户可能不是直接输入一个已经拆好的需求，而是：

```text
上传一个 PRD
上传一个 Word
上传一个 PDF
上传一份 Excel
上传一份会议纪要
甚至直接粘贴一大段需求
```

因此当前：

```text
Plan
↓
Implement
↓
Verify
↓
Review
↓
Commit
```

实际上缺少：

```text
Import
↓
Analyze
↓
Decompose
```

导致“大需求如何变成可执行 Requirement”没有正式的工程位置。

---

# 二、整改总体目标

本次整改完成后，Rudder-OS 应形成以下完整生命周期：

```text
┌─────────────────────────────┐
│          User Input         │
│                             │
│ PRD / Word / PDF / MD / ... │
└──────────────┬──────────────┘
               ↓
        ┌─────────────┐
        │   Import    │
        └──────┬──────┘
               ↓
        ┌─────────────┐
        │   Analyze   │
        └──────┬──────┘
               ↓
        ┌─────────────┐
        │  Decompose  │
        └──────┬──────┘
               ↓
      ┌──────────────────┐
      │ Requirement Map  │
      └────────┬─────────┘
               │
       ┌───────┼────────┐
       ↓       ↓        ↓
    REQ-001 REQ-002  REQ-003
       │       │        │
       ↓       ↓        ↓
      Plan    Plan     Plan
       ↓       ↓        ↓
   Implement Implement Implement
       ↓       ↓        ↓
    Verify   Verify   Verify
       ↓       ↓        ↓
    Review   Review   Review
       ↓       ↓        ↓
    Commit   Commit   Commit
```

最终实现：

> **一份大型需求，可以自动导入、分析、拆分为多个 Requirement，每个 Requirement 独立完成完整研发生命周期。**

---

# 三、核心架构原则

## 3.1 Rules、Workflow、Skills、Agent 四层分离

最终明确四个概念。

### Rules

回答：

> 什么必须做？什么禁止做？

例如：

```text
未完成 Plan 不允许 Implement。

Verify 未通过不允许 Review。

Review 未通过不允许 Commit。
```

---

### Workflow

回答：

> 当前处于什么状态？下一步可以去哪里？

例如：

```text
Imported
    ↓
Analyzed
    ↓
Planned
    ↓
Implementing
    ↓
Verifying
    ↓
Reviewed
    ↓
Committed
```

---

### Skills

回答：

> 如何完成某一项能力？

例如：

```text
PDF Import Skill
Requirement Decomposition Skill
Planning Skill
Testing Skill
Code Review Skill
Commit Skill
```

---

### Agent

回答：

> 谁负责执行？

例如：

```text
Claude Code
Codex
其他 Agent
```

因此：

```text
.rudder
   │
   ├── Rules
   ├── Workflow
   └── Gates
          ↓
       Skills
          ↓
        Agent
          ↓
       Project
```

---

# 四、整改范围

本次整改包含 8 个核心领域。

| 编号 | 整改领域        | 目标                     |
| -- | ----------- | ---------------------- |
| 01 | Import      | 建立统一需求入口               |
| 02 | Analyze     | 建立需求理解机制               |
| 03 | Decompose   | 建立需求拆分机制               |
| 04 | Workflow    | 建立严格状态机                |
| 05 | Requirement | 建立独立需求生命周期             |
| 06 | Skills      | 重新定义技能边界               |
| 07 | Agent       | 统一 Claude Code 等 Agent |
| 08 | Gate        | 建立流程阻断机制               |

---

# 五、Phase 01：建立 Import 层

## 5.1 目标

解决：

> 用户上传的原始需求如何进入 Rudder-OS？

Import 不负责理解需求，也不负责制定技术方案。

它只负责：

```text
读取
↓
解析
↓
标准化
↓
保存原始信息
```

---

## 5.2 支持输入

第一阶段建议支持：

```text
Markdown
TXT
PDF
DOCX
XLSX
纯文本
```

后续可以扩展：

```text
图片
截图
会议纪要
API
URL
```

---

## 5.3 Import 输出

统一形成：

```text
Imported Requirement
```

例如：

```text
requirements/
└── IMP-20260922-001/
    ├── source/
    │   └── requirement.docx
    │
    ├── imported.md
    └── metadata.yaml
```

---

## 5.4 metadata

建议至少记录：

```yaml
id: IMP-20260922-001

source:
  type: docx
  filename: requirement.docx

created_at: 2026-09-22

status: imported

content:
  format: markdown
  path: imported.md
```

---

## 5.5 Import Gate

Import 完成必须满足：

```text
[ ] 原始文件存在
[ ] 文件可以解析
[ ] 内容成功提取
[ ] 编码正确
[ ] 原始来源可追踪
[ ] imported.md 已生成
[ ] metadata 已生成
```

---

# 六、Phase 02：建立 Analyze 层

Import 之后不能直接进入 Plan。

必须先：

```text
Analyze
```

## 6.1 目标

回答：

> 这份需求到底在说什么？

Analyze 负责：

* 理解业务背景
* 识别目标
* 识别角色
* 识别功能
* 识别约束
* 识别业务规则
* 识别非功能需求
* 识别依赖
* 识别冲突和歧义

---

## 6.2 Analyze 输出

例如：

```text
analysis.md
```

结构：

```markdown
# Requirement Analysis

## Business Goal

## Actors

## Functional Requirements

## Business Rules

## Non-functional Requirements

## Dependencies

## Constraints

## Ambiguities

## Risks
```

---

# 七、Phase 03：建立 Decompose 需求拆分

这是本次整改的核心之一。

## 7.1 目标

把：

```text
一份大型需求
```

转换为：

```text
多个可执行 Requirement
```

---

## 7.2 拆分原则

一个 Requirement 应满足：

### 独立性

可以单独实现。

### 可验证

可以明确判断是否完成。

### 有边界

输入、输出、行为明确。

### 可追踪

能够追溯到原始需求。

### 可交付

完成后能够产生明确的软件价值。

---

## 7.3 禁止过度拆分

不要拆成：

```text
登录按钮
登录输入框
登录接口
登录 Loading
```

这些应该属于：

```text
REQ-001 用户登录
```

---

## 7.4 Requirement Map

Analyze + Decompose 最终生成：

```text
requirement-map.yaml
```

例如：

```yaml
source: IMP-20260922-001

requirements:

  - id: REQ-001
    title: 用户登录
    priority: high
    dependencies: []

  - id: REQ-002
    title: 用户注册
    priority: high
    dependencies: []

  - id: REQ-003
    title: 商品搜索
    priority: medium
    dependencies:
      - REQ-001
```

---

# 八、Phase 04：Requirement 生命周期

每一个 Requirement 独立进入：

```text
Plan
↓
Implement
↓
Verify
↓
Review
↓
Commit
```

目录建议：

```text
requirements/
└── REQ-001-user-login/
    ├── README.md
    ├── plan.md
    ├── implement.md
    ├── verify.md
    ├── review.md
    └── commit.md
```

---

# 九、Phase 05：Plan 整改

Plan 不只是“写方案”。

必须包含：

```text
需求理解
↓
影响范围
↓
技术方案
↓
修改文件
↓
实现步骤
↓
Acceptance Criteria
↓
风险
```

建议：

```markdown
# Plan

## Requirement

## Background

## Scope

## Impact Analysis

## Technical Design

## Implementation Steps

## Acceptance Criteria

### AC-001

### AC-002

### AC-003

## Risks

## Out of Scope
```

---

# 十、Phase 06：Acceptance Criteria

这是 Verify 的依据。

例如：

```markdown
## Acceptance Criteria

### AC-001

用户输入正确账号密码可以登录。

### AC-002

账号不存在时显示错误提示。

### AC-003

密码错误时显示错误提示。
```

每一个 AC 必须最终有：

```text
PASS / FAIL
```

和：

```text
Evidence
```

---

# 十一、Phase 07：Implement 整改

Implement 的原则：

> **按照 Plan 实现，而不是边写代码边重新定义需求。**

Implement 必须记录：

```markdown
# Implement

## Changed Files

## Implementation Details

## Deviations

## Technical Decisions

## Known Issues
```

如果实际实现与 Plan 不一致：

```text
必须记录 Deviation
```

不能悄悄改变。

---

# 十二、Phase 08：Verify 整改

Verify 必须回答：

> 这个 Requirement 是否真正完成？

而不是简单：

```text
npm test
```

建议：

```markdown
# Verify

## Automated Checks

- [ ] TypeScript
- [ ] Lint
- [ ] Unit Test
- [ ] Build

## Acceptance Criteria

| ID | Result | Evidence |
|---|---|---|
| AC-001 | PASS | xxx |
| AC-002 | PASS | xxx |
| AC-003 | PASS | xxx |

## Regression

## Issues

## Final Result
```

最终：

```text
Verified
```

必须要求：

```text
所有 Critical AC = PASS
```

---

# 十三、Phase 09：Review 整改

Review 和 Verify 严格分离。

## Verify

关注：

> **有没有实现正确？**

## Review

关注：

> **实现质量是否满足项目工程要求？**

Review 检查：

```text
Architecture
Maintainability
Readability
Security
Performance
Duplication
Technical Debt
Project Rules
```

建议：

```markdown
# Review

## Architecture

## Code Quality

## Security

## Performance

## Maintainability

## Project Rule Compliance

## Findings

### Blocker

### Major

### Minor

## Result
```

---

# 十四、Phase 10：Commit 整改

Commit 不是简单：

```bash
git commit
```

而是生命周期最后一步。

Commit 前必须：

```text
Verify PASS
       +
Review PASS
       ↓
Commit
```

Commit 文档：

```markdown
# Commit

## Requirement

## Verification

## Review

## Changed Files

## Commit Message

## Commit Hash
```

---

# 十五、Workflow 状态机

最终建议正式定义状态。

```text
IMPORTED
   ↓
ANALYZED
   ↓
DECOMPOSED
   ↓
PLANNED
   ↓
IMPLEMENTING
   ↓
VERIFYING
   ↓
VERIFIED
   ↓
REVIEWING
   ↓
REVIEWED
   ↓
COMMITTED
```

失败状态：

```text
VERIFY_FAILED
     ↓
IMPLEMENTING
```

以及：

```text
REVIEW_FAILED
     ↓
IMPLEMENTING
```

需求分析发现问题：

```text
ANALYSIS_FAILED
     ↓
ANALYZING
```

---

# 十五·补：二段式入口——AI 工具定位与「分析+拆分」合一（决策）

> 本节是对 §五 / §六 / §七 与 §十五 的修订，记录已定决策。

## 决策一：AI = 工具（人主导，AI 起草）

Import / Analyze / Decompose 全程，AI 是**起草工具**，人是**主导者**。AI 负责快速产出草稿（转换、分类、预建 skeleton、初稿分析、初稿拆分），人负责审阅、修正、拍板。

> 这不是新东西，是 `rudder-import` 现有模式的成文化：AI 转换 + 分类 + 提澄清问题（起草），人回答 / 主导。

## 决策二：机器管「结构」，人管「语义」

| 谁 | 管什么 | 手段 |
| -- | -- | -- |
| 机器 | 字段齐全、格式正确、每个 REQ 可追溯到原文 | `check-import` / `check-tasks` 等确定性脚本 |
| 人 | 拆得对不对、意图理解对不对、边界划得对不对 | 人工批准点 |

## 决策三：三阶段收成二阶段

```text
原（§十五）:  IMPORTED → ANALYZED → DECOMPOSED → PLANNED → …
修订:         IMPORTED → ANALYZED（分析+拆分合一） → PLANNED → …
```

理由：AI 是工具、人主导时，「理解需求」与「拆分需求」是人的同一个动作，硬切成两个门控状态只加摩擦、不加控制。

* `analysis.md`（语义理解，人读）与 `requirement-map.yaml`（拆分结构，机器读）**仍是两个产物**——不同消费者、不同格式。
* 合并的是**流程状态**，不是**产物**。

## 决策四：IMP 是管道，REQ 是状态机，变更是一类触发

§十五 把两个对象压成一条平链，需拆开：

```text
对象 A：IMP 文档（导入的原始需求）
  导入 → 分析+拆分 → map APPROVED ──► 终止，归档
                                   │
                                   ▼ 产出一张 map，列出 N 个 REQ

对象 B：REQ（每个独立需求）
  PLANNED → IMPLEMENTING → VERIFYING → VERIFIED → REVIEWING → REVIEWED → COMMITTED
     ↑_______________ fail 回环 _______________|
     ↑_______________ 需求变更级联失效 _____________|
```

* IMP 级是**终止式管道**（跑一次即归档，无回环 / 重入 / 长命状态），不需要状态机。
* REQ 级才是**真状态机**（长命、可回环：verify fail / review fail / 需求变更都回 IMPLEMENTING）。
* 变更控制（`rudder-change`）不是第三台状态机，是 REQ 状态机里的一类**触发**。

## 决策五：依赖卡「契约」，变更走「懒级联 + 人裁决」

### 依赖门禁

REQ-003 的 Plan 门禁 = 「其依赖的每个 REQ 的 `plan.md` 均为 `APPROVED`」（而非 COMMITTED）。

> REQ 真正依赖的是依赖方「定下来要做什么」（plan 里的 types / mocks / services），不是它已提交。

### 变更跨边传播

```text
REQ-001 变更
  ↓ 机器：算依赖闭包，把直接 + 间接依赖者标 STALE（书务）
  ↓ 人：对每个 STALE 判断「契约是否真受影响」（语义）
       ├─ 没受影响 → 重新 verify 通过 → 摘掉 STALE
       └─ 真受影响 → 回 IMPLEMENTING，并把它的下游再标 STALE
```

* 一跳一跳走，每跳人裁决一次，深度问题自然解决（REQ-003 真受影响，才轮到 REQ-005 标 STALE）。
* 分工自洽：机器管结构（闭包可确定算出），人管语义（契约是否真受影响只能人判）。
* 依赖图越密 = 拆分越差（见 §7.2 独立性），依赖稀少 → 裁决次数少 → 多出的那一步不重。

## 决策六：两条入口，map 是依赖载体

入口有两条，汇入同一条 REQ 生命周期：

```text
路径 A · 批量（文档驱动）
  文档 → Import → 分析+拆分 → map APPROVED ──► 产出 N 个 REQ（含 plan skeleton）

路径 B · 增量（人驱动）
  需求描述 → 澄清 → 建 1 个 REQ，登记进 map ──► 同一条 REQ 生命周期
```

* REQ 生命周期（Plan → Commit）是唯一的、两路共用的状态机。
* IMP 管道（Import → 分析+拆分 → map 批准）只在路径 A 存在；路径 B 跳过拆分。
* **map 是依赖机制的载体**，不是路径 A 专属：没有 map，路径 B 的 REQ 就没有依赖关系、无法参与变更跨边传播（决策五）。
* 路径 A 的 map 由拆分一次生成；路径 B 的 map 由人一条条登记（选 B2）。
* plan skeleton：路径 A 由拆分预建、Plan 细化；路径 B 由 Plan 从零写。
* 追溯链分长短：路径 A `文档→导入→分析→REQ`；路径 B `描述→REQ`。
* 批准点：路径 A 的 map 需人工确认拆分（`DRAFT → APPROVED`）；路径 B 的第一个批准点就是 Plan `APPROVED`。

## 人工批准点

`requirement-map.yaml` 增加状态：`DRAFT ──[人工确认拆分]──► APPROVED`，与 `plan.md` 的 `APPROVED` 对等。

> 这是整条链上杠杆最高的一道闸：拆分错了，下游每个 REQ 全错。

---

# 十六、Gate 设计

这是最终实现“流程不是建议，而是约束”的关键。

## Import Gate

```text
Imported
```

必须有：

```text
source
imported.md
metadata
```

---

## Analyze Gate

必须有：

```text
analysis.md
```

---

## Decompose Gate

必须有：

```text
requirement-map.yaml
```

并且每个 Requirement：

```text
ID
Title
Description
Dependencies
```

完整。

---

## Plan Gate

必须有：

```text
plan.md
Acceptance Criteria
```

---

## Implement Gate

必须满足：

```text
Plan exists
```

---

## Verify Gate

必须满足：

```text
Tests PASS
Build PASS
AC PASS
```

---

## Review Gate

必须满足：

```text
No Blocker
```

---

## Commit Gate

必须满足：

```text
Verify PASS
Review PASS
```

---

# 十七、`.rudder` 目录整改

最终建议：

```text
.rudder/
│
├── README.md
│
├── constitution.md
│
├── workflow/
│   ├── lifecycle.md
│   ├── states.md
│   ├── transitions.md
│   └── gates.md
│
├── import/
│   ├── sources.md
│   ├── parsing.md
│   └── normalization.md
│
├── analysis/
│   ├── analysis.md
│   ├── decomposition.md
│   └── dependency.md
│
├── requirement/
│   ├── structure.md
│   └── acceptance.md
│
├── implementation/
│   └── implementation.md
│
├── verification/
│   └── verification.md
│
├── review/
│   └── review.md
│
└── agents/
    └── claude-code.md
```

---

# 十八、Skills 整改

最终：

```text
skills/
│
├── import/
│   ├── document/
│   ├── pdf/
│   ├── docx/
│   ├── markdown/
│   └── spreadsheet/
│
├── analysis/
│   ├── requirement-analysis/
│   ├── requirement-decomposition/
│   └── dependency-analysis/
│
├── planning/
│
├── implementation/
│
├── testing/
│
├── verification/
│
├── review/
│
└── commit/
```

注意：

> Skills 是能力，不是 Workflow。

例如：

```text
requirement-decomposition
```

可以负责：

```text
分析需求
识别独立功能
拆分 Requirement
建立依赖关系
```

但它不能自己决定：

```text
下一步直接 Commit
```

生命周期由 `.rudder` 控制。

---

# 十九、Claude Code 整改

Claude Code 应该作为：

```text
Agent Runtime
```

而不是第二套规则系统。

结构：

```text
.rudder
   ↓
Workflow
   ↓
Skills
   ↓
Claude Code
   ↓
Project
```

Claude Code 可以：

```text
读取 .rudder
读取当前状态
调用对应 Skill
执行任务
产生 Evidence
更新 Requirement
```

但不能：

```text
绕过 Gate
跳过 Verify
自行改变生命周期
```

---

# 十九·补：Rules / Skills 双 runtime 唯一源与生成投影（关键决策）

> 本节对 §十七 / §十八 / §十九 做收敛，明确「规则放哪、技能放哪、谁生成谁」。
> 现状（截至 V6）两处 runtime 定义（`.claude/commands/` 与 `.hermes/skills/`）靠一句「⚠️ Dual Maintenance」约定等价，无任何机制强制——7 对 skill 已全部漂移。

## 决策结论

1. **保留两个 runtime**（Claude Code + Hermes），不砍。
2. **目录结构不动**。程序式技能内容留在各 runtime 原生位置（`.claude/commands/`、`.hermes/skills/`）。
3. **顶层 `skills/` = 唯一手写权威源**。§十八 提出的 `skills/` 树保留，但定位修正：它是「源」，不是 runtime 读取的位置。
4. **`sync-skills.js` 生成两个投影**。范式同 `scripts/sync-master-prd.js`：确定性、零依赖、幂等、`--check` 断言一致性，不一致 exit 1。

## 为什么「单一文件喂两个 runtime」不成立

两个 runtime 的原生 schema 不可约不同：

| 维度 | Claude Code | Hermes |
| ---- | ----------- | ------ |
| frontmatter | `description` + `argument-hint` | `name` + `description` + `triggers` |
| 标题 | `# Command:` | `# Skill:` |
| 参数提取 | 用 `argument-hint` 表达 | 多一节 `Parameter Extraction` |

因此只能是「单一源 → 两个投影」，而非「单一文件直接服务两者」。

## 权威源文件形态

```text
skills/rudder-<name>.md
    frontmatter: claude: { description, argument-hint }
                 hermes: { name, description, triggers }
    共享正文: Goal / Execution Steps / 交互约束
    （Parameter Extraction 为 Hermes 专属，可留脚本模板注入）
```

`sync-skills.js` 渲染：

```text
Claude 版 = description + argument-hint + "# Command:" + 共享正文
Hermes 版 = name + triggers + "# Skill:" + Parameter Extraction + 共享正文
```

## 现状漂移（diff 实测）

7 对 skill 全部存在漂移，方向单一：**Hermes 是更丰富/更新的版本，Claude 是旧版本**（行数 1.5–1.7 倍）。Hermes 独有而 Claude 缺失的实质内容包括：

```text
change    级联失效逐文件列全；Change Log 记「日期/内容/原因/影响范围」
commit    archive 路径 <YYYY-MM>-REQ-XXX-xxx/；backfill archived/archived_at/archive_path
implement Mocks 标注 300-800ms；UI 必须实现 Loading/Empty/Error
plan      Tech Contract & Data Model（Zustand Store、Mock Schema）
verify    FAIL 后「NEVER proceed to Review」
```

**结论：权威源应以 Hermes 版本为主体种子，再补 Claude 专属字段（`argument-hint`）。**

## 声明式 vs 程序式的最终分工

| 内容 | 放哪 | 谁读 |
| ---- | ---- | ---- |
| 声明式（状态机 / 门禁 / 约束） | `.rudder/` | 各 runtime 运行时读 |
| 程序式（怎么做某技能） | `skills/` 权威源 | 生成进 `.claude/commands/` + `.hermes/skills/` |

---

# 二十、Agent 工作模式

建议 Agent 每次开始工作时先执行：

```text
1. Load .rudder
2. Detect current state
3. Load current Requirement
4. Load corresponding Skill
5. Execute current stage
6. Produce output
7. Run Gate
8. Update state
```

例如当前：

```text
REQ-001
state = VERIFYING
```

Agent 就应该进入：

```text
Verification Skill
```

而不是重新问：

> “要不要先写 Plan？”

---

# 二十一、Evidence 体系

整改后每一个重要动作都应该留下证据。

例如：

```text
Plan
  ↓
plan.md

Implement
  ↓
git diff / implement.md

Verify
  ↓
test result / build result / AC result

Review
  ↓
review.md

Commit
  ↓
commit hash
```

形成：

```text
Requirement
    │
    ├── Plan
    ├── Implementation
    ├── Verification
    ├── Review
    └── Commit
             │
             ↓
          Evidence
```

这样以后才能真正做到：

> **“为什么这个需求可以 Commit？”**

因为可以一路追溯。

---

# 二十二、需求追踪链

最终建立：

```text
Original Document
       ↓
Imported Requirement
       ↓
Analysis
       ↓
Requirement
       ↓
Acceptance Criteria
       ↓
Implementation
       ↓
Verification Evidence
       ↓
Review
       ↓
Commit
```

这条链非常重要。

它实际上是 Rudder-OS 的：

> **Traceability Chain**

---

# 二十三、整改阶段计划

建议实际按照以下顺序实施。

## Phase 1：Import

目标：

```text
外部需求 → Imported Requirement
```

产物：

```text
Import Skill
Import Rule
Import Schema
```

---

## Phase 2：Analyze / Decompose

目标：

```text
Imported Requirement
        ↓
Requirement Map
```

产物：

```text
Analysis Skill
Decomposition Skill
Requirement Schema
```

---

## Phase 3：Workflow

目标：

建立：

```text
State
Transition
Gate
```

---

## Phase 4：Requirement

目标：

建立：

```text
REQ-XXX/
```

生命周期。

---

## Phase 5：Plan / AC

目标：

建立：

```text
Plan
+
Acceptance Criteria
```

---

## Phase 6：Verify / Evidence

目标：

建立：

```text
AC
↓
Test
↓
Evidence
↓
PASS
```

---

## Phase 7：Review

完成：

```text
Verify ≠ Review
```

职责分离。

---

## Phase 8：Skills

清理：

```text
重复 Skill
冲突 Skill
自己定义 Workflow 的 Skill
```

重新按照能力分类。

---

## Phase 9：Claude Code

让 Claude Code 完全按照：

```text
.rudder
+
skills
```

工作。

---

## Phase 10：Gate Automation

最终实现：

```text
非法状态
    ↓
阻止下一阶段
```

例如：

```text
Verify FAIL
    ↓
❌ 禁止 Commit
```

---

# 二十四、最终验收测试

整改不能只检查目录结构。

必须用一个真实的大需求进行 E2E 测试。

例如：

```text
测试输入：

一个 30～50 页 PRD
```

执行：

```text
Import
↓
Analyze
↓
Decompose
↓
生成 10～20 个 Requirement
↓
选择其中一个
↓
Plan
↓
Implement
↓
Verify
↓
Review
↓
Commit
```

测试以下能力：

### 需求导入

```text
[ ] PDF 可以导入
[ ] Word 可以导入
[ ] Markdown 可以导入
```

### 需求分析

```text
[ ] 能识别业务目标
[ ] 能识别功能
[ ] 能识别约束
[ ] 能识别依赖
```

### 需求拆分

```text
[ ] 能拆出独立 Requirement
[ ] 不会过度拆分
[ ] Requirement 可以独立验证
[ ] Requirement 可以追溯原始需求
```

### 生命周期

```text
[ ] Plan
[ ] Implement
[ ] Verify
[ ] Review
[ ] Commit
```

全部正常。

### Gate

测试：

```text
Verify FAIL
    ↓
Commit
```

应该：

```text
❌ BLOCK
```

测试：

```text
Review FAIL
    ↓
Commit
```

应该：

```text
❌ BLOCK
```

---

# 二十五、最终目录

整改完成后，我建议 Rudder-OS 最终形成：

```text
Rudder-OS/
│
├── .rudder/
│   ├── README.md
│   ├── constitution.md
│   │
│   ├── workflow/
│   │   ├── lifecycle.md
│   │   ├── states.md
│   │   ├── transitions.md
│   │   └── gates.md
│   │
│   ├── import/
│   ├── analysis/
│   ├── requirement/
│   ├── implementation/
│   ├── verification/
│   ├── review/
│   └── agents/
│
├── skills/
│   ├── import/
│   ├── analysis/
│   ├── planning/
│   ├── implementation/
│   ├── testing/
│   ├── verification/
│   ├── review/
│   └── commit/
│
├── requirements/
│   │
│   ├── IMP-20260922-001/
│   │   ├── source/
│   │   ├── imported.md
│   │   ├── metadata.yaml
│   │   ├── analysis.md
│   │   └── requirement-map.yaml
│   │
│   ├── REQ-001-user-login/
│   │   ├── README.md
│   │   ├── plan.md
│   │   ├── implement.md
│   │   ├── verify.md
│   │   ├── review.md
│   │   └── commit.md
│   │
│   └── REQ-002-user-register/
│       └── ...
│
└── README.md
```

---

# 二十六、整改后的最终模型

整个 Rudder-OS 最终可以浓缩成下面这套模型：

```text
                 ┌────────────────┐
                 │     INPUT      │
                 │ PRD / PDF / MD │
                 │ DOCX / XLSX...│
                 └───────┬────────┘
                         ↓
                 ┌────────────────┐
                 │     IMPORT     │
                 │ Parse / Extract│
                 └───────┬────────┘
                         ↓
                 ┌────────────────┐
                 │    ANALYZE     │
                 │ Understand     │
                 └───────┬────────┘
                         ↓
                 ┌────────────────┐
                 │   DECOMPOSE    │
                 │ Split Reqs     │
                 └───────┬────────┘
                         ↓
               ┌─────────────────────┐
               │  Requirement Map    │
               └──────────┬──────────┘
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
       REQ-001         REQ-002         REQ-003
          │               │               │
          ↓               ↓               ↓
        PLAN            PLAN            PLAN
          ↓               ↓               ↓
     IMPLEMENT       IMPLEMENT       IMPLEMENT
          ↓               ↓               ↓
       VERIFY          VERIFY          VERIFY
          ↓               ↓               ↓
       REVIEW          REVIEW          REVIEW
          ↓               ↓               ↓
       COMMIT          COMMIT          COMMIT
```

而底层始终遵循：

```text
.rudder
   │
   ├── Rules
   ├── Workflow
   ├── States
   ├── Transitions
   └── Gates
          │
          ↓
       Skills
          │
          ↓
        Agent
          │
          ↓
        Code
          │
          ↓
       Evidence
```

## 最终原则

整个整改可以归纳为 **6 句话**：

> **1. Import 负责把外部需求带进系统。**
> **2. Analyze / Decompose 负责把大需求变成可执行 Requirement。**
> **3. `.rudder` 负责定义规则、状态、流程和 Gate。**
> **4. Skills 负责提供能力，不负责自行定义生命周期。**
> **5. Agent（包括 Claude Code）负责执行，而不是制定规则。**
> **6. Evidence + Gate 保证每个 Requirement 真正完成后才能进入下一阶段。**

