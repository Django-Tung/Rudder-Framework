---
id: REQ-XXX
name: [中文需求名称]
status: DRAFT
phase: plan
created: [YYYY-MM-DD]
---

# Requirement: [中文需求名称]

> 本文件是需求的唯一真相源。`implement.md` 依此实施，`verify.md` 依此验证，`review.md` 依此逐条核对。
> 编写要求：所有正文、用户故事、验收标准、界面文案一律使用**简体中文**；代码、类型名、文件路径保持英文。

## 1. 目标 (Goal)

[一句话描述业务目标与它为用户带来的价值。不要写实现方式。]

## 2. 范围 (Scope)

### In Scope（本次要做）
- [ ] 功能点 1
- [ ] 功能点 2

### Non-goals（本次明确不做）
- [ ] 明确排除项 1

> ⚠️ Non-goals 是防范围蔓延的硬边界。`review.md` 的「范围合规」会逐条核对此处。

## 3. 用户故事 (User Stories)

| 编号 | 作为… | 我想要… | 以便于… |
|------|-------|---------|---------|
| US-1 | [角色] | [诉求] | [价值] |
| US-2 | [角色] | [诉求] | [价值] |

## 4. 验收标准 (Acceptance Criteria)

> 采用 BDD（Given / When / Then）格式，每条必须可被明确判定「通过 / 失败」。
> **本节的 AC 编号将直接对应 `review.md`「需求符合度」表格中的行，编号不得随意变更。**

### AC-1: [场景名称]
- **Given** [前置条件 / 初始状态]
- **When** [用户执行的动作]
- **Then** [可观测的预期结果]

### AC-2: [场景名称]
- **Given** [前置条件 / 初始状态]
- **When** [用户执行的动作]
- **Then** [可观测的预期结果]

### AC-3: [异常 / 边界场景]
- **Given** [异常前置条件]
- **When** [触发动作]
- **Then** [预期的降级表现]

## 5. 界面文案 (UI Copy)

> 实施时须**逐字**使用本表文案，不得自行改写或翻译。所有文案为简体中文。

| 位置 | 文案 |
|------|------|
| 页面标题 | |
| 页面副标题 / 说明 | |
| 主按钮 | |
| 次按钮 | |
| 加载中 (Loading) | 加载中… |
| 加载失败 (Error) | 加载失败，请重试 |
| 重试按钮 | 重新加载 |
| 空状态 (Empty) | 暂无数据 |
| 成功提示 (Toast) | 操作成功 |
| 失败提示 (Toast) | 操作失败，请稍后重试 |
| 表单校验提示 | |

## 6. 技术契约 (Technical Contract)

> **Contract-First**：本节先于任何实现落地。类型未定义完，不得开始写 Mock / Service / UI。

### 6.1 类型定义 (Types) → `src/types/`

```typescript
// 在此定义核心 Interface / Type。
// 约束：禁止使用 any；字段可选性需明确标注；枚举用字面量联合类型。
// 导入路径统一用 @ 别名（@/* 映射到 src/*），例如 `import type { X } from '@/types/x';`

export interface Example {
  id: string;
  name: string;
}
```

### 6.2 服务接口 (Services) → `src/services/`

```typescript
// 在此定义 Service 函数签名。
// 约束：一律返回 Promise；实现中必须用 setTimeout 模拟 300-800ms 网络延迟；
//      UI 只能调用 Service，禁止直接 import src/mocks/。

import type { Example } from '@/types/example';

export function fetchExampleList(): Promise<Example[]> {
  throw new Error('未实现');
}
```

### 6.3 状态管理 (State)

- **是否需要全局状态**：[是 / 否]
- **方案**：Zustand（如需全局状态）/ 组件内 `useState`（局部即可）
- **Store 文件**：`src/stores/[name].ts`

## 7. 界面与交互约束 (UI/UX)

- [ ] Loading 状态：骨架屏 / Spinner（文案见第 5 节）
- [ ] Error 状态：错误提示 + 重试入口
- [ ] Empty 状态：空状态提示
- [ ] 响应式布局：Mobile + Desktop
- [ ] 交互元素具备 hover / active 反馈
- [ ] 技术栈限定：Tailwind CSS（禁止自定义 `.css` / 重型 UI 库）

## 8. 开放问题 (Open Questions)

> 尚未确定、需要人工拍板的事项。无则填「无」。

无。

## 9. 人工审批 (Human Approval)

- **状态**: ⏳ DRAFT
- **审批人**:
- **审批意见**:
- **审批日期**:

> 审批通过后，将本文档 frontmatter 的 `status` 由 `DRAFT` 改为 `APPROVED`，方可进入 Implement 阶段。
