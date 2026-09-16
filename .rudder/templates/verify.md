---
id: REQ-XXX
status: PENDING
phase: verify
created: ""
---

# 验证报告: [需求名称]

## 状态 (Status)

PENDING

## 机器验证 (Machine Verification)

### 类型检查 (Typecheck)

- **命令**: `npx tsc --noEmit`
- **结果**: ❌ PENDING
- **输出**:

```text
[粘贴终端输出]
```

### 代码规范 (Lint)

- **命令**: `npm run lint`
- **结果**: ❌ PENDING
- **输出**:

```text
[粘贴终端输出]
```

### 构建检查 (Build)

- **命令**: `npm run build`
- **结果**: ❌ PENDING
- **输出**:

```text
[粘贴终端输出]
```

## 架构检查 (Architecture Checks)

- [ ] UI 组件未直接 import `src/mocks/`
- [ ] Service 层包含网络延迟模拟
- [ ] 无 `any` 类型使用
- [ ] 无遗留的 `console.log` 调试语句

## 范围检查 (Scope Check)

- [ ] 未修改与本需求无关的文件
- [ ] 未引入技术栈之外的依赖

## 修复记录 (Fix Log)

> 如果验证失败后进行了自动修复，在此记录修复轮次。

| 轮次 | 失败项 | 错误信息摘要 | 修复措施 | 修复后结果 |
|------|--------|-------------|---------|-----------|
| 1 | [如 Build] | [错误摘要] | [修复了什么] | ✅ PASS |

## 最终结论 (Final Result)

- **Typecheck**: ❌ PENDING
- **Lint**: ❌ PENDING
- **Build**: ❌ PENDING
- **Architecture**: ❌ PENDING
- **Scope**: ❌ PENDING
- **综合结果**: ❌ PENDING