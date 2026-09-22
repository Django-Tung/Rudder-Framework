---
description: Perform 5-point pre-commit checks, clean code, commit to Git, and archive the requirement.
argument-hint: [REQ-ID]
---

# Command: rudder-commit

> ⚠️ **Dual Maintenance**: Semantically equivalent to `.hermes/skills/rudder-commit/SKILL.md`.

## Goal
Perform strict pre-commit checks, clean code, commit, and archive.

## Execution Steps
1. **5-Point Gate**: MUST satisfy ALL: `plan`=APPROVED, `tasks`=DONE, `implement`=COMPLETED, `verify`=PASS, `review`=APPROVED. Stop if any fails.
2. **Cleanup**: Remove unused imports and `console.log`.
3. **Git Commit**: `git add` & `git commit`. `commit.md` -> `DONE`.
4. **Archive**: 
   - **MUST use `git mv`** to move to `requirements/archive/`.
   - Run `npm run sync:master`.
   - Backfill `commit.md` metadata.

## 🗣️ Interaction & Output Constraints (STRICT)
- **Commit Message**: The Git commit message **MUST be in Chinese** (e.g., `feat(REQ-001): 实现用户登录页面及状态管理`).
- **User Interaction**: The final completion report to the user **MUST be in Chinese**.