# Rudder OS 新手教程

本教程带你完成一次从安装依赖到启动项目、选择需求入口和验证代码的完整流程。

## 使用路径总览

先判断你手上的输入：

| 输入 | 入口 | 说明 |
|---|---|---|
| 一份完整需求文档 | `/rudder-import` | 只做归一化、粗读和功能点拆分 |
| 一个新想法或单个功能 | `/rudder-plan` | 直接进入详细 PRD 设计 |

两条路径都会在 `plan.md` 批准后进入同一条实施流程：

```text
Plan → Tasks → Implement → Verify → Review → Commit
```

## 1. 准备环境

需要安装：

- Node.js 20.19 或更高版本
- npm（随 Node.js 一起安装）
- Git
- 一个支持本项目 Rudder 技能的 Agent 运行时，例如 Claude Code

检查版本：

```bash
node --version
npm --version
git --version
```

## 2. 获取项目并安装依赖

如果项目还没有下载到本机：

```bash
git clone <项目地址>
cd ProtoSource
```

进入项目目录后安装依赖：

```bash
npm install
```

依赖安装完成后，项目会生成 `node_modules/`。该目录不需要提交到 Git。

## 3. 启动开发服务器

运行：

```bash
npm run dev
```

终端会显示本地访问地址，通常是：

```text
http://localhost:5173
```

修改 `src/` 下的代码后，浏览器会自动刷新。停止服务器可以在终端按 `Ctrl+C`。

## 4. 先跑一遍项目校验

在开始开发前，建议执行：

```bash
npm run typecheck
npm run lint
npm run build
```

这些命令分别检查 TypeScript 类型、代码规范和生产构建。任何命令失败时，先处理报错，再继续工作。

Rudder 规则和需求数据还可以使用以下校验：

```bash
npm run check:req
npm run check:skills
npm run sync:master -- --check
```

需求仓库为空时，`check:req` 也应正常通过；第一次创建需求后，它会开始检查需求目录和状态。

## 5. 创建第一个需求

有两种入口。

### 方式 A：已有文档，先粗拆分

如果你手上有完整需求文档：

```text
/rudder-import 需求文档.docx
```

Import 只生成归一化文档、粗拆分分析和候选 REQ，不做详细 PRD。命令会暂停等待你确认功能点拆分。确认时回复：

```text
拆分批准，创建 REQ 目录
```

REQ 目录创建后，必须对每个 REQ 单独执行 `/rudder-plan`：

```text
/rudder-plan REQ-001
```

此时才补充用户故事、AC、页面结构、UI 三态、数据模型和技术契约。

### 方式 B：直接描述需求

没有完整文档时，在 Agent 对话中输入：

```text
/rudder-plan 做一个供应商列表页面，支持加载、错误和空数据状态
```

Agent 会先提出澄清问题，然后在 `requirements/REQ-XXX-<name>/` 下生成需求计划。检查 `plan.md` 内容无误后，人工回复：

```text
PRD 批准，状态改为 APPROVED
```

## 6. 实施和验证需求

需求计划批准后，按顺序执行：

```text
/rudder-implement REQ-001
/rudder-verify REQ-001
/rudder-review REQ-001
/rudder-commit REQ-001
```

各阶段职责如下：

| 阶段 | 作用 |
| --- | --- |
| Plan | 明确范围、用户场景和验收标准 |
| Tasks | 将验收标准拆成可执行任务 |
| Implement | 按 Types、Mocks、Services、UI 顺序实施 |
| Verify | 运行类型检查、Lint、Build 和规则校验 |
| Review | 对照验收标准进行人工审查 |
| Commit | 提交代码并归档需求证据 |

不要在未批准 PRD 时直接修改 `src/`。如果需求范围发生变化，使用：

```text
/rudder-change REQ-001 增加供应商筛选功能
```

## 7. 常见文件位置

```text
src/                    页面、组件、服务和状态管理
requirements/           REQ 需求文档与验证证据
skills/                 技能源文件，只在这里修改技能
.rudder/                工作流规则、状态定义和模板
scripts/                确定性检查与同步工具
docs/                   教程和框架说明
```

修改 `skills/` 后必须同步运行时投影：

```bash
npm run sync:skills
npm run check:skills
```

## 8. 完成前检查清单

提交前至少确认：

```bash
npm run typecheck
npm run lint
npm run build
npm run check:req
npm run check:skills
npm run sync:master -- --check
```

如果校验全部通过，再进入人工 Review 和 Commit 阶段。
