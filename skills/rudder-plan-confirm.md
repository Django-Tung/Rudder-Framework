---
claude:
  description: Confirm an ambiguous PRD approval and promote plan.md after all clarifications are complete.
  argument-hint: [REQ-ID]
hermes:
  name: rudder-plan-confirm
  description: Confirm an ambiguous PRD approval and promote plan.md after all clarifications are complete.
  triggers:
    - 确认 PRD
    - 批准 PRD
    - rudder-plan-confirm
    - 确认需求方案
---

> 这是 Plan 阶段的确认命令，规则见 `.rudder/workflow/lifecycle.md`、`.rudder/workflow/gates.md`。

## 目标

承接 `/rudder-plan` 生成的 `DRAFT` 计划及配套 `layout.md`，完成最后的人工 Review 与明确批准。调用本命令本身不代表批准；只有所有重大澄清问题已解决且用户明确批准，才允许将 `plan.md` 置为 `APPROVED`。

<!-- hermes-only:start -->
## 参数提取

从用户输入中提取目标 REQ-ID。缺少时必须用中文询问，不得猜测。
<!-- hermes-only:end -->

## 执行步骤

1. 读取目标 REQ 的 `README.md`、`plan.md`、`layout.md`、`MASTER-PRD.md` 及依赖方的 `plan.md`。
2. 向用户简要汇总 `plan.md` 的范围、验收标准和技术契约，并展示 `layout.md` 的页面布局图，便于 Review。
3. 检查 `layout.md` 是否存在且与 `plan.md` 中确认的页面结构一致；同时检查所有重大澄清问题、UI 主风格、范围、依赖和边界是否都已由用户确认。
4. 如果仍有未确认项，逐项列出并向用户提问；保持 `plan.md = DRAFT`、`README.md = PLANNED`，不得批准。若回答会改变计划或页面布局，先回到 `/rudder-plan` 同步更新 `plan.md` 与 `layout.md`，再重新确认。
5. 如果所有事项已明确，但用户尚未明确批准，提示用户回复：**PRD 批准，状态改为 APPROVED**。保持 `plan.md = DRAFT` 并等待用户确认；不得把命令调用或沉默视为批准。
6. 只有收到用户明确批准后，才将 `plan.md` 设置为 `APPROVED`，同步 `README.md = PLANNED`，运行 `npm run check:req`。检查失败时报告错误并停止，不得提示开始实施。
7. 检查通过后提示用户执行 `/rudder-implement REQ-XXX`。

## 约束

- 不修改 `src/`。
- 不得自行推断或补全业务规则。
- `plan.md = APPROVED` 只能由用户明确批准触发。
- 所有交互与报告必须使用简体中文。
