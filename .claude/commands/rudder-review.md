---
description: 对照 plan.md 验收标准审查代码，填写 review.md 自检清单交人工审批
argument-hint: [REQ-ID]
---

# Command: rudder-review

> ⚠️ **双份维护**：本文件与 `.hermes/skills/rudder-review/SKILL.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Goal
Verify that the implementation strictly complies with the approved plan.

## Execution Steps
1. **Lock Context**: Identify the target `REQ-XXX`. Ensure `verify.md` status is `PASS`.
2. **Compliance Check**: Read `plan.md` and compare it against the actual code in `src/`.
3. **Populate Review**: Create or update `review.md`. Check off the following:
   - Requirement Compliance (Are all ACs met?)
   - Architecture (Is the dependency direction correct? UI -> Service -> Mock)
   - Scope (Were any out-of-scope features added?)
   - Code Quality (No `any`, no debug logs, states handled)
   - UI (Is all text in Simplified Chinese?)
4. **Set Status**: Change `review.md` frontmatter `status` to `PENDING_HUMAN_REVIEW`.
5. **Report**: "Review 检查清单已填写完毕。请进行人工 Code Review。如果确认无误，请回复 'Review 通过'，我将准备 commit；如需修改，请回复 '要求修改：[具体问题]'。"

## 人工打回返工 (Rework Path)
当人工回复"要求修改：[具体问题]"时，按 `.rudder/lifecycle.md` §4.2 执行：
1. 将 `review.md` frontmatter `status` 置为 `CHANGES_REQUESTED`（作为本轮被打回的记录留存）。
2. 将 `implement.md` `status` 重置为 `IN_PROGRESS`，携带人工意见退回实施。
3. 将 `verify.md` `status` 重置为 `PENDING`（旧验证证据随代码变更作废）。
4. 返工完成后，将 `review.md` `status` 重置为 `PENDING`，重新执行 verify → review 全流程。

## Arguments
$ARGUMENTS (The REQ-ID)