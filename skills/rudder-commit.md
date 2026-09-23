---
claude:
  description: Perform 5-point pre-commit checks, clean code, commit to Git, and archive the requirement.
  argument-hint: [REQ-ID]
hermes:
  name: rudder-commit
  description: Perform 5-point pre-commit checks, clean code, commit to Git, and archive the requirement.
  triggers:
    - 提交 REQ-
    - 归档 REQ-
    - rudder-commit
    - 完成需求
    - 提交代码
---

> This is **Phase 6 (Commit)** of the requirement lifecycle, strictly following `.rudder/workflow/lifecycle.md`. Archive is the post-action of Commit, not a phase of its own.

## Goal
Perform strict pre-commit checks, clean up the code, commit to Git, and archive the requirement directory.

<!-- hermes-only:start -->
## Parameter Extraction
Extract the target REQ-ID. If missing, **MUST ask in Chinese**.
<!-- hermes-only:end -->

## Execution Steps
1. **5-Point Gate Check**: **MUST** satisfy ALL simultaneously. Stop and error immediately if any fails, reporting each precondition's current value against its expected value:
   - `plan.md` == `APPROVED`
   - `tasks.md` == `DONE`
   - `implement.md` == `COMPLETED`
   - `verify.md` == `PASS`
   - `review.md` == `APPROVED`
2. **Garbage Collection**: Clean up unused imports, non-debug `console.log`s, and dead code.
3. **Git Commit**: Execute `git add` and `git commit` (Chinese commit message). Update `commit.md` status to `DONE` and sync `README.md` status to `COMMITTED`.
4. **Archive**:
   - **MUST use `git mv`** to move `requirements/REQ-XXX-<kebab-name>/` to `requirements/archive/<YYYY-MM>-REQ-XXX-<kebab-name>/`, preserving rename history.
   - Run `npm run sync:master` to update the `MASTER-PRD.md` index (**order is: move first, then sync**).
   - Backfill `commit.md` archive metadata (`archived: true`, `archived_at`, `archive_path`).
   - **Archived means sealed**: further changes to a committed REQ **MUST** open a new REQ, never edit the archived directory in place.
   - If `git mv` fails, stop and report; never discard the requirement directory.

## 🗣️ Interaction & Output Constraints (STRICT)
- **Commit Message**: The Git commit message **MUST be in Chinese** (e.g., `feat(REQ-001): 实现用户登录页面及状态管理`).
- **User Interaction**: The final completion and archive report to the user **MUST be in Chinese**.
