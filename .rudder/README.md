# `.rudder/` 规则体系导航

> 本目录是 Rudder 工程规则的**唯一权威所在地**。`AGENTS.md` 的 Core Directives 指向本目录，业务代码与需求产物都受其约束。
> 语言：规则与文档正文用**简体中文**，字段名 / 路径 / 状态值用英文。

## 1. 四层分离

Rudder 的规则分四层，各自回答一个不同的问题，**不重叠**：

| 层 | 位置 | 回答的问题 |
|---|---|---|
| **Rules（宪法）** | `constitution.md` | 什么东西**必须**长什么样（技术栈 / 语言 / 架构 / 反馈闭环） |
| **Workflow（流程）** | `workflow/` | 需求**怎么走**（阶段 / 取值 / 门禁 / 异常流转） |
| **Skills（技能）** | `../skills/` | Agent **怎么执行**某个阶段（命令级操作手册，双 runtime 投影的单一源） |
| **Agent（运行时）** | `agents/` | 每个 runtime **读到什么、边界在哪** |

**依赖方向**：Skills 与 Agents 受 Rules 与 Workflow 约束；Rules 与 Workflow **不引用**任何具体 runtime 的实现细节。

## 2. 目录地图

```text
.rudder/
├── README.md                  ← 你在这里（导航）
├── constitution.md            ← Rules：工程宪法
├── workflow/                  ← Workflow：需求生命周期
│   ├── lifecycle.md           ←   流程起点：阶段与产物总览
│   ├── states.md              ←   取值：所有状态的枚举与推导
│   ├── gates.md               ←   门禁：何时允许进入下一阶段
│   └── transitions.md         ←   流转：异常情况怎么走
├── import/                    ← IMP 文档管道（导入侧）
│   ├── sources.md             ←   输入类型、来源追踪、原件留痕
│   ├── parsing.md             ←   脚本解析 vs AI 语义分块
│   └── normalization.md       ←   归一化产物约定
├── analysis/                  ← IMP 分析侧
│   ├── analysis.md            ←   analysis.md 的粗拆分规格
│   ├── decomposition.md       ←   全局规则 vs 独立功能点的判定
│   └── dependency.md          ←   依赖门禁、懒级联、STALE
├── requirement/               ← REQ 侧
│   ├── structure.md           ←   7 文件结构与 README.md frontmatter schema
│   └── acceptance.md          ←   AC 编号规范
├── implementation/            ← 三阶段产物规格
├── verification/
├── review/
├── agents/                    ← 各 runtime 的读取约定
│   └── claude-code.md
└── templates/                 ← 新文件的初值来源（与 states.md 的重置表同源）
```

## 3. 从哪里开始读

| 你想知道 | 读这个 |
|---|---|
| 一个需求从提出到归档要经过哪些阶段 | [`workflow/lifecycle.md`](workflow/lifecycle.md) |
| 某个文件的 `status` 能取哪些值、顶层状态怎么推导 | [`workflow/states.md`](workflow/states.md) |
| 现在能不能进入下一阶段 | [`workflow/gates.md`](workflow/gates.md) |
| 验证失败 / 审查打回 / 需求变更时怎么办 | [`workflow/transitions.md`](workflow/transitions.md) |
| 代码与技术栈的硬性约束 | [`constitution.md`](constitution.md) |
| 把一份外部文档导入成需求 | [`import/sources.md`](import/sources.md) → [`analysis/decomposition.md`](analysis/decomposition.md) |
| REQ 目录里该有哪些文件 | [`requirement/structure.md`](requirement/structure.md) |
| 换个 runtime 执行会有什么区别 | [`agents/claude-code.md`](agents/claude-code.md) |

## 4. `workflow/` 四个文件的分工

四者**正交**，同一件事只在一处定义、其余处只引用：

- **`lifecycle.md` = 总览**。「有哪些阶段、每个阶段产出哪个文件、谁负责」。不定义取值、不定义门禁。
- **`states.md` = 取值**。所有状态枚举与推导规则。**状态值的唯一定义处**——其他文件只引用，不复述。
- **`transitions.md` = 怎么走**。状态与状态之间的异常路径（失败、打回、变更、回滚、归档）。
- **`gates.md` = 何时允许走**。进入每个阶段的前置条件与阻断行为。

> 规则冲突时：状态取值以 `states.md` 为准，前置条件以 `gates.md` 为准，异常路径以 `transitions.md` 为准。
