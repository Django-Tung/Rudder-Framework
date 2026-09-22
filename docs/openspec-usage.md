# OpenSpec 与 Rudder 的分工

> 本文件回答一个容易混淆的问题：**这个仓库里同时躺着 `openspec/` 和 `requirements/`，
> 一次改动到底该走哪套？**
>
> 一句话：**OpenSpec 管"改框架"，Rudder 的 `requirements/` 管"用框架做需求"。**

## 1. 两套流程各自管什么

| | OpenSpec | Rudder（`requirements/` + `.rudder/` + `skills/`） |
|---|---|---|
| **对象** | Rudder 框架自身 | 用 Rudder 做出的原型需求 |
| **产物落点** | `openspec/changes/<change-id>/` | `requirements/REQ-XXX-*/` |
| **生命周期** | `proposal → specs / design → tasks → 实施 → archive` | `Plan → Implement → Verify → Review → Commit` |
| **驱动命令** | `/opsx:new`、`/opsx:apply`、`/opsx:archive` … | `/rudder-plan`、`/rudder-implement`、`/rudder-verify` … |
| **验收方式** | 变更的 spec 是否被满足 | 需求的 `plan.md` AC 是否被逐条兑现 |
| **归档位置** | `openspec/changes/archive/` | `requirements/archive/<YYYY-MM>-REQ-XXX-<kebab-name>/` |

**Rudder 是产出物，OpenSpec 是改产出物那台机器的方式。** 二者不互相嵌套：
Rudder 的 6 阶段流程里不存在"再走一次 OpenSpec"的环节。

## 2. 判定规则：这次改动走哪套？

按**改动落在哪个目录**判定，不看改动大小：

| 你改的东西 | 走哪套 |
|---|---|
| `.rudder/`（宪法 / 工作流 / 各阶段规格 / 模板） | **OpenSpec** |
| `skills/rudder-*.md`（技能权威源） | **OpenSpec** |
| `scripts/` 下的框架脚本（`sync-*` / `check-*` / `import-docx`） | **OpenSpec** |
| `CLAUDE.md` / `AGENTS.md` / `README.md`（框架级说明） | **OpenSpec** |
| `src/`（页面、组件、服务、mocks、stores） | **Rudder** |
| `requirements/REQ-XXX-*/`（某个需求的产物） | **Rudder** |
| `requirements/MASTER-PRD.md` 的业务规则与术语表 | **Rudder**（索引块由脚本维护，见 §4） |

灰色地带：**框架改动顺手改了业务代码**——拆成两次改动，不要混在一个 change 里。

## 3. 为什么必须分开

- **生命周期不同**：框架整改没有 `verify.md` 的构建证据，也不该被 REQ 的 AC 卡住；
  反过来，一个业务需求也不该出现在 `openspec/changes/` 里。
- **真相源不同**：框架的真相是 `.rudder/` 里的声明式规则；需求的真相是 `plan.md` 的 AC
  与 `MASTER-PRD.md` 的全局规则。混在一起会出现两处都在定义"流程"的情况。
- **可追溯性**：`openspec/changes/` 留下的是"框架为什么长这样"的设计理由；
  `requirements/` 留下的是"这个需求做了什么"。二者的读者不是同一批人。

> 这条边界**刻意不写进 `.rudder/`**（见 `docs/v6-design.md` 决策 7）：
> `.rudder/` 是给 runtime 读的规则，而"用哪套流程改框架"是框架维护者的事，
> 不属于任何 runtime 的执行上下文。

## 4. 两套流程的交界处

有三处会同时被两边碰到，规则如下：

1. **`MASTER-PRD.md`**：它是 Rudder 侧的例外文档（不设 `status` / `phase`），
   但它的索引块由 `scripts/sync-master-prd.js` 确定性维护。改脚本 → 走 OpenSpec；
   改业务规则正文 → 走 Rudder。
2. **`skills/` 单一源**：改技能正文 → 走 OpenSpec；改完**必须**运行
   `npm run sync:skills` 重新生成投影，并让 `npm run check:skills` 退出码为 0。
   投影文件（`.claude/commands/rudder-*.md`、`.hermes/skills/rudder-*/SKILL.md`）**不要手改**。
3. **`.rudder/templates/`**：模板是框架产物（走 OpenSpec），但模板被 Rudder 流程直接使用；
   改模板后要跑 `npm run check:req` 确认没有让既有 REQ 失配。

## 5. 一次框架整改的标准流程

```bash
/opsx:new <change-id>          # 立项，产出 proposal
# 写 design.md 与 specs/，逐条列可判定的 Requirement / Scenario
/opsx:continue                 # 生成 tasks.md（按阶段分组，阶段间严格串行）
/opsx:apply <change-id>        # 按 tasks.md 逐条实施并勾选
/opsx:archive <change-id>      # 验收后归档，specs 并入 openspec/specs/
```

约定：

- **task 的分组顺序即迁移计划阶段顺序**，避免同一批文件被两处改动交叉覆盖。
- **破坏性步骤单独成组**，放在全部前置组验收通过之后（V6 的第 4 组即此）。
- 每个 task 完成后**立即**把 `- [ ]` 改为 `- [x]`，不要攒着一起勾。

## 6. 相关文档

| 文档 | 内容 |
|---|---|
| `AGENTS.md` | 工程宪法（四条 Core Directives） |
| `.rudder/README.md` | 规则体系导航（`.rudder/` 从哪里开始读） |
| `README.md` | Rudder 的完整流程、两条入口、命令速查 |
| `docs/v6-design.md` | V6 整改的最终设计（已落地） |
| `docs/v6-uparade.md` | V6 的探索性整改计划（**历史文档**，含已否决项） |
