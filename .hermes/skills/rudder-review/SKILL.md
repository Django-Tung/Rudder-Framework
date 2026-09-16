---
name: rudder-review
description: Use this skill after verification passes. It compares the actual code against the plan.md acceptance criteria and populates the review.md checklist for human approval.
---

# Skill: rudder-review

> ⚠️ **双份维护**：本文件与 `.claude/commands/rudder-review.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Execution Steps
1. **Lock Context**: Ensure target `REQ-XXX` has `verify.md` status as `PASS`.
2. **Compliance Check**: Read `plan.md` and compare against the code.
3. **Populate Review**: Update `review.md` checklist:
   - Requirement Compliance (ACs met?)
   - Architecture (UI -> Service -> Mock?)
   - Scope (No out-of-scope features?)
   - Code Quality (No `any`, no debug logs?)
   - UI (All text in Simplified Chinese?)
4. **Set Status**: Set `review.md` frontmatter `status: PENDING_HUMAN_REVIEW`.
5. **Report**: State the checklist is filled. Ask the human to perform Code Review and reply "Review 通过" to proceed to commit, or "要求修改：[具体问题]" to send it back.

## 人工打回返工 (Rework Path)
当人工回复"要求修改：[具体问题]"时，按 `.rudder/lifecycle.md` §4.2 执行：
1. 将 `review.md` frontmatter `status` 置为 `CHANGES_REQUESTED`（作为本轮被打回的记录留存）。
2. 将 `implement.md` `status` 重置为 `IN_PROGRESS`，携带人工意见退回实施。
3. 将 `verify.md` `status` 重置为 `PENDING`（旧验证证据随代码变更作废）。
4. 返工完成后，将 `review.md` `status` 重置为 `PENDING`，重新执行 verify → review 全流程。