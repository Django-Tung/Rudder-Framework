---
name: rudder-change
description: Handle scope creep by updating PRD, invalidating downstream evidence, and freezing code.
triggers:
  - 需求变更 REQ-
  - 修改需求 REQ-
  - rudder-change
  - 加个功能 REQ-
  - 变更需求
---

# Skill: rudder-change

> ⚠️ **Dual Maintenance**: This file is semantically equivalent to `.claude/commands/rudder-change.md`.

## Goal
Handle scope creep by updating the PRD, invalidating downstream evidence, and freezing code until human re-approval.

## Parameter Extraction
Extract the target REQ-ID and the description of the change from user input. If missing, **MUST ask in Chinese**.

## Execution Steps
1. **Update Plan**: Update User Stories / AC in `plan.md`. Append `## 📝 Change Log` at the end (record date, content, reason, impact scope).
2. **Cascade Invalidation**: 
   - `plan.md` -> `DRAFT`
   - `tasks.md` -> `DRAFT`
   - `implement.md` -> `OUTDATED`
   - `verify.md` -> `INVALIDATED`
   - `review.md` -> `INVALIDATED`
3. **Code Freeze**: 
   - **STRICT CONSTRAINT**: **FORBIDDEN** to modify any code under `src/` before the user replies "PRD 批准".
4. **Report**: Inform the user that changes are logged, downstream evidence is invalidated, and code is frozen.

## 🗣️ Interaction & Output Constraints (STRICT)
- **Change Log**: The content of the `Change Log` in `plan.md` **MUST be written in Chinese**.
- **User Interaction**: The report informing the user about the freeze and requesting re-approval **MUST be in Chinese**.
  - *Required Prompt*: "需求变更已记录，下游证据已级联失效，代码已冻结。请 Review 新的 plan.md。确认无误后，请回复：**PRD 批准，状态改为 APPROVED** 以解冻代码。"