---
description: Import external docs, normalize, classify into a Requirement Tree, and pre-build REQ skeletons.
argument-hint: [Document Path]
---

# Command: rudder-import

> ⚠️ **Dual Maintenance**: Semantically equivalent to `.hermes/skills/rudder-import/SKILL.md`.

## Goal
Import an external requirement document, normalize it, structurally classify it into a Requirement Tree, and pre-build skeletons for progressive elaboration.

## Execution Steps
1. **Convert**: Run `node scripts/import-docx.js $ARGUMENTS`. Output to `requirements/_inbox/<name>.md`.
2. **Read & Classify**: Read the Markdown. Split into:
   - **Global Rules/Terms**: Suggest merging into `MASTER-PRD.md`.
   - **Independent Features**: Decompose by `Epic -> Feature` hierarchy.
3. **Pre-build Skeletons**: 
   - For each feature, pre-build `requirements/REQ-XXX-<kebab-name>/`.
   - Generate a `plan.md` skeleton (YAML frontmatter + raw snippet reference). Status: `WAITING_CLARIFICATION`.
4. **Write Report**: Generate `requirements/_inbox/<name>.import-report.md` **MUST** include:
   - 📌 **Global Rules Extraction**
   - 🌳 **Requirement Tree**: Hierarchical list with REQ-ID, objective, and "Completeness" (High/Medium/Low).
   - ❓ **Clarification Questions**: Mandatory questions for Medium/Low features (at least 1). **NEVER guess business logic.**
   - 💡 **Next Steps**
5. **Verify**: Run `node scripts/check-import.js <report-path>`. Exit code MUST be 0.
6. **Report to User**: Output the Requirement Tree and Clarification Questions.

## 🗣️ Interaction & Output Constraints (STRICT)
- **User Interaction**: ALL questions, reports, and prompts to the user **MUST be in Chinese (中文)**.
- **Business Content**: Extracted business logic and clarification questions **MUST be in Chinese**.
- **System/Paths**: File paths, YAML keys, and structural markers remain in English.