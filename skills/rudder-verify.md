---
claude:
  description: Run machine verification commands and record exact terminal output as undeniable proof.
  argument-hint: [REQ-ID]
hermes:
  name: rudder-verify
  description: Run machine verification commands and record exact terminal output as undeniable proof.
  triggers:
    - 验证 REQ-
    - 检查代码 REQ-
    - rudder-verify
    - 跑一下验证
    - 机器验证
---

> This is **Phase 4 (Verify)** of the requirement lifecycle, strictly following `.rudder/workflow/lifecycle.md`.

## Goal
Run deterministic machine verification commands and record the exact terminal output as undeniable proof of passing.

<!-- hermes-only:start -->
## Parameter Extraction
Extract the target REQ-ID. If missing, **MUST ask in Chinese**.
<!-- hermes-only:end -->

## Execution Steps
1. **Check Gate**: Confirm `implement.md` status **MUST** be `COMPLETED`. Stop otherwise.
2. **Execute Commands**: Run sequentially in terminal:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
   - `npm run check:skills` (skill single-source drift guard)
   - `npm run check:req` (requirement structure invariants)
3. **Auto-Fix Loop**:
   - If any command fails, **MUST** read terminal errors, auto-fix code, and retry.
   - Maximum 3 retries allowed.
4. **Record Evidence**:
   - If passed within 3 retries: Record the **EXACT full terminal output** into `verify.md`, set status to `PASS`, and sync `README.md` status to `VERIFIED` (derived value, see `.rudder/workflow/states.md`).
   - If failed 3 times: Stop immediately, set `verify.md` status to `FAIL`, and report to user. **NEVER** proceed to Review.

## 🗣️ Interaction & Output Constraints (STRICT)
- **User Interaction**: If verification fails after 3 retries, the error report, analysis, and explanation to the user **MUST be in Chinese**.
