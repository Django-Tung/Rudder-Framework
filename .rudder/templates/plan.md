---
id: REQ-XXX
name: [中文需求名称]
status: DRAFT
phase: plan
created: YYYY-MM-DD
---

# 📋 需求规划 (PRD): <需求简短名称>

> ⚠️ **AI 阅读指南**：本文档是后续 Implement/Verify/Review 的唯一事实来源 (Single Source of Truth)。在编码前，必须确保所有带 `[ ]` 的待澄清问题已解决，且所有技术契约已明确。

## 1. 业务背景与目标 (Context & Goals)
- **业务背景**：[简述为什么要做这个功能，解决什么痛点]
- **核心目标**：[用 1-2 句话描述最终交付物的核心价值]
- **非目标 (Non-Goals)**：[明确列出本次需求**绝对不做**的事情，防止 AI 过度设计]

## 2. 用户故事与场景 (User Stories & Scenarios)
- **核心角色**：[如：未登录用户、系统管理员]
- **故事 1**：作为 [角色]，我想要 [执行某操作]，以便于 [达成某目的]。
  - **场景 A (正常流)**：...
  - **场景 B (异常流/边缘情况)**：...

## 3. 验收标准 (BDD Acceptance Criteria)
> 必须使用 Given-When-Then 格式，这是 Verify 阶段自动化测试和 Review 阶段人工核对的唯一基准。

- **AC-1: [功能点名称]**
  - **Given** [前置条件，如：用户处于登录页且网络正常]
  - **When** [用户操作，如：输入正确的邮箱和密码并点击登录]
  - **Then** [预期结果，如：按钮显示 Loading 状态，300ms 后跳转至首页]
- **AC-2: [异常处理名称]**
  - **Given** [前置条件，如：用户处于登录页且后端返回 500 错误]
  - **When** [用户操作，如：点击登录]
  - **Then** [预期结果，如：按钮恢复可用，页面顶部弹出中文错误提示“服务器开小差了，请稍后再试”]

  ## 📐 页面结构与组件骨架 (Page Structure)

  > 说明：定义页面的宏观布局与核心组件层级，作为 Implement 阶段 React 组件拆分与 Tailwind 布局的直接依据。

  ### 1. 整体布局 (Layout)
    - **顶部导航 (Header)**: 包含 Logo、全局搜索框、用户头像下拉菜单。
    - **左侧边栏 (Sidebar)**: 包含一级/二级菜单，支持折叠。
    - **主内容区 (Main Content)**: 占据剩余空间，内部采用卡片式布局。

  ### 2. 核心组件树 (Component Tree)
  - `<DashboardPage>`
    - `<StatsOverview />` (展示 4 个核心指标卡片，Grid 布局)
    - `<RecentActivityTable />` (展示最近操作记录，包含分页器)
    - `<QuickActionsPanel />` (右侧悬浮或底部的快捷操作按钮组)

  ### 3. 关键交互占位 (Interaction Slots)
    - 在 `<StatsOverview />` 的每个卡片右上角，预留 `<TrendIndicator />` 组件位置（用于显示环比上升/下降箭头）。
    - 在 `<RecentActivityTable />` 的表头，预留 `<ColumnFilter />` 组件位置。

## 4. UI/UX 与状态规范 (UI/UX & State Specifications)
> 🚨 **Rudder-OS 强制约束**：AI 必须处理以下所有 UI 状态，且所有面向用户的文案**必须为简体中文**。

- **Loading 状态**：[描述加载时的 UI 表现，如：骨架屏 / 按钮 Spin / 全局遮罩]
- **Empty 状态**：[描述无数据时的 UI 表现及引导文案]
- **Error 状态**：[描述请求失败或表单校验失败时的 UI 表现及中文提示文案]
- **Success/Default 状态**：[描述正常渲染的 UI 布局]
- **响应式要求**：[如：移动端优先，断点设置在 768px]

## 5. 技术契约与数据模型 (Technical Contract & Data Models)
> 🚨 **Rudder-OS 强制约束**：严格遵守技术栈 (React 19 + TS strict + Tailwind v4 + Zustand)。禁止引入未授权的第三方 UI 库。

### 5.1 核心数据结构 (TypeScript Interfaces)
```typescript
// AI 需在此处定义核心 Mock 数据结构，必须使用 strict 模式
export interface IUser {
  id: string;
  email: string;
  // ...
}
```

### 5.2 Mock 服务契约 (Service Contract)
- **延迟模拟**：所有 API 调用必须在 Service 层强制添加 `300ms - 800ms` 的随机延迟 (`setTimeout` 或 `Promise` 包装)。
- **错误注入**：Mock 数据中需包含触发 Error 状态的数据结构或概率。
- **状态管理**：[说明使用 Zustand 还是组件内部 state 管理该模块数据]

## 6. 待澄清问题 (Open Questions)
> AI 在 Plan 阶段必须主动提出至少 1-3 个关键问题。用户回答后，AI 需更新本文档并将状态推进。

- [ ] 问题 1：[例如：忘记密码是跳转新页面还是弹窗？]
- [ ] 问题 2：[例如：邮箱校验需要正则匹配还是仅做非空判断？]

---

## 📝 变更记录 (Change Log)
> ⚠️ 发生需求变更时，必须在此追加记录，并将顶部 `status` 重置为 `DRAFT`，同时级联回滚：`tasks.md → DRAFT`、`implement.md → OUTDATED`、`verify.md → INVALIDATED`、`review.md → INVALIDATED`。

| 日期 | 变更内容简述 | 变更原因/背景 | 影响范围评估 |
| :--- | :--- | :--- | :--- |
| YYYY-MM-DD | 初始创建 | 业务方提出原型需求 | 全新模块 |