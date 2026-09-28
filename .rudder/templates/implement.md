---
id: REQ-XXX
status: PENDING
phase: implement
created: ""
---

# 实施记录: [需求名称]

## 状态 (Status)
PENDING

## 变更摘要 (Changes Summary)

### 类型定义 (Types)
- [ ] 新增/修改: `src/types/xxx.ts`
  - 描述: [添加了什么类型]

### Mock 数据 (Mocks)
- [ ] 新增/修改: `src/mocks/xxx.ts`
  - 描述: [生成了什么假数据，延迟多少 ms]

### 服务层 (Services)
- [ ] 新增/修改: `src/services/xxx.ts`
  - 描述: [实现了什么接口，是否模拟了网络延迟]

### UI 组件 (Components)
- [ ] 新增/修改: `src/components/xxx.tsx` 或 `src/pages/xxx.tsx`
  - 描述: [实现了什么界面，处理了哪些状态]

## 变更文件清单 (Files Changed)
| 文件路径 | 操作 | 说明 |
|---------|------|------|
| `src/types/xxx.ts` | 新增 | [说明] |
| `src/services/xxx.ts` | 新增 | [说明] |
| `src/pages/xxx.tsx` | 新增 | [说明] |

## 实施偏差 (Deviations)
> 如果实施过程中发现 plan.md 中的设计有问题，或者做了计划外的调整，在此记录原因。

无。

## 机器检查证据 (Machine Checks)

按顺序记录以下命令的完整终端输出：

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run check:skills`
- `npm run check:req`

所有命令通过后，`implement.md` 才能设置为 `COMPLETED`。

## 修复记录 (Fix Log)

| 轮次 | 失败命令 | 错误摘要 | 修复措施 | 结果 |
|---|---|---|---|---|
| 1 | [命令] | [摘要] | [措施] | [结果] |

## 遇到的问题与解决方案 (Issues & Resolutions)
| 问题 | 原因 | 解决方案 |
|------|------|---------|
| [问题描述] | [原因分析] | [如何解决] |

## 完成确认
- [ ] 所有 Types 已定义
- [ ] 所有 Mocks 已创建（含网络延迟）
- [ ] 所有 Services 已实现
- [ ] 所有 UI 组件已完成（含 Loading/Error/Empty 状态）
- [ ] 所有界面文案为简体中文
- [ ] typecheck、lint、build、check:skills、check:req 全部通过