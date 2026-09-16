---
name: rudder-verify
description: Use this skill to run machine checks (typecheck, lint, build). Crucially, it enforces a self-correcting feedback loop to fix errors automatically before logging PASS to verify.md.
---

# Skill: rudder-verify

> ⚠️ **双份维护**：本文件与 `.claude/commands/rudder-verify.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Execution Steps
1. **Lock Context**: Ensure target `REQ-XXX` has `implement.md` status as `COMPLETED`.
2. **Execute Checks**: Run `npm run typecheck`, `npm run lint`, and `npm run build`.
3. **Mandatory Feedback Loop**: 
   - If ANY fails, read the terminal error, **auto-fix the code**, and re-run. 
   - Repeat until ALL pass with 0 errors.
   - **Escape Hatch（最多 3 轮）**: 若连续 3 轮仍然失败，**立即停止**，将 `verify.md` frontmatter `status` 置为 `FAIL`，记录 3 轮的失败命令、错误摘要与已尝试的修复措施，并向人工报告。
4. **Log Evidence**: Update `verify.md` with the exact commands and successful outputs.
5. **Set Status**: Set `verify.md` frontmatter `status: PASS`. 
   - ⚠️ 仅当三项检查**全部 0 错误**时才可置为 `PASS`；否则按第 3 步置为 `FAIL`，**不得进入 review 阶段**。
6. **Report**: Confirm verification passed and evidence is logged. Ask for the review command.