---
description: 启动新需求：分析原始想法、澄清歧义，生成 PRD 与技术契约（plan.md）
argument-hint: [原始需求描述]
---

# Command: rudder-plan

> ⚠️ **双份维护**：本文件与 `.hermes/skills/rudder-plan/SKILL.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Goal
Initialize a new requirement lifecycle based on the user's raw idea.

## Execution Steps
1. **Analyze & Clarify**: If the user's request is ambiguous, ask up to 3 critical clarifying questions in **Simplified Chinese**.
2. **Generate ID & Directory**: Create a new directory `requirements/REQ-[XXX]-[kebab-case-name]/`. Determine the next available REQ number by scanning the `requirements/` folder.
3. **Populate Plan**: Create `plan.md` inside this directory. Fill it out strictly following the template in `.rudder/templates/plan.md`. 
   - Ensure all User Stories, Acceptance Criteria, and UI Copy are in **Simplified Chinese**.
   - Define the Technical Contract (Types, Services).
4. **Set Status**: Ensure the YAML frontmatter `status` is `DRAFT`（状态机定义见 `.rudder/lifecycle.md`）。
   - ⚠️ 不得自行置为 `APPROVED`，该状态只能由人工批准后写入。
5. **Report**: Output the file path. Ask the human: "请 Review 此 PRD (plan.md)。如果没问题，请回复 'PRD 批准'，我将把状态改为 APPROVED 并等待实施指令。"

## Arguments
$ARGUMENTS (The raw requirement description)