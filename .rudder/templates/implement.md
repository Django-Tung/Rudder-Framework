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

## AC 实现核对表 (AC Traceability)

> **I1/I2 查的是文档之间的引用完整性，不是代码与需求的一致性**——
> 它们无法阻止「任务全勾、AC 全覆盖、检查全绿，但页面不满足 AC」。
> 本表是最后一环对账凭据。
>
> **分工**：**AI 填「实现位置」**（填不出来即代表未实现）；**「核对结论」留空，由用户对照浏览器确认后勾选**。
> 行数必须与 `plan.md` 的 AC 条数一致——`npm run check:req` 的 **I3** 会断言。

| AC | 实现位置（文件:行） | 核对结论 |
|---|---|---|
| AC-1 [功能点名称] | `src/pages/xxx.tsx:00` | ☐ |
| AC-2 [功能点名称] | `src/pages/xxx.tsx:00` | ☐ |

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
- [ ] 所有 Mocks 已创建（含网络延迟，且内容符合 `MASTER-PRD.md` 的假数据基线）
- [ ] 所有 Services 已实现
- [ ] 所有 UI 组件已完成（Loading/Error/Empty 复用 `@/components` 通用组件）
- [ ] 所有颜色取自设计令牌，无硬编码色值
- [ ] 无外链资源（断网可演示）
- [ ] 所有界面文案为简体中文
- [ ] AC 实现核对表已填满实现位置
- [ ] 已产出演示动线（见下方「演示动线」）
- [ ] typecheck、lint、build、check:skills、check:req 全部通过

## 演示动线 (Demo Script)

> 面向**会议室投屏演示**。AI 生成（掌握完整页面结构，能挑出最有说服力的路径），
> 用户照着走即可，不需要临场想「先点哪里」。

- **开场页**：[哪个页面，为什么选它]
- **路径**：
  1. 点击「[按钮/位置]」→ [结果]，说明：[一句话]
  2. ...
- **收尾画面**：[回到哪个页面结束]
- **兜底**：[某交互没生效时跳到哪个页面继续]

> 提醒用户：加载等待与错误提示是**模拟网络行为**，用于展示加载与异常处理设计。