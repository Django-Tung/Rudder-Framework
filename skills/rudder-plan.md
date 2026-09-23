---
claude:
  description: Elaborate a skeleton or user input into a structured PRD (plan.md) with AC and Page Structure.
  argument-hint: [REQ-ID or Description]
hermes:
  name: rudder-plan
  description: Elaborate a pre-built skeleton or user input into a structured PRD (plan.md) with AC and Page Structure.
  triggers:
    - 开始规划需求
    - 细化需求
    - rudder-plan
    - 开始做 REQ-
    - 帮我规划一下
    - 写 PRD
---

> This is **Phase 1 (Plan)** of the requirement lifecycle, strictly following `.rudder/workflow/lifecycle.md`.

## Goal
Transform a vague idea or a pre-built skeleton into a structured, contract-first PRD (`plan.md`) with clear Acceptance Criteria (AC) and a high-level Page Structure.

<!-- hermes-only:start -->
## Parameter Extraction
Extract the target REQ-ID (e.g., "REQ-001") or the new requirement description from user input.
If ambiguous, **MUST ask the user in Chinese** to clarify.
<!-- hermes-only:end -->

## Execution Steps
1. **Context Loading**:
   - If user provides `REQ-XXX`: Read the existing skeleton at `requirements/REQ-XXX-xxx/plan.md` and the matching `pending_maps` entry in `requirements/MASTER-PRD.md`. **FORBIDDEN to re-read the lengthy raw imported document** (`requirements/IMP-*/imported.md`).
   - If user provides a new description (Path B, manual registration): create a new `REQ-XXX-<kebab-name>/` directory holding all **7** artifacts. `README.md` must carry `id` / `title` / `status: PLANNED` / `deps` / `stale: false`, with `deps` **confirmed by the human, never guessed**.
2. **Dependency Gate**: For every REQ listed in `deps`, confirm its `plan.md` status is `APPROVED`. If any dependency is still `DRAFT`, **STOP** and report the blocking dependency together with its current status. Do **NOT** advance. (Path A additionally requires the split to be already `APPROVED`.)
3. **Clarify First**:
   - Check the "Completeness" of the corresponding `analysis.md`. If "Medium" or "Low", **MUST ask clarification questions first**.
   - **NEVER guess or complete** business logic, edge cases, or ACs before the user explicitly answers.
4. **Elaborate**:
   - After user clarification, complete the `plan.md` skeleton into a full PRD. It **MUST** include:
     - **Business Background & Non-Goals**
     - **User Stories & Scenarios**
     - **BDD Acceptance Criteria**: Strictly numbered as `AC-1`, `AC-2` (required for `check-req` validation).
     - 📐 **Page Structure & Component Skeleton**: Use nested lists or simple ASCII diagrams to define core layout areas and React component hierarchy. No CSS needed, but layout intent must be clear.
     - **UI/UX Tri-state Specs** (Loading / Empty / Error)
     - **Tech Contract & Data Model** (Zustand Store, Mock Schema)
5. **Gate**:
   - Set `plan.md` `status` to `DRAFT`, and sync `README.md` `status` to `PLANNED` (derived value, see `.rudder/workflow/states.md`).
   - Present the core PRD (especially Page Structure) to the user.

## 🗣️ Interaction & Output Constraints (STRICT)
- **User Interaction**: ALL clarification questions and the final approval prompt **MUST be in Chinese**.
  - *Required Approval Prompt*: "请 Review。确认无误后，请回复：**PRD 批准，状态改为 APPROVED**"
- **Business Content**: The entire content of `plan.md` (Background, Stories, ACs, Page Structure) **MUST be written in Chinese**. Technical terms, component names, and YAML keys can remain in English.
