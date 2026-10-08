# Rudder Framework v1.0.1 实施步骤与分步设计

> 本文是 [`v101-revised.md`](v101-revised.md) 的实施设计稿，细化文件职责、数据格式、校验规则、测试策略和交付顺序。实施时以本文已确认的决策为准；未明确的范围不得由执行者自行扩展。

## 1. 目标与边界

本次改造的目标是让 AC 与实现位置可机器对账、让响应式决策可判定、拦截静态外链资源，并在 Commit 前增加人机验收门禁。继续遵守以下既有约束：

- REQ 目录仍为 6 个文档；不新建 `verify.md` 或 `review.md`。
- 顶层 `README.md.status` 仍只由 `plan.md`、`implement.md`、`commit.md` 推导；Acceptance 不增加或改变 REQ 状态枚举。
- 不新增运行时依赖；Node 脚本和测试 runner 使用 Node 内置模块。为单文件展示构建新增的工具只能是 `devDependency`，且不得被 `src/` 导入。
- 仅修改 `.rudder/` 规则、模板与权威 `skills/` 源；`.claude/`、`.hermes/` 投影由 `npm run sync:skills` 生成。
- 继续执行 `typecheck`、`lint`、`build`、`check:skills`、`check:req` 的 Implement 质量门禁，并把 Asset Gate 纳入 `check:all`。

## 2. 已确认的设计决策

| 主题 | 决策 | 影响 |
|---|---|---|
| Machine Verification 结果 | 机器检查清单、结果与命令证据放在 `implement.md`；不在 README 再维护一份机器结果 | `check-acceptance.js` 同时读取 `implement.md` 与 `README.md`，避免双写状态 |
| Human Review | Checklist 与 Result 放在 `README.md`，初始为未勾选和 `PENDING` | Review 是人工确认；脚本不得替用户打勾 |
| Acceptance | 由脚本读取 Machine Verification 与 Human Review 的结果后即时推导，不持久化第三份状态 | 不在 README 增设手工维护的 Acceptance Result；成功打印 `ACCEPTED`，否则打印 `NOT ACCEPTED` |
| 技能职责 | 复用现有 7 个技能；Implement 承担机器验证和 Review 交接，Commit 执行 Acceptance 门禁 | 不新增独立 Verify / Review 技能 |
| 响应式格式 | 保留现有 plan 的「响应式要求」及 layout 的「响应式行为」字段 | 扩展现有字段校验，不引入 `Responsive: Required` 英文格式 |
| AC 共用位置 | 不同 AC 可以指向相同的代码位置 | 只拒绝重复 AC 声明、核对表重复 AC 行、缺失或多余 AC；不以路径行重复作为错误 |
| 测试入口 | 校验逻辑支持注入临时仓库根目录 | Fixture 在临时目录中组成 REQ，不改动真实 `requirements/` |
| `build:show` 产物 | 构建一个可通过 `file://` 打开的自包含 HTML，输出到 `dist-show/index.html` | 使用独立 Vite 配置和构建期单文件插件；不改变标准 `build` 的 `dist/` 输出 |

## 3. 发现的问题与修订

以下内容在原清单直接实施会与现有工程约定冲突或造成不确定结果，本文按上表决策修订：

1. 原清单把 Machine Verification 放在 README，而现有 README 是 REQ 元数据和顶层派生状态载体，机器检查证据已经在 `implement.md`。机器结果只保留在 `implement.md`；README 只增加 Human Review。Acceptance 由脚本派生，不再复制落盘。
2. 原清单的 `src/styles/Foo.css` 示例违反宪法：`src/index.css` 以外不允许自定义 CSS 文件。实现位置示例统一使用 `.ts` / `.tsx` / `.js` / `.jsx`，或合法的 `src/index.css` 行。
3. 原清单称更新 7 个 Skills，但不存在独立 Verify / Review skill。沿用 `rudder-implement` 负责 Verify 与 Review 交接，`rudder-commit` 负责 Acceptance；修改权威源后同步投影。
4. 原清单的 `duplicate-ac` 用例把「不同 AC 指向同一位置」判为失败，与共用 UI 组件的实现模式冲突。用例改为同一个 AC 出现两次时失败；不同 AC 共用位置通过。
5. 原清单提到依赖 ESLint `no-warning-comments` 拦截 TODO，但当前 `eslint.config.js` 未启用该规则。因此 I3 占位检查是 `WARN` 级独立诊断，不假定 ESLint 已覆盖，也不作为初始阶段的失败条件。
6. 原清单提出 check-all 阶段摘要，但单纯使用 `&&` 链无法可靠输出统一的逐阶段摘要。使用零依赖 Node runner 顺序执行命令、成功后打印 `[PASS]`，首次失败即停止并返回非零。
7. 仅设置 Vite `base: './'` 不足以保证 HTML 可双击运行：默认产物仍通过外部 ES module 文件加载，浏览器的 `file://` 安全策略可能阻止模块加载。因此展示构建采用单文件内联，并以真实 `file://` 打开验证，不把相对路径目录误称为独立可运行 HTML。

## 4. 文件变更地图

| 文件/目录 | 设计职责 |
|---|---|
| `.rudder/templates/implement.md` | I3 多位置格式、机器验证清单/结果、占位符警告呈现方式 |
| `.rudder/templates/plan.md` | 保留现有响应式字段；写明 Required 的断点/行为或 Not Required 的理由 |
| `.rudder/templates/layout.md` | 保留现有响应式行为字段；与 plan 决策一致 |
| `.rudder/templates/README.md` | 新增 Human Review 区块及初始状态 |
| `scripts/check-req.js` | 强化 I3 和 I4；支持临时 root 测试；不更改 REQ 顶层状态机和依赖图语义 |
| `scripts/check-assets.js` | 零依赖静态资源外链扫描 |
| `scripts/check-acceptance.js` | 读取 implement 与 README 的门禁结果，输出 Acceptance 决定 |
| `scripts/check-all.js` | 总入口，按固定顺序运行 machine checks 并输出结果摘要 |
| `vite.show.config.ts` | 展示版单文件构建配置；复用基础插件配置，独立指定单文件插件、相对 base 与 `dist-show` 输出目录 |
| `package.json` | 注册 `check:assets`、`check:acceptance`（如需）、`check:all` 与 `build:show` |
| `devDependencies` | 增加 Vite 单文件构建插件；仅构建期使用，不进入运行时依赖或 `src/` |
| `skills/rudder-plan.md` | 生成精确、可判定的 AC 和响应式字段 |
| `skills/rudder-implement.md` | 填写 I3 表、跑 `check:all`、记录结果、交接 Human Review 并暂停 |
| `skills/rudder-commit.md` | 保留现有三项状态检查，并增加 Machine Verification、Human Review、Acceptance 检查 |
| `skills/rudder-adjust.md`、`skills/rudder-change.md` | 发生有效变更时失效机器结果与人工 Review；契约变更继续遵守现有状态回滚协议 |
| `skills/rudder-plan-confirm.md`、`skills/rudder-import.md` | 确保 Plan/Import 生成的 REQ 使用已更新模板和响应式口径 |
| `tests/`、`scripts/run-tests.js` | 临时 fixture、断言 runner 和回归测试 |
| `docs/v1.0.1.md` | 实施记录、测试结果、Dogfood 与故障注入结果；实施完成后填写 |

> 预计修改 7 个技能源；提交前执行 `npm run sync:skills` 和 `npm run check:skills`。不得直接编辑技能投影。

## 5. 数据契约

### 5.1 I3 核对表

`implement.md` 使用现有 `## AC 实现核对表 (AC Traceability)`，表格列维持 `AC | 实现位置 | 核对结论`。实现位置支持一个或多个以逗号分隔的 `path:line`：

```markdown
| AC | 实现位置（文件:行） | 核对结论 |
|---|---|---|
| AC-1 | `src/pages/Foo.tsx:42` | ☐ |
| AC-2 | `src/pages/Foo.tsx:42, src/components/Bar.tsx:15` | ☐ |
```

规则：

- 每个 plan AC 在表中恰好出现一行；AC 编号集合完全相等，不缺失、不多余、不重复。
- 表格行以 AC 编号为键；同一个 AC 的重复行失败。plan 中重复声明相同 AC 编号也失败。不同 AC 共用同一 `path:line` 合法。
- 每个 Location 单独按逗号拆分、去除两侧空格后解析。必须严格匹配 `相对路径:正整数行号`；不接受空项、绝对路径、Windows 盘符路径或 URL。
- 路径规范化后必须仍在仓库 `src/` 或 `public/` 下，拒绝 `..` 越界段；文件必须存在且为普通文件。应校验真实路径，避免仓库内符号链接指向允许目录之外。
- 文件行数按文本物理行计算，结尾换行不产生一个可引用的额外行。要求行号从 1 开始且不大于实际行数。
- 格式、路径、文件、行号、AC 集合任一失败均产生 I3 error，并令 `check:req` 非零退出。
- Location 对应行仅有 `TODO` / `TBD` / `FIXME` / `placeholder` / `待实现` 等占位文本且没有业务代码时，输出 I3 warning；初期不阻断完成状态。

测试入口应将 `checkArtifacts` / I3 校验做成可测试的内部函数或注入 root 的执行函数。CLI 默认 root 仍由脚本位置推导；测试可以传入临时 root。不要因测试引入三方解析器。

### 5.2 I4 响应式决策

决策源是 `plan.md` 的 `- **响应式要求**：`，允许值继续以 `需要` 或 `不需要` 开头。`layout.md` 的 `- 响应式行为：` 是对应布局说明，不能与 plan 决策矛盾。

- **需要**：plan 的响应式描述与 layout 的响应式行为都必须有至少一个具体断点（数字 + `px` / `rem` / `em`）和至少一个动作（例如隐藏、收进/展开、重排、折叠、横向滚动、stack/column/grid/flex）。去掉空白后的描述须超过 10 个字符。
- **不需要**：plan 必须写出可理解的理由，非空且长度超过 5 个字符；仅写“不需要”失败。layout 继续用模板约定的「本 REQ 无响应式要求」表达，不要求在那里重复理由。
- 黑名单语句（如「自适应」「响应式良好」「支持多端」）本身不构成有效断点或动作。描述同时含黑名单和有效信息时，不因出现黑名单词而误报。
- I4 仍只对齐 plan/layout，不负责验证浏览器实际断点行为；该行为由 Human Review 检查。

实现时先提取 plan 的决策前缀，再校验相应条件；不得用一个无法解释的整体正则吞掉字段缺失、决策冲突、理由缺失等不同错误。诊断应指出文件、字段和缺少的具体内容。

### 5.3 Asset Gate

扫描根固定为仓库 root，纳入：`src/**/*.{ts,tsx,js,jsx,css,scss,less}`、`public/` 中可读的文本资源，以及 `index.html`。忽略 `node_modules`、`.git`、`dist`、`build`、`coverage`、测试夹具目录和二进制文件。测试目录排除是必要的，因为负例 fixture 会故意含外链。

资源引用检测范围：

- HTML / JSX 的 `script[src]`、stylesheet `link[href]`、`img[src/srcset]`、`source[src/srcset]`、`video[poster]`、audio/video/source 的 `src`。
- CSS 的 `url(...)`、`@import`，以及字体、背景、音视频资源 URL。
- SVG 的 `href` / `xlink:href` 等外部资源引用。
- HTTP、HTTPS 和协议相对 URL `//host/...` 都是远程资源，命中即 FAIL。允许 `./`、`../`、`/`、`data:`、`blob:`。
- 普通 API 请求地址不属于资源引用；扫描器只检查资源上下文，不能将任意字符串常量中的 URL 判为违规。
- 无法静态确定的动态表达式不应伪称通过。若检测到资源属性由复杂表达式构造，至少输出 WARN 并在 Asset 测试中覆盖约定的静态范围；本版本不做 JS AST 解析。

每个命中输出相对路径、行号、规则类型和脱敏后的 URL 主机/片段，不打印可能包含令牌的完整 query。发现一项即失败，汇总后以非零退出。

### 5.4 Machine Verification、Human Review 与 Acceptance

`implement.md` 增加 Machine Verification 清单及 `Result: PENDING/PASS/FAIL`。清单覆盖 I1、I2、I3、I4、Assets、Lint、Build；具体命令证据仍记录在现有 Machine Checks 区块。只有 `check:all` 成功，实施技能才将清单勾选并把 Result 更新为 PASS；检查失败则保持未勾选并记录失败，不得写 PASS。

`README.md` 模板增加 Human Review 区块：

```markdown
## Human Review

- [ ] User Flow
- [ ] UX
- [ ] Visual
- [ ] Business
- [ ] Demo

**Result**: PENDING
```

Implement 完成且 Machine Verification 为 PASS 后，Agent 填好 Review 草稿并暂停等待用户审阅。用户明确回复通过后才把项目勾为 `[x]` 并设 `Result: PASS`；要求修改则设为 `FAIL`，重新实施后重新验证和 Review。

`check-acceptance.js <REQ目录>` 同时解析 `implement.md` 的 Machine Verification Result 和 `README.md` 的 Human Review Result：两者严格为 PASS 才输出 `ACCEPTED` 并退出 0；缺区块、重复区块、非法值、PENDING 或 FAIL 均输出 `NOT ACCEPTED` 并退出非零。脚本只读，不改需求文件，不改顶层 `status`。

### 5.5 修改后的失效

- `/rudder-adjust` 对代码产生实质修改时：Machine Verification 重置为未勾选/`PENDING`，Human Review 重置为未勾选/`PENDING`；原有状态要求 implement 回到 `IN_PROGRESS`，重新执行检查与人工 Review。
- `/rudder-change` 修改契约时：继续由现有 transitions 协议执行 Plan 降级、Tasks 重置、Implement 置 `OUTDATED`、下游 `STALE` 传播；同时失效 Machine Verification 和 Human Review。
- 单纯文档格式化且没有改变实现、验收结论或契约时，不自动失效。实施技能须先判定变更性质并记录理由，不得仅因修改 README 的普通说明字段而重置门禁。

## 6. 分步实施顺序

每一步先完成列出的改动，再运行该步验证；失败时先修当前步骤，不能以最后一次全量检查代替中间验证。

### 第 0 步：建立基线

读取当前工作区状态，确认没有覆盖用户变更；运行 `npm run check:skills`、`npm run check:req`、`npm run typecheck`、`npm run lint`、`npm run build` 并记录基线结果。基线失败先记为既存问题，不在本改造中顺手扩大修复范围。

验收：基线命令及退出码进入临时实施记录；任何失败都明确标为 pre-existing。

### 第 1 步：模板与文档契约

修改 `.rudder/templates/implement.md`、`plan.md`、`layout.md`、`README.md`。实施表显示多 Location 格式；机器验证区块放 implement；Human Review 区块放 README；I4 示例沿用现有中文字段并提供有效/无效例子。修复 `src/styles/Foo.css` 示例。

同步核对 `.rudder/requirement/structure.md`、`.rudder/workflow/lifecycle.md`、`gates.md`、`transitions.md` 与 `constitution.md`：只在确需改变契约时更新，并保持「状态取值唯一定义在 states.md」及各规则文件分层，不把同一状态机重复定义多份。若结构文档明确接受新 README 区块，不需要修改 README frontmatter schema。

验证：人工逐项对照模板与第 5 节格式；搜索确认 `src/styles/*.css` 不再作为合规示例。此时不要求整体构建，因为尚未改代码。

### 第 2 步：强化 I3

在 `scripts/check-req.js` 中将 AC 声明提取结果改为保留原始序列及去重集合，报告 plan 重复 AC；将核对表解析从覆盖式 `Map` 改为能发现重复行的结构；每个实现位置拆为 Location 并逐个做语法、安全、文件与行号校验；占位行只给 warning。

保持现有 I1/I2、README 顶层状态推导、依赖图、STALE 检查不变。引入 root 参数/可测试入口但保持无参数命令行为不变。

验证：先运行 I3 单元与 fixture 用例，包括正常单位置、多位置、丢失文件、非法/越界路径、行号越界、占位 warning、重复 AC 行/声明、plan 缺失 AC、表格多余 AC，以及两个不同 AC 共用同一位置通过。再运行 `npm run check:req`。

### 第 3 步：强化 I4

替换现有只检查模糊词和口径一致性的弱校验，按第 5.2 节分支验证。保留现有 plan/layout 锚点；错误信息区分缺字段、未知决策、无断点、无布局动作、描述太短、Not Required 理由缺失、plan/layout 决策冲突。

验证：执行 Required 有效、缺断点、缺动作、含空话但无具体信息、Not Required 有理由、无理由/过短、layout 与 plan 不一致等用例；再运行 `npm run check:req`。

### 第 4 步：新增 Asset Gate

新增 `scripts/check-assets.js`。用 `node:fs`、`node:path` 递归遍历指定扫描根，集中实现忽略目录、文本文件判定、资源上下文匹配、白名单判断与诊断格式。提供可注入 root 的函数供临时夹具测试，默认扫描仓库 root。

验证：本地引用和 data URI 通过；外链图片、CSS url、HTML CDN script、font/media、srcset、SVG 外链及协议相对 URL 失败；API URL 字符串通过；测试夹具本身不会被扫描。执行 `node scripts/check-assets.js`。

### 第 5 步：Acceptance Gate

新增 `scripts/check-acceptance.js`，参数为 REQ 目录；校验两个 Result 唯一且为 PASS 后才接受。解析以明确标题 `## Machine Verification`（implement）和 `## Human Review`（README）为边界；标题缺失、重复或 Result 值不在 `PENDING/PASS/FAIL` 时 fail closed。

在 `skills/rudder-commit.md` 中先跑原有阶段状态门禁，再调用 Acceptance 脚本；未接受时逐项报告机器结果、Review 结果及退出，不得执行 `git add`、`git commit` 或归档。

验证：Acceptance 两 PASS 接受；Machine FAIL、Review PENDING/FAIL、任一缺 section、非法值、重复 section 均拒绝；对 fixture 运行并确认脚本不会写回文件。

### 第 6 步：总验证入口与 npm scripts

新增 `vite.show.config.ts`，使用项目现有 Vite 配置并只为展示构建增加单文件插件，设置相对 base、单文件 CSS/JS 内联和独立输出目录 `dist-show`。插件登记为 `devDependency`，不得从 `src/` 引用。新增 `build:show` script：

```json
"build:show": "vite build --config vite.show.config.ts"
```

展示构建的交付契约：成功后产物为 `dist-show/index.html`，通过浏览器打开本地文件可运行，不依赖本地 HTTP 服务或同目录资源文件；标准 `npm run build` 仍输出原有 `dist/`，两种产物互不覆盖。构建必须内联所有被应用引用的脚本、样式和静态媒体；`public/` 文件默认可能被 Vite 原样复制，若页面引用它们而插件没有内联，则展示构建校验失败，须将资源改为可由构建器处理/内联的引用，不能把非自包含结果标成成功。外部 API 请求不属于静态资源，不要求内联。

新增零依赖 `scripts/check-all.js`，按顺序运行 `npm run check:skills`、`npm run check:req`、`npm run check:assets`、`npm run lint`、`npm run build`、`npm run build:show`。使用同步子进程，每一步输出简短阶段标签；失败后打印 `[FAIL] <stage>` 和退出码，立即终止并返回非零；全部成功后逐项输出 `[PASS]`，其中展示构建单列为 `[PASS] Show Build`。命令顺序固定，避免 Promise 并行导致失败后仍继续。

`package.json` 新增 `check:assets`、`check:all` 和 `build:show`。Acceptance 不纳入全仓 `check:all`，因为它是单个 REQ 的 Commit 门禁，不是实现质量检查。`check:all` 成功不会自动改需求文件；由 Implement 技能根据实际退出结果更新 `implement.md`，保持脚本只验证、技能负责文档流转。

验证：分别执行 `npm run build` 和 `npm run build:show`，确认产物分别位于 `dist/` 与 `dist-show/index.html`。检查 `dist-show` 只包含预期 HTML，且 HTML 无外部脚本、样式表或媒体资源引用；从 `file://` 打开实际 HTML，确认页面渲染、交互可用、浏览器控制台无资源加载错误。再验证 `npm run check:all` 全绿时有完整 PASS 摘要；使用可控失败子命令或注入 runner 测试验证首个失败会终止且后续步骤不运行。

### 第 7 步：技能同步

修改 7 个 `skills/rudder-*.md` 权威源：

- `rudder-plan` / `rudder-plan-confirm`：AC 编号不重复；Responsive Decision 使用既有字段并满足 I4；确认阶段检查可判定性。
- `rudder-implement`：按多位置格式填写每个 AC；完成后运行 `npm run check:all`；检查成功更新 implement Machine Verification；生成 README Human Review 草稿并暂停；不得替用户 Review。
- `rudder-adjust` / `rudder-change`：按第 5.5 节失效对应结果；需求契约变化遵循原状态机和代码冻结约束。
- `rudder-commit`：保持 plan/tasks/implement 状态检查，追加 Acceptance 命令；只有脚本输出接受且退出 0 才能提交。
- `rudder-import`：新建 REQ 使用更新模板；导入分析不自动标记机器或人工门禁通过。

验证：`npm run sync:skills` 后运行 `npm run check:skills`；审阅生成的双投影仅由脚本更新，不手改。

### 第 8 步：测试夹具和 runner

新增 `tests/check-req/i3/`、`tests/check-req/i4/`、`tests/check-assets/`、`tests/acceptance/`。每个用例标记预期 exit/result 和原因。runner 以 `node:assert/strict` 组织测试，在 OS 临时目录构造最小 REQ/源码树，通过注入 root 调用校验逻辑；`finally` 清理临时目录。不得将 fixture 复制进真实 `requirements/`，不得让坏例子被正常 `check:all` 当作源码扫描。

新增 `scripts/run-tests.js`（或按现有导出方式直接调用测试入口），`npm test` 绑定该 runner。测试至少覆盖第 2 至第 6 步列出的所有分支，确保测试不依赖联网、当前需求目录内容或执行顺序。

验证：`npm test` 连续运行两次均通过；临时文件清理后，真实 `npm run check:req` 和 `npm run check:assets` 结果不受测试污染。

### 第 9 步：Dogfood 与故障注入

只有机制和回归测试通过后，才创建 `REQ-999-v101-dogfood`，完整走 Plan → Implement → Machine Verification → Human Review → Acceptance → Commit。项目尚未由人工确认/批准 Plan 时，不得伪造批准状态或直接进入代码实施。

逐项故障注入并记录实际命令和结果：

1. 删除 plan 中一个 AC：I3 缺失/集合不等失败。
2. 改成不存在文件：I3 文件存在性失败。
3. 行号改为超限值：I3 行号失败。
4. index.html 增加 CDN 脚本：Asset Gate 失败。
5. 仅保留 TODO 占位实现：产生 I3 warning；按已确认口径本身不阻断。若另有 lint error，应独立记录，不能冒称 I3 fail。
6. Human Review 改回 PENDING 后运行 Acceptance：返回 `NOT ACCEPTED`，Commit 技能不得执行 git 操作。

每次注入后恢复到干净状态须以可审阅的反向修改完成，不使用破坏性 Git 命令；记录失败被拦截的证据。若当前环境没有人工 Review/PRD 批准，Dogfood 的相应步骤标记为待人工完成，不得自行声明通过。

### 第 10 步：发布记录

新增 `docs/v1.0.1.md`，记录目标和最终范围、设计偏差、修改文件、测试命令/结果、故障注入结果、未完成项与人工 Review 状态。版本发布/Release 只有在维护者确认仓库发布机制及版本号后执行；本实施设计不假设存在自动发布脚本。

最终验证顺序：

```text
npm test
npm run sync:skills
npm run check:skills
npm run check:req
npm run check:assets
npm run typecheck
npm run lint
npm run build
npm run build:show
npm run check:all
```

最后检查工作区差异，确认无投影漂移、无新增运行时依赖、展示构建插件仅在 `devDependencies`、REQ 仍为 6 文档、未写入未经人工确认的 PASS / APPROVED。

## 7. 完成定义

- I3 能拒绝所有 AC 集合、格式、路径、文件和行号错误；支持逗号分隔多个位置，并允许多个 AC 共用位置。
- I4 能对 Required/Not Required 做结构化校验，并与 layout 保持一致。
- Asset Gate 在规则定义的扫描范围拦截外链资源，同时放行本地/data/blob 资源和普通 API 请求。
- `npm run build:show` 生成可直接通过 `file://` 打开的自包含 `dist-show/index.html`；不影响标准 `dist/` 构建，且无外部静态资源依赖。
- Acceptance 只读取 implement/README，失败关闭，不修改顶层状态；Commit 技能在门禁失败时不触碰 Git。
- `npm test`、`npm run check:all` 和现有质量命令均通过；技能投影与权威源一致。
- Human Review 未经用户明确确认不得 PASS；Dogfood 未完成的部分如实标记，不得用脚本绿灯替代业务验收。
- `docs/v1.0.1.md` 记录真实结果和遗留项。

## 8. 仍需在实施时核实的技术边界

以下不是待用户决策项，执行第 4 步时用 fixture 验证后在 `docs/v1.0.1.md` 记录实际覆盖范围：

- 文本扫描器不是完整 HTML/CSS/JS 解析器；新增资源语法须配套用例。复杂动态资源表达式按 WARN 处理，除非后续明确提升为阻断规则。
- Symlink 目标验证必须使用真实路径；若跨平台 Node 对路径分隔符行为不同，fixture 至少覆盖当前 macOS，并用 path API 保持 Windows 路径拒绝逻辑可测。
- `check-acceptance.js` 的标题解析必须限定到目标 section，不能误读同名正文或其他 REQ 文件。
- I3 行号引用的是提交时文件内容；代码变动后必须由 Implement 重新生成 Location 并重新执行机器验证。