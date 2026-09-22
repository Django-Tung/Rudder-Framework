---
name: rudder-import
description: Import external requirement docs (.docx/.md/.txt), normalize, classify into a Requirement Tree, and pre-build REQ skeletons.
triggers:
  - 导入需求文档
  - 导入需求
  - rudder-import
  - 把这份文档导入到需求里
  - 解析需求
---

# Skill: rudder-import

> ⚠️ **Dual Maintenance**: This file is semantically equivalent to `.claude/commands/rudder-import.md`.
> This is a **pre-lifecycle tool**, outside the state machine (rules in `.rudder/policies/import.md`).

## Goal
Import an external requirement document, normalize it, structurally classify it into a Requirement Tree, and pre-build skeletons for independent features to enable progressive elaboration.

## Parameter Extraction
Extract the document path from the user's natural language input (e.g., "导入 ./docs/req.docx" -> `./docs/req.docx`). 
If the path is missing, **MUST ask the user in Chinese** to provide it. **NEVER guess the path.**

## Execution Steps
1. **Convert**: Run `node scripts/import-docx.js <extracted_path>`. The script normalizes the document to Markdown and outputs to `requirements/_inbox/<name>.md`.
2. **Read & Classify**: Read the normalized Markdown. Identify and split into:
   - **Global Rules/Terms**: Suggest merging into `requirements/MASTER-PRD.md`.
   - **Independent Features**: Structurally decompose by `Epic -> Feature` hierarchy.
3. **Pre-build Skeletons**: 
   - For each identified feature, pre-build a directory `requirements/REQ-XXX-<kebab-name>/`.
   - Generate a `plan.md` skeleton containing only basic YAML frontmatter and a reference to the raw requirement snippet.
   - Set the skeleton's `status` to `WAITING_CLARIFICATION`.
4. **Write Report**: Generate `requirements/_inbox/<name>.import-report.md`. It **MUST** include:
   - 📌 **Global Rules Extraction**
   - 🌳 **Requirement Tree**: Hierarchical list with estimated REQ-ID, core objective, and "Completeness" (High/Medium/Low).
   - ❓ **Clarification Questions**: Mandatory questions for Medium/Low features (at least 1). **NEVER guess or hallucinate business logic.**
   - 💡 **Next Steps**
5. **Verify**: Run `node scripts/check-import.js <report-path>`. Exit code **MUST** be 0.
6. **Report to User**: Output the Requirement Tree and Clarification Questions to the user.

## 🗣️ Interaction & Output Constraints (STRICT)
- **User Interaction**: ALL questions, reports, and prompts to the user **MUST be in Chinese (中文)**.
- **Business Content**: Extracted business logic, requirement trees, and clarification questions **MUST be in Chinese**.
- **System/Paths**: File paths, YAML keys, and structural markers remain in English.