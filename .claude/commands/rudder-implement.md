---
description: 按已批准的 PRD 进行 Contract-First 实施，产出 implement.md
argument-hint: [REQ-ID]
---

# Command: rudder-implement

> ⚠️ **双份维护**：本文件与 `.hermes/skills/rudder-implement/SKILL.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Goal
Autonomously implement the approved requirement using Contract-First approach.

## Execution Steps
1. **Lock Context**: Identify the target `REQ-XXX` from `$ARGUMENTS` or find the latest `APPROVED` requirement in `requirements/`. Read its `plan.md`.
2. **Gate Check**: Ensure `plan.md` frontmatter `status` is `APPROVED`（门控定义见 `.rudder/lifecycle.md` §3）。
   - ⚠️ **不得自行批准**：若 `plan.md` 仍为 `DRAFT`，立即停止并请人工回复 'PRD 批准'。只有人工可将其置为 `APPROVED`。
   - 门控通过后，创建或更新 `implement.md`，并将其 frontmatter `status` 置为 `IN_PROGRESS`。
3. **Contract-First Coding**:
   - **Types**: Define interfaces in `src/types/`.
   - **Mocks**: Create fake data in `src/mocks/`.
   - **Services**: Create API functions in `src/services/` that return Promises and **MUST simulate 300-800ms delay** using `setTimeout`.
   - **UI**: Build components in `src/`. Ensure all user-facing text is in **Simplified Chinese** (extracted from `plan.md`). Handle Loading, Error, and Empty states.
4. **Log Changes**: Update `implement.md` with the list of files changed and a brief summary of what was done.
5. **Set Status**: Change `implement.md` frontmatter `status` to `COMPLETED`.
6. **Report**: "实施完成。代码已按照契约编写，UI 文案已中文化。请下达 verify 指令。"

## Arguments
$ARGUMENTS (The REQ-ID, e.g., REQ-001)