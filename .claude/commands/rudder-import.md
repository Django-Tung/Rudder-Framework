---
description: 导入外部需求文档（.docx/.md/.txt），转为归一化 Markdown 并智能拆分
argument-hint: [文档路径]
---

# Command: rudder-import

> ⚠️ **双份维护**：本文件与 `.hermes/skills/rudder-import/SKILL.md` 内容等价（面向不同 runtime）。修改任一份时必须同步另一份。
>
> 本命令是 **pre-lifecycle 工具**，不属于状态机（规则见 `.rudder/policies/import.md`）。

## Goal
Import an external requirement document, normalize it to Markdown, and split it into global rules vs. independent features.

## Execution Steps
1. **Convert**: 运行 `node scripts/import-docx.js $ARGUMENTS`。脚本用 `mammoth` 将 `.docx` 转为 Markdown（`.md`/`.txt` 直接读取），输出到 `requirements/_inbox/<name>.md`。
2. **Read**: 读取归一化 Markdown。
3. **Classify**: 识别「全局规则」与「独立功能点」：
   - 全局规则 → 建议更新 `requirements/MASTER-PRD.md` 的「全局业务规则 / 术语表」。
   - 独立功能点 → 建议拆分为 `REQ-XXX-<kebab-name>/plan.md`（经 `/rudder-plan` 澄清后生成）。
4. **Write Report**: 生成 `requirements/_inbox/<name>.import-report.md`，**必须包含非空的「澄清问题清单」章节**（至少 1 条）。需求模糊时**严禁擅自猜测补全**。
5. **Verify**: 运行 `node scripts/check-import.js <报告路径>`，退出码必须为 0。
6. **Report**: 输出拆分建议与澄清问题，询问是否按 `/rudder-plan` 逐个启动。

## Arguments
$ARGUMENTS (The path to the external requirement document)
