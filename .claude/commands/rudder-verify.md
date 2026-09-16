---
description: 运行 typecheck / lint / build 三项机器验证并记录证据；失败自动修复，最多 3 轮
argument-hint: [REQ-ID]
---

# Command: rudder-verify

> ⚠️ **双份维护**：本文件与 `.hermes/skills/rudder-verify/SKILL.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。

## Goal
Generate machine-verified evidence for the implementation. This is the core Rudder feedback loop.

## Execution Steps
1. **Lock Context**: Identify the target `REQ-XXX`. Ensure `implement.md` status is `COMPLETED`.
2. **Execute Checks**: Run the following commands in the terminal sequentially:
   - `npm run typecheck` (or `npx tsc --noEmit`)
   - `npm run lint`
   - `npm run build`
3. **Mandatory Feedback Loop**: 
   - If ANY command fails, you MUST read the terminal error, **auto-fix the code**, and re-run the checks. 
   - Repeat this loop until ALL checks pass with 0 errors.
   - **Escape Hatch（最多 3 轮）**: 若连续 3 轮仍然失败，**立即停止**，将 `verify.md` frontmatter `status` 置为 `FAIL`，记录 3 轮的失败命令、错误摘要与已尝试的修复措施，并向人工报告。
4. **Log Evidence**: Create or update `verify.md`. Log the exact commands run and their successful outputs.
5. **Set Status**: Change `verify.md` frontmatter `status` to `PASS`. 
   - ⚠️ 仅当三项检查**全部 0 错误**时才可置为 `PASS`；否则按第 3 步置为 `FAIL`，**不得进入 review 阶段**。
6. **Report**: "✅ 验证通过。所有构建和 Lint 检查均已通过，机器证据已记录在 verify.md。请下达 review 指令。"

## Arguments
$ARGUMENTS (The REQ-ID)