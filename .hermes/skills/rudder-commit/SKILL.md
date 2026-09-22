---
name: rudder-commit
description: Perform 5-point pre-commit checks, clean code, commit to Git, and archive the requirement.
triggers:
  - 提交 REQ-
  - 归档 REQ-
  - rudder-commit
  - 完成需求
  - 提交代码
---

# Skill: rudder-commit

> ⚠️ **Dual Maintenance**: This file is semantically equivalent to `.claude/commands/rudder-commit.md`.

## Goal
Perform strict pre-commit checks, clean up the code, commit to Git, and archive the requirement directory.

## Parameter Extraction
Extract the target REQ-ID. If missing, **MUST ask in Chinese**.

## Execution Steps
1. **5-Point Gate Check**: **MUST** satisfy ALL simultaneously. Stop and error immediately if any fails:
   - `plan.md` == `APPROVED`
   - `tasks.md` == `DONE`
   - `implement.md` == `COMPLETED`
   - `verify.md` == `PASS`
   - `review.md` == `APPROVED`
2. **Garbage Collection**: Clean up unused imports and `console.log`.
3. **Git Commit**: Execute `git add` and `git commit`. Update `commit.md` status to `DONE`.
4. **Archive**: 
   - **MUST use `git mv`** to move `requirements/REQ-XXX-xxx/` to `requirements/archive/<YYYY-MM>-REQ-XXX-xxx/`.
   - Run `npm run sync:master` to update `MASTER-PRD.md` index.
   - Backfill `commit.md` archive metadata (`archived: true`, `archived_at`, `archive_path`).

## 🗣️ Interaction & Output Constraints (STRICT)
- **Commit Message**: The Git commit message **MUST be in Chinese** (e.g., `feat(REQ-001): 实现用户登录页面及状态管理`).
- **User Interaction**: The final completion and archive report to the user **MUST be in Chinese**.