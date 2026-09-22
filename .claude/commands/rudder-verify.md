---
description: Run machine verification commands and record exact terminal output as undeniable proof.
argument-hint: [REQ-ID]
---

# Command: rudder-verify

> ⚠️ **Dual Maintenance**: Semantically equivalent to `.hermes/skills/rudder-verify/SKILL.md`.

## Goal
Run deterministic machine verification and record exact terminal output as proof.

## Execution Steps
1. **Check Gate**: `implement.md` MUST be `COMPLETED`.
2. **Execute**: Run `npm run typecheck`, `npm run lint`, `npm run build`.
3. **Auto-Fix Loop**: If fails, read errors, auto-fix, retry. Max 3 times.
4. **Record Evidence**: 
   - Passed: Record **EXACT full terminal output** into `verify.md`, status `PASS`.
   - Failed 3 times: Stop, set `verify.md` to `FAIL`.

## 🗣️ Interaction & Output Constraints (STRICT)
- **User Interaction**: If verification fails after 3 retries, the error report and explanation to the user **MUST be in Chinese**.