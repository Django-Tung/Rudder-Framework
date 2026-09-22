---
description: Self-review against plan.md, checking AC and Page Structure compliance, then await human approval.
argument-hint: [REQ-ID]
---

# Command: rudder-review

> ⚠️ **Dual Maintenance**: Semantically equivalent to `.hermes/skills/rudder-review/SKILL.md`.

## Goal
Self-review against approved PRD, checking AC and Page Structure compliance, then await human approval.

## Execution Steps
1. **Check Gate**: `verify.md` MUST be `PASS`.
2. **Self-Review**: Fill `review.md` checklist:
   - [ ] Architecture compliance
   - [ ] Scope compliance (Non-Goals)
   - [ ] AC Coverage
   - [ ] **📐 Page Structure Compliance**: Does actual code match [Page Structure] in `plan.md`?
3. **Status**: `review.md` -> `PENDING_HUMAN_REVIEW`.
4. **Gate**: Prompt user for human review. If changes requested, cascade reset states.

## 🗣️ Interaction & Output Constraints (STRICT)
- **User Interaction**: The prompt asking for human review **MUST be in Chinese**.
  - *Required Prompt*: "代码自检已完成，请进行人工 Review。确认无误后，请回复：**Review 通过，状态改为 APPROVED**。如需修改，请指出具体问题。"
- **Review Content**: The self-review comments in `review.md` **MUST be in Chinese**.