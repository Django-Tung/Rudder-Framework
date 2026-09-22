---
description: Execute implementation based on approved plan.md, planning component structure and writing contract-first code.
argument-hint: [REQ-ID]
---

# Command: rudder-implement

> ⚠️ **Dual Maintenance**: Semantically equivalent to `.hermes/skills/rudder-implement/SKILL.md`.

## Goal
Execute implementation by breaking down tasks, planning component structure based on Page Structure, and writing contract-first code.

## Execution Steps
1. **Check Gate**: `plan.md` MUST be `APPROVED`. Stop otherwise.
2. **Task Breakdown**: Create/update `tasks.md`. Decompose AC-N into tasks, status `READY`.
3. **Component Planning**: **STRICTLY** map the [📐 Page Structure] from `plan.md` to `src/`. **FORBIDDEN** to invent components outside the tree.
4. **Contract-First Coding**: Order: `Types` -> `Mocks` -> `Services` -> `UI`. Check off `tasks.md` in real-time.
5. **Finalize**: `tasks.md` -> `DONE`, `implement.md` -> `COMPLETED`.
6. **Invariant Check**: Run `npm run check:tasks`. Exit code MUST be 0.

## 🗣️ Interaction & Output Constraints (STRICT)
- **UI Copy**: All user-facing text in the UI components **MUST be in Chinese**.
- **User Interaction**: When reporting completion or asking for the next step, **MUST use Chinese**.