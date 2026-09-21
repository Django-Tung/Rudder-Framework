# 需求导入解析规则（Import Policy）

> 本规则约束 `/rudder-import`（`.claude/commands/rudder-import.md` + `.hermes/skills/rudder-import/SKILL.md`）的行为。

## 1. 定位

`/rudder-import` 是 **pre-lifecycle 工具**，不属于状态机任何阶段：

- 输入：外部需求文档（`.docx` / `.md` / `.txt`）。
- 输出：归一化 Markdown + 导入报告，落在 `requirements/_inbox/`。
- **不创建任何 REQ 目录、不产生任何状态**。收尾时询问是否按 `/rudder-plan` 逐个启动。

## 2. 解析解耦（关键）

- **文档解析由脚本负责**：`node scripts/import-docx.js <file>`，用 `mammoth` 把 `.docx` 转为 Markdown（保留标题、列表层级，忽略图片与复杂排版）。
- **语义分块由 AI 负责**：读取归一化 Markdown，识别"全局规则"与"独立功能点"。
- 禁止 AI 直接读二进制 docx 或自行解析 XML。

## 3. 分块与映射

- **全局规则** → 建议更新 `requirements/MASTER-PRD.md` 的「全局业务规则 / 术语表」。
- **独立功能点** → 建议拆分为 `REQ-XXX-<kebab-name>/plan.md`（经 `/rudder-plan` 澄清后生成）。
- 判定模糊时**必须暂停**，输出结构化澄清问题，**严禁擅自猜测补全**。

## 4. 澄清问题（强制）

- 导入报告 `requirements/_inbox/<name>.import-report.md` 必须包含**非空的「澄清问题清单」章节**。
- 至少 1 条；每条为可回答的封闭式或开放式问题。
- `scripts/check-import.js` 断言该章节存在且条目数 ≥ 1，违反则导入视为未完成。

## 5. 作用域与隔离

- `plan.md` §六.1 的"仅允许读取 MASTER-PRD.md 与当前 REQ 目录"约束，**仅作用于 Plan→Commit 窗口**。
- **导入阶段例外**：须同时读外部待导入文档与 `MASTER-PRD.md` 才能判定全局/局部。

## 6. 输出约定

- 归一化 Markdown：`requirements/_inbox/<name>.md`
- 导入报告：`requirements/_inbox/<name>.import-report.md`
- 扫描 `requirements/` 的脚本必须跳过 `_` 前缀目录。

## 7. 转义说明

`mammoth` 输出的 Markdown 含合法的反斜杠转义（如 `YYYY\-MM\-DD`、`2\.1`），渲染正确，无需还原；AI 分块时忽略之。
