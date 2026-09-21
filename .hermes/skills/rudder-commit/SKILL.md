---
name: rudder-commit
description: Use this skill when the human approves the review. It checks five preconditions, performs garbage collection, executes an atomic git commit, and archives the requirement to close the lifecycle.
---

# Skill: rudder-commit

> ⚠️ **双份维护**：本文件与 `.claude/commands/rudder-commit.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Execution Steps
1. **Lock Context**: Identify target `REQ-XXX`.
2. **Precondition Check**（五项前置）: Verify `plan` is APPROVED, `tasks` is DONE, `implement` is COMPLETED, `verify` is PASS, and `review` is APPROVED. If any fail, STOP and report.
   - 阻断态：`verify.md` 为 `FAIL` 或 `review.md` 为 `CHANGES_REQUESTED` 时**必须 STOP**。完整门控定义见 `.rudder/lifecycle.md` §3。
3. **Garbage Collection**: Remove unused imports and debug `console.log`s.
4. **Execute Commit**:
   - `git add .` (scoped to this REQ's files)
   - `git commit -m "feat([REQ-XXX]): [中文提交信息]"`
5. **Finalize**: Update `commit.md` with the commit hash. Set `commit.md` frontmatter `status: DONE`.
6. **Archive**（后置动作，见 `.rudder/lifecycle.md` §4.6）:
   - `git mv requirements/REQ-XXX/ requirements/archive/<YYYY-MM>-REQ-XXX-<kebab-name>/`
   - 运行 `node scripts/sync-master-prd.js` 更新索引。
   - 回填 `commit.md` 的 `archived: true`、`archived_at`、`archive_path`。
7. **Report**: Celebrate the completion and archive of the requirement lifecycle.
