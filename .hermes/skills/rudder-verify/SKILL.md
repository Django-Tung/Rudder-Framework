---
name: rudder-verify
description: Run machine verification commands and record exact terminal output as undeniable proof.
triggers:
  - 验证 REQ-
  - 检查代码 REQ-
  - rudder-verify
  - 跑一下验证
  - 机器验证
---

# Skill: rudder-verify

> ⚠️ **Dual Maintenance**: This file is semantically equivalent to `.claude/commands/rudder-verify.md`.

## Goal
Run deterministic machine verification commands and record the exact terminal output as undeniable proof of passing.

## Parameter Extraction
Extract the target REQ-ID. If missing, **MUST ask in Chinese**.

## Execution Steps
1. **Check Gate**: Confirm `implement.md` status **MUST** be `COMPLETED`.
2. **Execute Commands**: Run sequentially in terminal:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
3. **Auto-Fix Loop**: 
   - If any command fails, **MUST** read terminal errors, auto-fix code, and retry.
   - Maximum 3 retries allowed.
4. **Record Evidence**: 
   - If passed within 3 retries: Record the **EXACT full terminal output** into `verify.md`, set status to `PASS`.
   - If failed 3 times: Stop immediately, set `verify.md` status to `FAIL`, and report to user. **NEVER** proceed to Review.

## 🗣️ Interaction & Output Constraints (STRICT)
- **User Interaction**: If verification fails after 3 retries, the error report, analysis, and explanation to the user **MUST be in Chinese**.