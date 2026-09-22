---
description: Elaborate a skeleton or input into a structured PRD (plan.md) with AC and Page Structure.
argument-hint: [REQ-ID or Description]
---

# Command: rudder-plan

> ⚠️ **Dual Maintenance**: Semantically equivalent to `.hermes/skills/rudder-plan/SKILL.md`.

## Goal
Transform a vague idea or pre-built skeleton into a contract-first PRD (`plan.md`) with AC and Page Structure.

## Execution Steps
1. **Context Loading**: 
   - If `REQ-XXX`: Read skeleton and specific snippet from `import-report.md`. **FORBIDDEN to re-read raw doc.**
   - If new description: Generate new directory and skeleton.
2. **Clarify First**: 
   - If Completeness is Medium/Low, **MUST ask clarification questions first**.
   - **NEVER guess** before user answers.
3. **Elaborate**: Complete `plan.md` **MUST** include:
   - Business Background & Non-Goals
   - User Stories & Scenarios
   - **BDD Acceptance Criteria**: Strictly numbered `AC-1`, `AC-2`.
   - 📐 **Page Structure & Component Skeleton**: Nested lists/ASCII for layout and React component hierarchy.
   - UI/UX Tri-state Specs & Tech Contract.
4. **Gate**: Set `plan.md` status to `DRAFT`. Present core PRD to user and ask for approval.

## 🗣️ Interaction & Output Constraints (STRICT)
- **User Interaction**: ALL clarification questions and the final approval prompt **MUST be in Chinese**. 
  - *Required Approval Prompt*: "请 Review。确认无误后，请回复：**PRD 批准，状态改为 APPROVED**"
- **Business Content**: The entire content of `plan.md` (Background, Stories, ACs, Page Structure) **MUST be written in Chinese**. Technical terms/YAML keys can be English.