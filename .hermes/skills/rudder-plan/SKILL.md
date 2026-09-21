---
name: rudder-plan
description: Use this skill when the user wants to start a new requirement, analyze raw ideas, or generate a PRD. It creates the initial plan.md in the requirements directory.
---

# Skill: rudder-plan

> ⚠️ **双份维护**：本文件与 `.claude/commands/rudder-plan.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Execution Steps
1. **Analyze & Clarify**: If the request is ambiguous, ask up to 3 critical clarifying questions in **Simplified Chinese**.
2. **Generate ID & Directory**: Create `requirements/REQ-[XXX]-[kebab-case-name]/`. Determine the next number by scanning the **union** of `requirements/` and `requirements/archive/` (skip `_`-prefixed directories), taking the max + 1.
3. **Populate Plan**: Create `plan.md` using the `.rudder/templates/plan.md` structure. 
   - All User Stories, ACs, and UI Copy MUST be in **Simplified Chinese**.
   - Define Technical Contract (Types, Services).
4. **Set Status**: Set YAML frontmatter `status: DRAFT`（状态机定义见 `.rudder/lifecycle.md`）。
   - ⚠️ 不得自行置为 `APPROVED`，该状态只能由人工批准后写入。
5. **Report**: Output the file path. Ask the human to review and reply "PRD 批准" to proceed.

## Input Context
User's raw requirement description.