---
description: 校验五项前置状态后执行原子 git 提交与归档，关闭需求生命周期
argument-hint: [REQ-ID]
---

# Command: rudder-commit

> ⚠️ **双份维护**：本文件与 `.hermes/skills/rudder-commit/SKILL.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Goal
Finalize the requirement lifecycle with an atomic git commit, then archive the requirement.

## Execution Steps
1. **Lock Context**: Identify the target `REQ-XXX`.
2. **Precondition Check**（五项前置，完整门控定义见 `.rudder/lifecycle.md` §3）:
   - `plan.md` status is `APPROVED`
   - `tasks.md` status is `DONE`
   - `implement.md` status is `COMPLETED`
   - `verify.md` status is `PASS`
   - `review.md` status is `APPROVED` (Human must have approved)
   - 阻断态检查：若 `verify.md` 为 `FAIL` 或 `review.md` 为 `CHANGES_REQUESTED`，说明本轮未通过，**必须 STOP**。
   - If any precondition fails, STOP and report the missing status.
3. **Garbage Collection**: Run a quick check to remove any unused imports or debug `console.log`s.
4. **Execute Commit**:
   - `git add .` (or specific files related to this REQ)
   - `git commit -m "feat([REQ-XXX]): [简短的中文提交信息]"`
5. **Finalize**: Create or update `commit.md`. Log the commit hash. Change `commit.md` frontmatter `status` to `DONE`.
6. **Archive**（后置动作，见 `.rudder/lifecycle.md` §4.6）:
   - `git mv requirements/REQ-XXX/ requirements/archive/<YYYY-MM>-REQ-XXX-<kebab-name>/`
   - 运行 `node scripts/sync-master-prd.js` 更新索引。
   - 回填 `commit.md` 的 `archived: true`、`archived_at`、`archive_path`。
7. **Report**: "🎉 需求 [REQ-XXX] 生命周期结束，已提交并归档。"

## Arguments
$ARGUMENTS (The REQ-ID)
