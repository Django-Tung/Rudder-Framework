---
description: Handle scope creep by updating PRD, invalidating downstream evidence, and freezing code.
argument-hint: [REQ-ID] [Change Description]
---

# Command: rudder-change

> ⚠️ **Dual Maintenance**: Semantically equivalent to `.hermes/skills/rudder-change/SKILL.md`.

## Goal
Handle scope creep by updating PRD, invalidating downstream evidence, and freezing code until human re-approval.

## Execution Steps
1. **Update Plan**: Update AC in `plan.md`. Append `## 📝 Change Log`.
2. **Cascade Invalidation**: `plan`/`tasks` -> `DRAFT`, `implement` -> `OUTDATED`, `verify`/`review` -> `INVALIDATED`.
3. **Code Freeze**: **STRICT CONSTRAINT**: **FORBIDDEN** to modify `src/` before user replies "PRD 批准".
4. **Report**: Inform user that changes are logged, evidence invalidated, and code is frozen.

## 🗣️ Interaction & Output Constraints (STRICT)
- **Change Log**: The content of the `Change Log` in `plan.md` **MUST be in Chinese**.
- **User Interaction**: The report informing the user about the freeze and requesting re-approval **MUST be in Chinese**.
  - *Required Prompt*: "需求变更已记录，下游证据已级联失效，代码已冻结。请 Review 新的 plan.md。确认无误后，请回复：**PRD 批准，状态改为 APPROVED** 以解冻代码。"