---
description: 处理已存在需求 (REQ-ID) 的范围变更 (Scope Creep)，自动评估影响、更新 Plan 并级联回滚后续阶段状态。
argumentHint: "<REQ-ID> \"<变更描述>\""
---

# Rudder OS: 需求变更处理指令 (/rudder-change)

> ⚠️ **双份维护**：本文件与 `.hermes/skills/rudder-change/SKILL.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

你是一个严格遵循 Rudder OS 规则的 AI 助手。当用户输入此命令时，必须严格按照以下状态机流程执行，**绝不允许跳过任何步骤**。

## 执行流程

### 步骤 1: 前置检查与定位
1. 解析用户提供的 `<REQ-ID>` (例如: REQ-001)。**若未提供，先询问用户要变更哪个需求。**
2. 检查 `requirements/<REQ-ID>/plan.md` 是否存在。
   - **若不存在**: 报错并提示用户先使用 `/rudder-plan` 创建需求。
   - **若存在且状态为 `DONE`**: 强烈建议用户**不要修改已归档需求**。回复：“⚠️ 该需求已归档 (DONE)。为保持历史不可变性和 Git 提交清晰，建议使用 `/rudder-plan` 创建一个关联的新需求 (如 REQ-002) 来承载此变更。”并停止执行。
   - **若状态为 `DRAFT`, `APPROVED` 或 `IN_PROGRESS`**: 继续执行步骤 2。

### 步骤 2: 影响评估与 Plan 更新
1. 阅读当前的 `plan.md`，理解原有范围。
2. 结合用户的 `<变更描述>`，分析对现有 Types, Mocks, Services, UI 的影响范围。
3. 更新 `requirements/<REQ-ID>/plan.md`：
   - 更新相关的 User Stories 和 BDD 验收标准 (AC)。
   - **必须追加或更新 `## 📝 Change Log` 章节**，记录：
     - 变更时间 (YYYY-MM-DD)
     - 变更内容简述
     - 变更原因/背景
     - 影响范围评估
   - 将 Frontmatter 中的 `status` 修改为 `DRAFT`。

### 步骤 3: 级联状态回滚 (强制闭环)
由于 Plan 已变，后续阶段的证据已失效。你必须自动更新以下文件的状态（修改其 Frontmatter）：
- `requirements/<REQ-ID>/tasks.md` -> `status: DRAFT` (旧任务清单需重新拆解)
- `requirements/<REQ-ID>/implement.md` -> `status: OUTDATED` (并清空核心实现摘要，提示需重新实施)
- `requirements/<REQ-ID>/verify.md` -> `status: INVALIDATED` (清空验证日志)
- `requirements/<REQ-ID>/review.md` -> `status: INVALIDATED` (清空审查记录)

### 步骤 4: 输出变更报告并等待门控
向用户输出一份简明的变更影响报告，格式如下：
``` text
✅ 需求变更已记录
REQ-ID: <REQ-ID>
变更内容: <简述>
影响范围: <列出受影响的模块，如 UI, Types>
当前状态: plan.md 已重置为 DRAFT，后续阶段已标记为 OUTDATED/INVALIDATED。
⏸️ 等待门控: 请 Review 更新后的 plan.md。确认无误后，请回复：“PRD 批准，状态改为 APPROVED”，我将重新开始 Implement 阶段。
```

## 约束条件
- **绝对禁止**在用户明确回复“PRD 批准”之前，擅自修改任何 `src/` 下的代码。
- **绝对禁止**口头承诺“已处理”，必须实际修改 Markdown 文件的 Frontmatter 状态。
- **单线程原则**：处理本变更期间，不同时响应其他 REQ 的开发请求。
- 人工批准后，`OUTDATED` / `INVALIDATED` 由后续阶段（Implement / Verify / Review）重置回 `PENDING` 起算，本命令不负责反向迁移。
- 保持所有生成的文档内容为**简体中文**。