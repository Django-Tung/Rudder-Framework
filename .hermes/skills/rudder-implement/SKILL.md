---
name: rudder-implement
description: Use this skill when the PRD is approved and the user wants to write code. Enforces contract-first coding, tracks progress in tasks.md, and logs changes to implement.md.
---

# Skill: rudder-implement

> ⚠️ **双份维护**：本文件与 `.claude/commands/rudder-implement.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Execution Steps
1. **Lock Context**: Find the target `REQ-XXX` (from user input or latest APPROVED). Read its `plan.md`.
2. **Gate Check**: Ensure `plan.md` frontmatter `status` is `APPROVED`（门控定义见 `.rudder/lifecycle.md` §3）。
   - ⚠️ **不得自行批准**：若 `plan.md` 仍为 `DRAFT`，立即停止并请人工回复 'PRD 批准'。只有人工可将其置为 `APPROVED`。
3. **Decompose Tasks**: 创建 `tasks.md`，按 `plan.md` 的验收标准逐条拆解为原子化 Checkbox 任务，每条标注对应 AC 编号（不变量 I1）。将 `tasks.md` frontmatter `status` 置为 `READY`，`implement.md` frontmatter `status` 置为 `IN_PROGRESS`。
4. **Contract-First Coding**（每完成一项，实时勾选 `tasks.md` 对应任务）:
   - **Types**: `src/types/` (No `any`).
   - **Mocks**: `src/mocks/`.
   - **Services**: `src/services/` (MUST simulate 300-800ms delay via `setTimeout`).
   - **UI**: `src/` (Handle Loading/Error/Empty. ALL user-facing text MUST be **Simplified Chinese** from `plan.md`).
5. **Finalize Tasks**: 全部任务勾选完毕后，将 `tasks.md` frontmatter `status` 置为 `DONE`。
6. **Log Changes**: Update `implement.md` with changed files and summary.
7. **Set Status**: Set `implement.md` frontmatter `status: COMPLETED`。
   - ⚠️ `implement.md` = `COMPLETED` 时，`tasks.md` 必须已 `DONE`（否则 Verify 阶段的 `check:tasks` 会拦下 I2）。
8. **Report**: State that implementation is complete and ask for the verify command.
