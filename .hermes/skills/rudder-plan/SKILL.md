---
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

# Skill: rudder-plan

> ⚠️ **Dual Maintenance**: This file is semantically equivalent to `.claude/commands/rudder-plan.md`.
> This is **Phase 1 (Plan)** of the requirement lifecycle, strictly following `.rudder/lifecycle.md`.

## Goal
Transform a vague idea or a pre-built skeleton from `rudder-import` into a structured, contract-first PRD (`plan.md`) with clear Acceptance Criteria (AC) and a high-level Page Structure.

## Parameter Extraction
Extract the target REQ-ID (e.g., "REQ-001") or the new requirement description from user input. 
If ambiguous, **MUST ask the user in Chinese** to clarify.

## Execution Steps
1. **Context Loading**: 
   - If user provides `REQ-XXX`: Read the existing skeleton at `requirements/REQ-XXX-xxx/plan.md` and the specific snippet from `requirements/_inbox/*.import-report.md`. **FORBIDDEN to re-read the lengthy raw imported document.**
   - If user provides a new description: Generate a new `REQ-XXX-<kebab-name>` directory and `plan.md` skeleton.
2. **Clarify First**: 
   - Check the "Completeness" in the import report. If "Medium" or "Low", **MUST ask clarification questions first**.
   - **NEVER guess or complete** business logic, edge cases, or ACs before the user explicitly answers.
3. **Elaborate**: 
   - After user clarification, complete the `plan.md` skeleton into a full PRD. It **MUST** include:
     - **Business Background & Non-Goals**
     - **User Stories & Scenarios**
     - **BDD Acceptance Criteria**: Strictly numbered as `AC-1`, `AC-2` (required for `check-tasks` validation).
     - 📐 **Page Structure & Component Skeleton**: Use nested lists or simple ASCII diagrams to define core layout areas and React component hierarchy. No CSS needed, but layout intent must be clear.
     - **UI/UX Tri-state Specs** (Loading / Empty / Error)
     - **Tech Contract & Data Model** (Zustand Store, Mock Schema)
4. **Gate**: 
   - Set `plan.md` `status` to `DRAFT`.
   - Present the core PRD (especially Page Structure) to the user. 

## 🗣️ Interaction & Output Constraints (STRICT)
- **User Interaction**: ALL clarification questions and the final approval prompt **MUST be in Chinese**. 
  - *Required Approval Prompt*: "请 Review。确认无误后，请回复：**PRD 批准，状态改为 APPROVED**"
- **Business Content**: The entire content of `plan.md` (Background, Stories, ACs, Page Structure) **MUST be written in Chinese**. Technical terms, component names, and YAML keys can remain in English.