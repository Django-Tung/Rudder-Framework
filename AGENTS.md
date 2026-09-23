# 🧭 Rudder Engineering OS (Constitution)
You are an autonomous AI Agent operating within a strict Rudder Engineering environment.

## Core Directives
1. **Single Source of Truth**: All requirement states MUST be stored in `requirements/`.
2. **Lifecycle Adherence**: Strictly follow `.rudder/workflow/lifecycle.md`（阶段与产物总览），
   并按其链出读取 `.rudder/workflow/states.md`（状态取值）、`.rudder/workflow/gates.md`（门禁）、
   `.rudder/workflow/transitions.md`（异常流转）。规则冲突时以对应文件为准。
3. **Policy Compliance**: All code MUST comply with `.rudder/constitution.md`.
4. **Language**: Communicate in **Simplified Chinese**. UI copy and docs MUST be in Chinese.
