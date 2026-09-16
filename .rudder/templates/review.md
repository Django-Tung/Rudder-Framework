---
id: REQ-XXX
status: PENDING
phase: review
created: ""
---

# 审查报告: [需求名称]

## 状态 (Status)
PENDING

## 需求符合度 (Requirement Compliance)
> 逐条对照 plan.md 中的验收标准 (AC)。

| AC 编号 | 场景描述 | 是否实现 | 备注 |
|---------|---------|---------|------|
| 场景 1 | [描述] | ❌ PENDING | |
| 场景 2 | [描述] | ❌ PENDING | |

## 架构合规 (Architecture)
- [ ] 依赖方向正确: Component → Hook → Service → Mock
- [ ] 类型定义完整，无 `any`
- [ ] 状态管理合理（Zustand / Context）

## 范围合规 (Scope)
- [ ] 仅实现了 In Scope 的功能
- [ ] 未触碰 Non-goals 中的内容
- [ ] 未修改其他 REQ 的代码

## 代码质量 (Code Quality)
- [ ] 无未使用的 import
- [ ] 无调试用 `console.log`
- [ ] 无注释掉的死代码
- [ ] 组件拆分合理，单文件未过度膨胀

## 界面质量 (UI/UX)
- [ ] 所有用户可见文案为简体中文
- [ ] Loading 状态已处理（骨架屏/Spinner）
- [ ] Error 状态已处理（错误提示 + 重试）
- [ ] Empty 状态已处理（空状态提示）
- [ ] 交互元素有 hover/active 反馈
- [ ] 响应式布局（Mobile + Desktop）

## 发现的问题 (Findings)
> 如果有任何不符合预期的地方，在此列出。

无。

## 人工审批 (Human Review)
- **状态**: ⏳ PENDING_HUMAN_REVIEW
- **审批人**: 
- **审批意见**: 
- **审批日期**: 