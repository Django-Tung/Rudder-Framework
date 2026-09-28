---
claude:
  description: Execute implementation based on approved plan.md, planning component structure and writing contract-first code.
  argument-hint: [REQ-ID]
hermes:
  name: rudder-implement
  description: Execute implementation based on approved plan.md, planning component structure and writing contract-first code.
  triggers:
    - 开始实施 REQ-
    - 写代码 REQ-
    - rudder-implement
    - 开始开发
    - 实施需求
---

> This covers **Tasks** and **Implement** of the requirement lifecycle, strictly following `.rudder/workflow/lifecycle.md`.

## Goal
Execute the implementation of an approved PRD by breaking it down into tasks, planning the component structure based on the Page Structure, and writing contract-first code.

<!-- hermes-only:start -->
## Parameter Extraction
Extract the target REQ-ID from user input. If missing, **MUST ask in Chinese**.
<!-- hermes-only:end -->

## Execution Steps
1. **Check Gate**: Confirm target `REQ-XXX/plan.md` status **MUST** be `APPROVED`, and every REQ in its `deps` **MUST** also have `plan.md` = `APPROVED`. Stop and error otherwise, listing each unmet precondition.
2. **Task Breakdown**: Create or update `tasks.md`. Decompose AC-N from `plan.md` into specific tasks, set status to `READY`. Sync `README.md` status to `PLANNED`.
3. **Component Planning**:
   - **STRICT ACTION**: Strictly map the [📐 Page Structure & Component Skeleton] from `plan.md` to the `src/` directory structure.
   - **FORBIDDEN** to invent new components outside the defined tree.
4. **Contract-First Coding**: Code in strict order: `Types` -> `Mocks` (**every mock/service MUST simulate 300–800ms latency via `setTimeout`**) -> `Services` -> `UI` (React + Tailwind).
   - UI **MUST** implement Loading / Empty / Error states.
   - Check off `tasks.md` in real-time, and keep `README.md` `status` in sync (derived value, see `.rudder/workflow/states.md`).
5. **Quality Checks**: After implementation, run `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:skills`, and `npm run check:req` in order. Any failure must be fixed and retried, with at most 3 rounds.
6. **Finalize**: Set `tasks.md` status to `DONE`. Record the implementation summary, file list, and complete machine-check output in `implement.md`; set status to `COMPLETED`, and sync `README.md` status to `IMPLEMENTED`.
7. **Failure Rule**: After 3 failed rounds, keep `implement.md` as `IN_PROGRESS`, record the failures, stop, and report to the human.

## 🗣️ Interaction & Output Constraints (STRICT)
- **UI Copy**: All user-facing text in the UI components **MUST be in Chinese**.
- **User Interaction**: When reporting completion or asking for the next step, **MUST use Chinese**.
