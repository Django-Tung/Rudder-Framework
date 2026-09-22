---
name: rudder-implement
description: Execute implementation based on approved plan.md, planning component structure and writing contract-first code.
triggers:
  - 开始实施 REQ-
  - 写代码 REQ-
  - rudder-implement
  - 开始开发
  - 实施需求
---

# Skill: rudder-implement

> ⚠️ **Dual Maintenance**: This file is semantically equivalent to `.claude/commands/rudder-implement.md`.

## Goal
Execute the implementation of an approved PRD by breaking it down into tasks, planning the component structure based on the Page Structure, and writing contract-first code.

## Parameter Extraction
Extract the target REQ-ID from user input. If missing, **MUST ask in Chinese**.

## Execution Steps
1. **Check Gate**: Confirm target `REQ-XXX/plan.md` status **MUST** be `APPROVED`. Stop and error otherwise.
2. **Task Breakdown**: Create or update `tasks.md`. Decompose AC-N from `plan.md` into specific tasks, set status to `READY`.
3. **Component Planning**: 
   - **STRICT ACTION**: Strictly map the [📐 Page Structure & Component Skeleton] from `plan.md` to the `src/` directory structure.
   - **FORBIDDEN** to invent new components outside the defined tree.
4. **Contract-First Coding**: Code in strict order: `Types` -> `Mocks` (with 300-800ms delay) -> `Services` -> `UI` (React + Tailwind). 
   - UI must implement Loading/Empty/Error states.
   - Check off `tasks.md` in real-time.
5. **Finalize**: Set `tasks.md` status to `DONE`. Update `implement.md` with change summary and file list, set status to `COMPLETED`.
6. **Invariant Check**: Run `npm run check:tasks`. Exit code **MUST** be 0. If fails, fix and retry.

## 🗣️ Interaction & Output Constraints (STRICT)
- **UI Copy**: All user-facing text in the UI components **MUST be in Chinese**.
- **User Interaction**: When reporting completion or asking for the next step, **MUST use Chinese**.