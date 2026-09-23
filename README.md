# 🧭 Rudder OS 使用手册

## 1. 简介

Rudder OS 是一个为 AI Agent（如 Claude Code, Hermes Agent）设计的结构化需求原型开发框架。它通过**严格的规则约束**、**标准化的文档模板**和**自动化的反馈闭环**，确保 AI 能够高质量、可追溯地交付纯前端 React 原型。

第一次使用请先阅读[新手教程](docs/getting-started.md)，其中包含环境准备、依赖安装、开发服务器启动和第一个需求的完整示例。

### 核心设计理念

- **规则与事实分离**：`.rudder/` 存放不可变的工程规则与模板；`requirements/` 存放具体需求的执行记录与证据。
- **证据优于承诺**：AI 不能口头声称"代码没问题"，必须在 `verify.md` 中留下机器验证（Build/Lint）通过的日志证据。
- **双层状态**：每个需求有 **REQ 顶层状态**（`README.md` 的 `status`，回答"整体走到哪了"）
  与 **阶段产物状态**（6 个文件各自的 `status`，回答"这个文件自身什么状态"）。
  顶层状态**由产物状态推导**，一致性由脚本断言。
- **状态机驱动**：每个需求严格按 `Plan -> Tasks -> Implement -> Verify -> Review -> Commit` 流转（归档为 Commit 的后置动作），不可越级。
- **依赖受控**：需求之间可以声明依赖，进入 Plan 前必须确认依赖方「已定下来要做什么」（`plan.md` = `APPROVED`）。
  上游契约变更时，机器算依赖闭包并标 `STALE`，**由人逐跳裁决**是否真受影响。
- **变更受控**：需求范围中途变更**禁止就地默默改代码**，必须走 `/rudder-change` 协议，将 `plan.md` 退回 `DRAFT`、级联失效下游证据，并向下游传导 `STALE`。
- **技能单一源**：技能只在 `skills/` 手写一份，两个 runtime 的命令/技能文件由脚本生成，漂移由 `check:skills` 拦截。

---

## 2. 核心目录说明

```text
project/
├── AGENTS.md                 # 【宪法】四条 Core Directives（状态、生命周期、规范、语言）
├── CLAUDE.md                 # 【入口】Claude Code 的导读与硬性约束速查
│
├── .rudder/                  # 【规则与模板】AI 的行为准则（先读 README.md 导航）
│   ├── README.md             # 规则体系总导航（四层分离 + 分工说明）
│   ├── constitution.md       # 工程宪法（技术栈 / 语言 / 架构 / 反馈闭环 / 技能源）
│   ├── workflow/             # 需求生命周期：总览 / 取值 / 门禁 / 流转
│   │   ├── lifecycle.md      #   流程起点：阶段与产物总览
│   │   ├── states.md         #   所有状态枚举与顶层状态推导表
│   │   ├── gates.md          #   门禁：何时允许进入下一阶段（含依赖门禁）
│   │   └── transitions.md    #   异常流转：6 类
│   ├── import/               # IMP 管道：输入 / 解析 / 归一化
│   ├── analysis/             # 分析侧：analysis 规格 / 拆分判定 / 依赖与 STALE
│   ├── requirement/          # REQ 侧：7 文件结构 / AC 编号规范
│   ├── implementation/       # 三阶段产物规格
│   ├── verification/
│   ├── review/
│   ├── agents/               # 各 runtime 的读取约定与上下文边界
│   └── templates/            # 需求文档模板（状态初值的来源）
│
├── skills/                   # 【技能权威源】唯一手写处：rudder-<name>.md × 7
│
├── requirements/             # 【事实与证据】具体需求的工作区
│   ├── MASTER-PRD.md         # 全局业务规则、术语表、需求索引 + 待批准拆分（pending_maps）
│   ├── REQ-001-xxx/          # 单个需求的完整生命周期档案（7 个文件）
│   │   ├── README.md         #   REQ 级元数据：顶层状态、依赖、STALE
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── implement.md
│   │   ├── verify.md
│   │   ├── review.md
│   │   └── commit.md
│   ├── IMP-YYYYMMDD-NNN/     # 一次文档导入的管道目录
│   │   ├── source/           #   原件留痕
│   │   ├── imported.md       #   归一化 Markdown
│   │   ├── metadata.yaml     #   管道状态与来源元数据
│   │   └── analysis.md       #   语义分析产物
│   ├── _inbox/               # 临时暂存，仅保留 fixtures/（脚本扫描时跳过）
│   └── archive/              # 已归档需求与 IMP
│
├── scripts/                  # 确定性工具脚本
├── docs/                     # 框架级设计文档（非需求产物）
├── .claude/commands/         # Claude Code 命令（由 scripts/sync-skills.js 生成，勿手改）
└── .hermes/skills/           # Hermes Agent 技能（由 scripts/sync-skills.js 生成，勿手改）
```

### 确定性脚本速查

以下脚本**不依赖 AI**，可随时手动运行：

| 命令 | 作用 |
| :--- | :--- |
| `npm run check:req` | 断言 tasks 勾选一致性（I1/I2）、`README.md` 顶层状态推导一致、依赖闭包与 `STALE` 一致 |
| `npm run check:skills` | 逐字节比对技能投影与权威源，拦截"改了投影没改源" |
| `npm run sync:skills` | 从 `skills/` 重新生成 14 个投影文件 |
| `npm run sync:master` | 依据各 REQ 的 `README.md` 重新生成 `MASTER-PRD.md` 索引块（加 `-- --check` 只校验） |
| `node scripts/check-import.js <IMP 目录>` | 断言 IMP 的 `metadata.yaml` / `analysis.md` 齐备且取值合法 |

---

## 3. 两条入口

需求有两条进入生命周期的路径，**在 `plan.md` 被批准之后完全汇流**。

### 先选入口

| 你的情况 | 使用入口 | 入口结束后做什么 |
|---|---|---|
| 已有一份完整需求文档 | `/rudder-import` | 人工批准功能点拆分后，对每个 REQ 执行 `/rudder-plan` |
| 只有一个新想法或单个功能 | `/rudder-plan` | 直接进入详细 PRD 设计 |

路径 A 的 Import 只回答“这份文档大致包含哪些功能点”，不回答“页面怎么做、AC 怎么写、接口和数据模型是什么”。这些问题统一在 Plan 阶段解决。

| | **路径 A：批量（文档驱动）** | **路径 B：增量（人驱动）** |
| :--- | :--- | :--- |
| **触发** | `/rudder-import 需求文档.docx` | `/rudder-plan 需求描述` |
| **第一个批准点** | **拆分批准**（人工确认后再创建 REQ 目录） | `plan.md` 的 `APPROVED` |
| **`deps` 来源** | 拆分结果（人工可在批准前调整） | **人工填写**，Agent 不得猜测 |
| **索引「来源」列** | `IMP-YYYYMMDD-NNN` | `人工登记` |
| **适用** | 拿到一份完整需求说明书，要拆成多个需求 | 临时想到一个需求，直接开工 |

### 路径 A：批量导入（IMP 管道）

IMP 是**终止式管道**——4 个顺序状态、无失败态、无回环：

```text
imported ──[粗读+拆分]──► analyzed ──[人工确认]──► approved ──[归档]──► archived
```

1. **`imported`**：运行 `node scripts/import-docx.js <文档>` 归一化；
   创建 `requirements/IMP-YYYYMMDD-NNN/`，原件原样复制进 `source/`。
2. **`analyzed`**：AI 只做粗略读取和功能点拆分，产出轻量 `analysis.md`，
   并把候选拆分结论写入 `MASTER-PRD.md` 的 `pending_maps`（`status: DRAFT`）。
   - **全局规则 / 术语**只记录文档明确写出的候选项；
   - **候选独立功能点**拆成 `pending_maps` 中的 REQ 条目；
   - 不在 Import 阶段编写 AC、页面结构、UI 三态、数据模型或技术契约；
   - 模糊内容标记为待 Plan 确认，不擅自补全。
3. **⏸ 人工确认**：`/rudder-import` **内部暂停**，展示拆分结果（REQ 清单、标题、依赖关系），
   请人工用中文确认。**批准前不会创建任何 REQ 目录。**
4. **`approved`**：人工确认后，该条目置 `APPROVED`，为其中每个 REQ 创建目录与 7 个产物文件，
   然后**立即从 `pending_maps` 移除**该条目——REQ 此后由 `AUTO-INDEX` 承接，不在两处登记。
   接着对每个 REQ 运行 `/rudder-plan REQ-XXX`，完成详细 PRD 和技术契约。

路径 A 的实际操作顺序：

```text
/rudder-import 需求文档.docx
   ↓ 人工确认“拆分批准，创建 REQ 目录”
/rudder-plan REQ-001
/rudder-plan REQ-002
   ↓ 分别批准各 REQ 的 plan.md
/rudder-implement REQ-001
```

> **只支持 `.docx` / `.md` / `.txt`。PDF 与 xlsx 明确不受支持**（Non-Goal，见 `.rudder/import/sources.md` §5）。
> `requirements/_inbox/` 已降级为临时暂存，仅保留 `fixtures/`，**不再承载任何管道产物**。

### 路径 B：人工登记

直接创建 `requirements/REQ-XXX-<kebab-name>/` 与 7 个产物文件，`deps` 由**人工确认**，
不经过 `pending_maps`。

路径 B 的实际操作顺序：

```text
/rudder-plan 用户登录功能，需要邮箱密码和记住我
   ↓ 人工确认“PRD 批准，状态改为 APPROVED”
/rudder-implement REQ-001
```

---

## 4. 标准工作流

一个需求从提出到归档，需经历 **6 个标准阶段**：`Plan -> Tasks -> Implement -> Verify -> Review -> Commit`，
外加 Commit 之后的**归档**后置动作。

> 为便于阅读，下文把 **Tasks（任务拆解）** 并入「阶段 2：Implement」一并叙述——它实际是 Implement 的起始步骤，且有独立的状态与不变量校验。

### REQ 顶层状态机

```text
PLANNED ──► IMPLEMENTING ──► VERIFYING ──► VERIFIED ──► REVIEWING ──► REVIEWED ──► COMMITTED
```

顶层 `status` **由 6 个产物的 `status` 推导得出**，`README.md` 中存的是持久化副本：

| 顶层 `status` | 推导条件 |
|---|---|
| `PLANNED` | `plan.md` ∈ {`DRAFT`,`APPROVED`} ∧ `implement.md` = `PENDING` |
| `IMPLEMENTING` | `implement.md` ∈ {`IN_PROGRESS`,`OUTDATED`} 或 `review.md` = `CHANGES_REQUESTED` |
| `VERIFYING` | `implement.md` = `COMPLETED` ∧ `verify.md` ∈ {`PENDING`,`FAIL`} |
| `VERIFIED` | `verify.md` = `PASS` ∧ `review.md` = `PENDING` |
| `REVIEWING` | `verify.md` = `PASS` ∧ `review.md` = `PENDING_HUMAN_REVIEW` |
| `REVIEWED` | `review.md` = `APPROVED` ∧ `commit.md` = `PENDING` |
| `COMMITTED` | `commit.md` = `DONE` |

> `stale`（跨 REQ 的上游变更标记）是**正交**的布尔字段，**不进入**该枚举。
> 完整定义见 `.rudder/workflow/states.md`。

### 阶段 1：Plan (需求规划)

**目标**：将模糊的想法转化为结构化的 PRD 和技术契约。

1. **依赖门禁**：确认 `README.md` 中 `deps` 列出的每个 REQ 的 `plan.md` 都是 `APPROVED`
   （**不是**要求它们已提交）。不满足则停止并逐项报告。
2. **用户操作**：输入初步需求（例如："做一个用户登录页，包含邮箱密码和记住我"）。
3. **AI 响应**：提出 1-3 个关键澄清问题（如边界情况、交互细节）。
4. **用户操作**：回答澄清问题。
5. **AI 响应**：按 `.rudder/templates/plan.md` 创建 `plan.md`，填入业务背景与**非目标 (Non-Goals)**、用户故事与场景、BDD 验收标准、UI/UX 三态规范、技术契约与数据模型，状态设为 `DRAFT`；同步 `README.md` 顶层状态为 `PLANNED`。
   - ⚠️ 验收标准必须以 `AC-1` / `AC-2` 形式编号，且 `tasks.md` 拆解时逐条引用——
     `npm run check:req` 的 **I1（拆解完备）** 依赖此格式，编号不规范会让该校验形同虚设。
   - **非目标**是防范围蔓延的硬边界，Review 阶段的「范围合规」会逐条核对。
6. **门控 (Gate)**：用户 Review `plan.md`。确认无误后，回复："**PRD 批准，状态改为 APPROVED**"。

### 阶段 2：Implement (代码实施)

**目标**：AI 按照契约进行 Contract-First 编码。

1. **用户操作**：下达实施指令（如："开始实施 REQ-001"）。
2. **AI 响应**：
   - 按 `plan.md` 验收标准拆解 `tasks.md`（每条标注 AC 编号，状态 `READY`）。
   - 严格按顺序开发：`Types` -> `Mocks` (含 300-800ms 延迟) -> `Services` -> `UI` (含 Loading/Error/Empty 状态，且文案全为中文)，并实时勾选 `tasks.md`。
   - 全部勾选后置 `tasks.md` 为 `DONE`，将变更摘要和文件列表写入 `implement.md`，状态设为 `COMPLETED`；
     同步 `README.md` 顶层状态为 `VERIFYING`。
3. **不变量校验**：AI 须运行 `npm run check:req` 且退出码为 0。它拦截两类作弊：
   **I1 拆解不完备**（AC 未被任务覆盖）、**I2 虚假完成**（`implement.md` 已 `COMPLETED` 但 `tasks.md` 仍有未勾选项），
   并断言顶层状态推导一致。
4. **门控 (Gate)**：AI 提示实施完成，等待验证指令。

### 阶段 3：Verify (机器验证)

**目标**：通过自动化命令生成不可伪造的通过证据。

1. **用户操作**：下达验证指令（如："验证 REQ-001"）。
2. **AI 响应 (自动闭环)**：
   - 依次执行 `npm run typecheck`、`npm run lint`、`npm run build`、`npm run check:skills`、`npm run check:req`。
     （`check:skills` 与 `check:req` 与前三条**同级**，非零退出即不通过。）
   - **如果报错**：AI **必须**读取终端报错，自动修复代码，并重新运行，直到 0 报错。
   - **如果通过**：AI 将成功的终端输出记录到 `verify.md`，状态设为 `PASS`；同步顶层状态为 `VERIFIED`。
   - **连续失败 3 轮**：AI **必须停止**，将 `verify.md` 状态设为 `FAIL` 并上报人工，**不得推进到 Review**。
3. **门控 (Gate)**：用户确认 `verify.md` 中各项均为 PASS。

### 阶段 4：Review (代码审查)

**目标**：确认代码是否正确、完整地解决了 `plan.md` 中的需求。

1. **用户操作**：下达审查指令（如："审查 REQ-001"）。
2. **AI 响应**：对照 `plan.md` 的验收标准逐项检查代码，在 `review.md` 中填写自检清单（架构合规、范围合规、页面结构合规、界面质量），状态设为 `PENDING_HUMAN_REVIEW`；同步顶层状态为 `REVIEWING`。
3. **门控 (Gate)**：用户进行人工 Code Review。
   - 若需修改：回复"要求修改：[具体问题]"。AI 将 `review.md` 置为 `CHANGES_REQUESTED`，
     并把 `implement.md` 重置为 `IN_PROGRESS`、`verify.md` 重置为 `PENDING`、`tasks.md` 重置为 `DRAFT`，
     顶层状态回到 `IMPLEMENTING`，退回 Implement 阶段。
   - 若通过：回复："**Review 通过，状态改为 APPROVED**"。

### 阶段 5：Commit (归档提交)

**目标**：原子性提交代码，完成生命周期。

1. **用户操作**：下达提交指令（如："提交 REQ-001"）。
2. **AI 响应**：
   - **五项前置校验**（唯一需要五项全满足的阶段）：`plan.md`=`APPROVED` ∧ `tasks.md`=`DONE` ∧ `implement.md`=`COMPLETED` ∧ `verify.md`=`PASS` ∧ `review.md`=`APPROVED`。任一不满足即停止并**逐项报告当前值与期望值**。
   - 执行垃圾回收（清理未使用的 import、调试 `console.log`、死代码）。
   - 执行 `git add` 和 `git commit`（中文 commit message）。
   - 更新 `commit.md`，状态设为 `DONE`；同步顶层状态为 `COMMITTED`。
3. **归档（后置动作，非阶段）**：
   - `git mv requirements/REQ-XXX-xxx/ requirements/archive/<YYYY-MM>-REQ-XXX-xxx/`（**必须用 `git mv`** 保留重命名历史）。
   - 运行 `npm run sync:master` 更新 `MASTER-PRD.md` 索引（顺序必须是「**先移动，后同步**」）。
   - 回填 `commit.md` 的 `archived: true` / `archived_at` / `archive_path`。
   - ⚠️ **归档即封存**：已归档需求禁止就地修改，任何后续变更须**开新 REQ**。

---

### 特殊分支一：需求变更 (Change)

范围变更（Scope Creep）**不是**一个阶段，而是 Plan/Implement 期间可能插入的控制协议。触发 `/rudder-change` 后：

1. 更新 `plan.md` 的 User Stories / AC，并在文末追加 `## 📝 Change Log`（**日期、内容、原因、影响范围**四要素）。
2. `plan.md` 重置为 `DRAFT`，等待人工重新批准。
3. **级联失效**（逐文件）：`tasks.md`→`DRAFT`、`implement.md`→`OUTDATED`、`verify.md`→`INVALIDATED`、`review.md`→`INVALIDATED`、顶层状态→`IMPLEMENTING`。
4. **代码冻结**：人工回复"PRD 批准"前，严禁修改 `src/` 下任何代码。
5. 批准后，`OUTDATED` / `INVALIDATED` 由对应阶段重置回 `PENDING` 起算，重走 Tasks → Implement → Verify → Review。

| 产物 | 变更后状态 | 含义 |
| :--- | :--- | :--- |
| `plan.md` | `DRAFT` | 契约已改，等待重新批准 |
| `tasks.md` | `DRAFT` | 旧任务清单作废，需重新拆解 |
| `implement.md` | `OUTDATED` | 旧实现作废 |
| `verify.md` | `INVALIDATED` | 旧验证证据作废 |
| `review.md` | `INVALIDATED` | 旧审查记录作废 |
| `README.md` | `IMPLEMENTING` | 顶层状态随推导回退 |

> 完整协议见 `.rudder/workflow/transitions.md` §4。
> 若目标 REQ 已 `DONE`/已归档，**禁止就地修改**，须新建 REQ 并在 Plan 中注明"继承/扩展自 REQ-XXX"。

### 特殊分支二：依赖变更传播 (STALE)

**上一次变更不一定影响下游。** 判定分两步，**机器只做第一步**：

```text
REQ-001 契约变更
  ↓ 机器：读 MASTER-PRD 的 AUTO-INDEX「依赖」列，算直接 + 间接依赖闭包
  ↓ 机器：把闭包内每个 REQ 的 README.md 标 stale: true（stale_reason = REQ-001）
  ↓ 人：对每个 STALE 判断「契约是否真受影响」
       ├─ 没受影响 → 重新跑 verify 通过 → stale: false
       └─ 真受影响 → 标 OUTDATED / INVALIDATED → 顶层状态回 IMPLEMENTING
                    → 把它的下游再标 STALE（下一跳，再裁决一次）
```

- **一跳一裁决**：变更传播一跳一跳走，每跳人裁决一次；上游未受影响时下游不受牵连。
- **Agent 不得代替人裁决**：不得自行判定"未受影响"并摘除 `STALE`，也不得自行推进该 REQ 的任何阶段。

> `STALE`（跨 REQ）与 `OUTDATED`/`INVALIDATED`（同一 REQ 内）是**两套机制**，
> 区别见 `.rudder/analysis/dependency.md` §3。

---

## 5. 常用指令速查

### 使用 Claude Code (终端)

通过 `.claude/commands/` 下的斜杠命令触发，需指定 REQ-ID。

| 阶段 | 用户输入示例 |
| :--- | :--- |
| **路径 A：Import** | `/rudder-import 需求文档.docx` |
| **路径 B：Plan** | `/rudder-plan 用户登录功能，需要邮箱密码和记住我` |
| **Implement** | `/rudder-implement REQ-001` |
| **Verify** | `/rudder-verify REQ-001` |
| **Review** | `/rudder-review REQ-001` |
| **Commit** | `/rudder-commit REQ-001` |
| **Change** (异常分支) | `/rudder-change REQ-001 "增加忘记密码入口"` |

### 使用 Hermes Agent (终端/IM)

通过自然语言意图触发 `.hermes/skills/` 下的技能。

| 阶段 | 用户输入示例 |
| :--- | :--- |
| **路径 A：Import** | "调用 rudder-import 技能，导入需求文档.docx。" |
| **路径 B：Plan** | "调用 rudder-plan 技能。我想做一个用户登录功能，需要邮箱密码和记住我。" |
| **Implement** | "PRD 已批准。调用 rudder-implement 技能，开始实施 REQ-001。" |
| **Verify** | "调用 rudder-verify 技能，验证 REQ-001 的代码并生成验证证据。" |
| **Review** | "调用 rudder-review 技能，检查 REQ-001 是否符合 PRD 验收标准。" |
| **Commit** | "Review 已通过。调用 rudder-commit 技能，提交并归档 REQ-001。" |
| **Change** (异常分支) | "调用 rudder-change 技能。REQ-001 需要增加一个忘记密码入口。" |

> ⚠️ **技能是单一源 + 双投影**：两个 runtime 的文件都由 `skills/rudder-<name>.md` 生成。
> **修改任一阶段的行为时，只改 `skills/` 下的源文件**，然后运行 `npm run sync:skills`。
> 直接编辑 `.claude/commands/` 或 `.hermes/skills/` 属于违规——`npm run check:skills` 会拦截。

---

## 6. 高级场景处理

### 场景 A：查看全局需求状态

推荐直接跑确定性脚本，而不是让 AI 逐个读文件（更快、且索引格式统一）：

```bash
npm run sync:master              # 重新生成 MASTER-PRD.md 的索引块
npm run sync:master -- --check   # 只校验索引与事实是否一致，不写入
```

> **输入**（若确需 AI 汇总）："运行 `npm run sync:master` 更新索引，并读取 `requirements/MASTER-PRD.md` 的索引块，汇报每个需求的当前状态与依赖。"

### 场景 B：Verify 阶段持续失败

> **输入**："我看到 `verify.md` 状态是 FAIL。请读取终端的报错日志，分析原因，修复代码，并重新执行 verify 流程，直到状态变为 PASS。"

### 场景 C：需求中途变更 (Scope Creep)

**不要**让 AI 直接在原代码上改。走变更控制协议：

> **输入（Claude Code）**：`/rudder-change REQ-001 "增加忘记密码入口"`
>
> **输入（Hermes）**："调用 rudder-change 技能。REQ-001 需要增加一个忘记密码入口。"

AI 会更新 `plan.md`（含 Change Log）、退回 `DRAFT`，并级联失效下游证据。此后 AI **必须停手**，直到你回复"**PRD 批准**"。

### 场景 D：代码偏离预期，需要重置

> **输入**："当前 REQ-001 的代码实现偏离了预期。请执行 `git reset --hard HEAD~1` 回滚到上一个 commit，并将 `tasks.md` 重置为 DRAFT、`implement.md` / `verify.md` / `review.md` 重置为 PENDING，`plan.md` 保持 APPROVED 不变，我们从 Tasks 阶段重新实施。"
>
> 注意与场景 C 的区别：**整体回滚**（本节）是丢弃实现但契约不变，故 `plan.md` 保持 `APPROVED`，状态回到**初值** `PENDING`；**需求变更**（场景 C）是契约本身变了，故 `plan.md` 退回 `DRAFT`，下游进入 `OUTDATED`/`INVALIDATED` **失效态**。

### 场景 E：收到不支持的文档格式

> 若 AI 被要求导入 PDF 或 xlsx，它**必须**明确告知不支持并引用 Non-Goal 声明，
> **不得**尝试解析。见 `.rudder/import/sources.md` §5。

---

## 7. 最佳实践与注意事项

1. **让 AI 自己修 Bug**：当 AI 在 Implement 或 Verify 阶段写出有问题的代码时，**不要手动帮它修改**。指出问题或让它看报错日志，强制它触发自动修复闭环。
2. **只看 `verify.md`，不听口头承诺**：如果 AI 在聊天中说"已经测试通过"，但 `verify.md` 中没有 `npm run build` 的 PASS 记录，视为未通过。
3. **保持上下文隔离 (One REQ at a time)**：处理 `REQ-001` 时，绝对不要让它去修改 `REQ-002` 的代码。强制它完成当前需求的 Commit 后，再开启下一个需求。
4. **严格遵循技术栈**：Rudder OS 的核心策略之一是防止 AI 引入重型库或自定义 CSS。发现违规应在 Review 阶段直接打回。
5. **需求变更走协议，不要就地改**：直接让 AI"顺手加个功能"会绕过 AC，导致 Review 失去基准、归档证据失真。**已归档 (DONE) 的需求一律开新 REQ**。
6. **状态用脚本校验，别只听汇报**：`npm run check:req`、`npm run check:skills`、`npm run sync:master -- --check` 都是确定性的。若 AI 声称"任务已全部完成"，但 `check:req` 退出码非 0，视为未完成。
7. **依赖边要如实登记**：`deps` 漏登记不会让依赖消失，只会让上游变更时下游**静默失真**。依赖图越密 = 拆分质量越差，应尽量让每个 REQ 自洽。
8. **`STALE` 的裁决权在人**：不要让 AI 自己判断"应该没受影响"就摘掉标记。这是语义判断，不是结构判断。
9. **一次只推进一个 REQ**：变更协议期间严格单线程——`/rudder-change` 处理中的需求未获批准前，不要让 AI 开始其他 REQ 的开发。

---

**开始使用**：路径 B 输入第一个 `/rudder-plan [你的需求描述]`；路径 A 输入 `/rudder-import [文档路径]`。
