# 🧭 Rudder OS 使用手册

## 1. 简介
Rudder OS 是一个为 AI Agent（如 Claude Code, Hermes Agent）设计的结构化需求原型开发框架。它通过**严格的规则约束**、**标准化的文档模板**和**自动化的反馈闭环**，确保 AI 能够高质量、可追溯地交付纯前端 React 原型。

### 核心设计理念
- **规则与事实分离**：`.rudder/` 存放不可变的工程规则与模板；`requirements/` 存放具体需求的执行记录与证据。
- **证据优于承诺**：AI 不能口头声称“代码没问题”，必须在 `verify.md` 中留下机器验证（Build/Lint）通过的日志证据。
- **状态机驱动**：每个需求必须严格按 `Plan -> Tasks -> Implement -> Verify -> Review -> Commit` 流转（归档为 Commit 的后置动作），不可越级。

---

## 2. 核心目录说明

在使用前，请确保你的项目包含以下核心结构：

```text
project/
├── .rudder/                  # 【规则与模板】AI 的行为准则
│   ├── lifecycle.md          # 状态机流转规则（6 阶段 + 归档后置动作）
│   ├── policies/             # 核心工程规范（技术栈、中文约束、反馈闭环、导入解析）
│   └── templates/            # 需求生命周期文档模板 (plan, tasks, implement, verify, review, commit)
│
├── requirements/             # 【事实与证据】具体需求的工作区
│   ├── MASTER-PRD.md         # 全局业务规则、术语表、需求状态索引（脚本维护索引块）
│   ├── REQ-001-xxx/          # 单个需求的完整生命周期档案
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── implement.md
│   │   ├── verify.md
│   │   ├── review.md
│   │   └── commit.md
│   ├── _inbox/               # 导入中间产物（脚本扫描时跳过）
│   └── archive/              # 已完成需求归档目录
│
├── scripts/                  # 确定性工具脚本（sync-master-prd / check-tasks / check-import / import-docx）
├── .claude/commands/         # Claude Code 专属触发命令
└── .hermes/skills/           # Hermes Agent 专属触发技能
```

---

## 3. 标准工作流 (The Workflow)

一个需求从提出到归档，需经历以下 6 个标准阶段（另含 Commit 后的归档后置动作）。

### 阶段 1：Plan (需求规划)
**目标**：将模糊的想法转化为结构化的 PRD 和技术契约。
1. **用户操作**：输入初步需求（例如：“做一个用户登录页，包含邮箱密码和记住我”）。
2. **AI 响应**：AI 会提出 1-3 个关键澄清问题（如边界情况、交互细节）。
3. **用户操作**：回答澄清问题。
4. **AI 响应**：创建 `requirements/REQ-XXX-xxx/plan.md`，填入用户故事、BDD 验收标准、中文 UI 文案和技术契约，状态设为 `DRAFT`。
5. **门控 (Gate)**：用户 Review `plan.md`。确认无误后，回复：“**PRD 批准，状态改为 APPROVED**”。

### 阶段 2：Implement (代码实施)
**目标**：AI 按照契约进行 Contract-First 编码。
1. **用户操作**：下达实施指令（如：“开始实施 REQ-001”）。
2. **AI 响应**：
   - 锁定当前 `REQ-XXX` 目录。
   - 按 `plan.md` 验收标准拆解 `tasks.md`（每条标注 AC 编号，状态 `READY`）。
   - 严格按顺序开发：`Types` -> `Mocks` (含 300-800ms 延迟) -> `Services` -> `UI` (含 Loading/Error/Empty 状态，且文案全为中文)，并实时勾选 `tasks.md`。
   - 全部勾选后置 `tasks.md` 为 `DONE`，将变更摘要和文件列表写入 `implement.md`，状态设为 `COMPLETED`。
3. **门控 (Gate)**：AI 提示实施完成，等待验证指令。

### 阶段 3：Verify (机器验证)
**目标**：通过自动化命令生成不可伪造的通过证据。
1. **用户操作**：下达验证指令（如：“验证 REQ-001”）。
2. **AI 响应 (自动闭环)**：
   - 在终端依次执行 `npm run typecheck`, `npm run lint`, `npm run build`。
   - **如果报错**：AI **必须**读取终端报错，自动修复代码，并重新运行，直到 0 报错。（此过程 AI 自动完成，无需用户介入）。
   - **如果通过**：AI 将成功的终端输出记录到 `verify.md`，状态设为 `PASS`。
   - **连续失败 3 轮**：AI **必须停止**，将 `verify.md` 状态设为 `FAIL` 并上报人工，不得推进到 Review。
3. **门控 (Gate)**：用户确认 `verify.md` 中各项均为 PASS。

### 阶段 4：Review (代码审查)
**目标**：确认代码是否正确、完整地解决了 `plan.md` 中的需求。
1. **用户操作**：下达审查指令（如：“审查 REQ-001”）。
2. **AI 响应**：AI 对照 `plan.md` 的验收标准，逐项检查代码，并在 `review.md` 中填写自检清单（架构合规、范围合规、代码质量等），状态设为 `PENDING_HUMAN_REVIEW`。
3. **门控 (Gate)**：用户进行人工 Code Review。
   - 若需修改：回复“要求修改：[具体问题]”。AI 将 `review.md` 置为 `CHANGES_REQUESTED`，并把 `implement.md` 重置为 `IN_PROGRESS`、`verify.md` 重置为 `PENDING`，退回 Implement 阶段。
   - 若通过：回复：“**Review 通过，状态改为 APPROVED**”。

### 阶段 5：Commit (归档提交)
**目标**：原子性提交代码，完成生命周期。
1. **用户操作**：下达提交指令（如：“提交 REQ-001”）。
2. **AI 响应**：
   - 检查前置条件（Plan, Implement, Verify, Review 是否全为通过/批准状态）。
   - 执行垃圾回收（清理未使用的 import 和 console.log）。
   - 执行 `git add` 和 `git commit`（使用规范的中文 commit message）。
   - 更新 `commit.md`，状态设为 `DONE`。

---

## 4. 常用指令速查

根据你使用的 AI 工具，选择对应的触发方式。

### 使用 Claude Code (终端)
通过 `.claude/commands/` 下的斜杠命令触发，需指定 REQ-ID。

| 阶段 | 用户输入示例 |
| :--- | :--- |
| **Import** | `/rudder-import 需求文档.docx` |
| **Plan** | `/rudder-plan 用户登录功能，需要邮箱密码和记住我` |
| **Implement** | `/rudder-implement REQ-001` |
| **Verify** | `/rudder-verify REQ-001` |
| **Review** | `/rudder-review REQ-001` |
| **Commit** | `/rudder-commit REQ-001` |

### 使用 Hermes Agent (终端/IM)
通过自然语言意图触发 `.hermes/skills/` 下的技能。

| 阶段 | 用户输入示例 |
| :--- | :--- |
| **Import** | "调用 rudder-import 技能，导入需求文档.docx。" |
| **Plan** | "调用 rudder-plan 技能。我想做一个用户登录功能，需要邮箱密码和记住我。" |
| **Implement** | "PRD 已批准。调用 rudder-implement 技能，开始实施 REQ-001。" |
| **Verify** | "调用 rudder-verify 技能，验证 REQ-001 的代码并生成验证证据。" |
| **Review** | "调用 rudder-review 技能，检查 REQ-001 是否符合 PRD 验收标准。" |
| **Commit** | "Review 已通过。调用 rudder-commit 技能，提交并归档 REQ-001。" |

> ⚠️ **双份维护**：`.claude/commands/rudder-*.md` 与 `.hermes/skills/rudder-*/SKILL.md` 是同一套流程面向两个 runtime 的两种表述，内容必须保持等价。**修改任一阶段的行为时，两份都要改。**

---

## 5. 高级场景处理

### 场景 A：查看全局需求状态

> **输入**："读取 `requirements/` 目录下所有 REQ 目录的 frontmatter，输出一个全局状态看板，列出每个需求的当前 Phase 和 Status。"

### 场景 B：Verify 阶段持续失败

> **输入**："我看到 `verify.md` 状态是 FAIL。请读取终端的报错日志，分析原因，修复代码，并重新执行 verify 流程，直到状态变为 PASS。"

### 场景 C：需求中途变更 (Scope Creep)

> **输入**："在登录功能中增加一个'忘记密码'入口。请暂停当前 implement，回到 plan 阶段，更新 `plan.md` 的 Scope 和 AC，等待我重新批准。"

### 场景 D：代码偏离预期，需要重置

> **输入**："当前 REQ-001 的代码实现偏离了预期。请执行 `git reset --hard HEAD~1` 回滚到上一个 commit，并将 `implement.md` 和 `verify.md` 的状态重置为 PENDING，我们重新实施。"

---

## 6. 最佳实践与注意事项

1. **让 AI 自己修 Bug**：当 AI 在 Implement 或 Verify 阶段写出有问题的代码时，**不要手动帮它修改**。指出问题或让它看报错日志，强制它触发自动修复闭环。你的时间应花在业务逻辑审查上。
2. **只看 `verify.md`，不听口头承诺**：如果 AI 在聊天中说“已经测试通过”，但 `verify.md` 中没有 `npm run build` 的 PASS 记录，视为未通过，必须要求其补充证据。
3. **保持上下文隔离 (One REQ at a time)**：当 AI 正在处理 `REQ-001` 时，绝对不要让它去修改 `REQ-002` 的代码。强制它完成当前需求的 Commit 后，再开启下一个需求，避免 LLM 上下文污染。
4. **严格遵循技术栈**：Rudder OS 的核心策略之一是防止 AI 引入重型库（如 Ant Design, Redux）或自定义 CSS。如果发现 AI 违规，应在 Review 阶段直接打回。

---

**开始使用**：打开你的终端，输入第一个 `/rudder-plan [你的需求描述]`，即可启动自动化原型开发流程。
