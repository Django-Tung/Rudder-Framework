# Rudder Framework v1.0.1 具体实施步骤

> 本文是执行 Runbook，不是新的技术规范。机器规则、数据格式和已确认决策以 [`v101-implementation-design.md`](v101-implementation-design.md) 为准；进度与证据只写入 [`v101-completion-checklist.md`](v101-completion-checklist.md)。不要在本文重复维护步骤状态。

## 执行约定

- 按 S00–S10 顺序推进，遵守每项的依赖关系。依赖步骤未完成时，不要开始可能受其接口影响的步骤。
- 每个步骤按“准备 → 修改 → 验证 → 记录”闭环执行。验证失败时留在当前步骤修复，不勾选完成，也不通过跳步规避失败。
- 任何规则或数据格式与设计稿不一致时，先更新设计稿并取得确认，再继续；不要在 Runbook 中另造口径。
- 所有需求状态、人工批准和 Review 结果必须真实。Agent 不得自行把 `APPROVED`、Human Review 或 Acceptance 标为通过。
- 通过步骤后，只更新完成清单中的状态和证据。本文件不再维护第二份完成状态。

## S00 建立基线

**目的**：识别现有失败，避免把改造前的问题算入新变更。

1. 查看 Git 工作区并保留所有现存用户修改；确认准备编辑的文件没有尚未理解的变更。
2. 依次执行以下命令，逐项记录退出码和简要结果：

   ```sh
   npm run check:skills
   npm run check:req
   npm run typecheck
   npm run lint
   npm run build
   ```

3. 失败时保存最小错误摘要并标为“基线既存失败”；不在本步骤顺手修复无关问题。
4. 在完成清单 S00 证据列记录日期、命令结果和既存失败。

**通过条件**：五条命令均有结果记录；有失败时明确区分其为既存问题。

## S01 更新模板和文档契约

**目的**：先固定后续脚本和技能共同使用的数据格式。

1. 更新 `.rudder/templates/implement.md`：保留 AC 核对表结构；示例允许逗号分隔多个 `path:line`；增加 Machine Verification 清单及 `PENDING/PASS/FAIL` 结果。
2. 更新 `.rudder/templates/README.md`：增加初始未勾选、`Result: PENDING` 的 Human Review 区块；不得把 Acceptance 再保存成第三个状态。
3. 更新 `.rudder/templates/plan.md`、`.rudder/templates/layout.md`：保留现有「响应式要求」和「响应式行为」字段，提供符合 I4 的示例；Not Required 必须有理由。
4. 对照 `.rudder/requirement/structure.md` 与 `.rudder/workflow/`，仅在契约确实变化时更新规则；保持 REQ 6 文件、顶层状态推导不变，状态枚举仍以 `states.md` 为唯一事实源。
5. 清除实施示例中的 `src/styles/Foo.css`，因为它违反“仅 `src/index.css` 可为 CSS 文件”的宪法约束。
6. 搜索模板和规则中的重复/冲突说明；每条规则只在所属权威文件定义，其余位置引用。

**验证**：逐字段对照设计稿第 5 节；检查新建 REQ 仍有且仅有 6 个核心文档；搜索确认无自定义 CSS 路径被当作合法示例。

**通过条件**：模板能表达 I3 多位置、机器结果和人工 Review；状态机及目录结构无变化；检查结果写入清单 S01。

## S02 实现 I3 AC 对账

**目的**：让每个 plan AC 都能被追溯到真实文件和有效行号。

1. 在 `scripts/check-req.js` 内保留 plan AC 的原始声明列表，同时构建去重集合；重复 AC 声明必须报错，避免 Set 静默掩盖重复项。
2. 调整核对表解析，使其能保留重复行并报告同一 AC 重复，而不是由 Map 覆盖前一行。
3. 对每个实现位置按逗号拆分并独立校验：严格格式、相对路径、路径归属 `src/` 或 `public/`、真实路径未通过 symlink 越界、文件存在、行号在物理行范围内。
4. 汇总 plan AC 与表格 AC 的集合差异：缺失、多余、重复分别输出可定位诊断。允许不同 AC 指向同一位置。
5. 检查行内容中的纯占位符；依照设计稿给 warning，不把它误报为 ESLint 已阻断，也不提升为 I3 error。
6. 将校验逻辑暴露为可由临时 root 调用的函数；命令行不带参数时仍检查当前仓库。

**验证**：先跑 I3 fixture，至少覆盖单位置、多位置、缺失文件、非法/越界路径、行号越界、占位 warning、重复 AC、AC 缺失/多余和不同 AC 共用位置通过；再执行：

```sh
npm run check:req
```

**通过条件**：坏例子按规则失败、合法例子通过；原 I1/I2、顶层状态、依赖图、STALE 检查无回归；记录失败数/通过数及命令结果。

## S03 实现 I4 响应式决策校验

**目的**：确保响应式口径明确且 plan 与 layout 一致。

1. 保留现有字段锚点与中文格式，不引入新的英文字段。
2. 明确区分 `需要`、`不需要` 和无法识别的决策；缺字段或不明确决策要报告字段级错误。
3. Required 分支检查具体断点单位、布局动作词和最小描述长度；plan 与 layout 各自满足要求，并且口径一致。
4. Not Required 分支检查 plan 理由长度；layout 使用既有无响应式要求约定。
5. 黑名单词只用于拒绝空话，不得在描述已包含断点与行为时仅因出现黑名单词而误判。
6. 保持代码分支诊断可读，不把所有失败收敛成一个无解释的大正则。

**验证**：运行 I4 fixtures：Required 有效、缺断点、缺行为、纯空话、Not Required 有理由、理由缺失/过短、plan/layout 冲突；随后执行 `npm run check:req`。

**通过条件**：各用例符合设计稿判定，诊断指出具体文件字段；将结果记入 S03。

## S04 新增 Asset Gate

**目的**：在离线演示边界拦截静态外链资源。

1. 新增 `scripts/check-assets.js`，默认扫描仓库 root，并允许测试注入临时 root。
2. 递归扫描设计稿列明的源码、静态目录和 `index.html`；明确排除构建目录、依赖目录、测试 fixtures 和二进制文件。
3. 只在 HTML/JSX 资源属性、CSS/SVG 资源语法等资源上下文识别 URL；不要把 API 请求 URL 或普通字符串误报为静态资源。
4. 拦截 HTTP、HTTPS 和协议相对外链；放行相对、本地根路径、`data:`、`blob:`。复杂动态资源按设计输出 warning，不声称已静态证明安全。
5. 诊断输出相对文件路径、行号和规则；URL 查询参数须脱敏。

**验证**：执行各 Asset fixture，覆盖本地图、data URI、外链图片、CSS、CDN script、font/media、srcset、SVG、协议相对 URL、普通 API URL 与忽略目录；再执行：

```sh
node scripts/check-assets.js
```

**通过条件**：所有 fixture 符合预期，真实源码扫描没有未处置外链；结果写入 S04。

## S05 新增 Acceptance Gate 并接入 Commit

**目的**：让机器验证与人工 Review 同时通过才允许 Commit。

1. 新增 `scripts/check-acceptance.js <REQ目录>`；只读取目标 REQ 的 `implement.md` 和 `README.md`。
2. 精确定位唯一的 Machine Verification 与 Human Review 区块；缺失、重复标题、缺失/重复 Result、非法状态值均失败关闭。
3. 仅当两个 Result 都严格为 PASS 时打印 `ACCEPTED` 并返回 0；其他情况打印 `NOT ACCEPTED` 与失败原因并返回非零。
4. 确认脚本不写文件、不修改顶层 status、不替用户勾选 Review。
5. 更新 `skills/rudder-commit.md`：原 plan/tasks/implement 三项状态门禁通过后再检查 Acceptance；Acceptance 失败必须停止，不能执行 `git add`、`git commit` 或归档。

**验证**：Acceptance fixture 覆盖两项 PASS、Machine FAIL、Review PENDING/FAIL、区块缺失/重复、非法值；检查执行前后文件内容一致。Commit 技能文案逐项确认失败路径先于 Git 操作。

**通过条件**：所有非双 PASS 状态都 fail-closed；脚本只读；Commit 操作受门禁约束；记录 S05 证据。

## S06 接入 `check:all` 与 `build:show`

**目的**：提供统一机器验证命令及可直接打开的演示 HTML。

1. 新增独立 `vite.show.config.ts`，复用现有 Vite 配置，在展示构建中启用经确认的单文件插件；将插件登记为 `devDependency`，确认 `src/` 不 import 它。
2. 独立指定相对 base 和 `dist-show` 输出目录，避免覆盖标准 `dist/`。配置应将应用脚本、样式和可打包媒体全部内联。
3. 在 `package.json` 增加：

   ```json
   "build:show": "vite build --config vite.show.config.ts"
   ```

4. 新增 `scripts/check-all.js`，按序执行 `check:skills`、`check:req`、`check:assets`、`lint`、`build`、`build:show`；一项失败即终止并返回非零，完整成功时输出每项 PASS 摘要。
5. 在 `package.json` 注册 `check:assets` 与 `check:all`。Acceptance 仍是按单个 REQ 执行的 Commit 门禁，不加入全仓总检查。
6. 若页面引用 `public/` 中未内联的文件，单文件验收必须失败；把引用改为构建器可处理/内联的资源，或调整产品资产策略。不能仅因 JS/CSS 已内联就声称整个页面自包含。

**验证**：

```sh
npm run build
npm run build:show
npm run check:all
```

确认标准产物仍位于 `dist/`；展示产物为 `dist-show/index.html` 且不依赖旁边资源。检查 HTML 没有外部静态脚本、样式和媒体引用；使用浏览器以 `file://` 打开实际产物，检查首屏、交互和控制台资源错误。对总 runner 注入一个失败阶段，确认后续阶段没有启动。

**通过条件**：两种构建输出隔离；展示 HTML 独立打开成功；总检查摘要和首错退出符合预期；记录 S06 证据。

## S07 更新技能并同步投影

**目的**：让 Agent 执行流程与新增规则一致。

1. 只改 `skills/` 下 7 个技能权威源，不直接编辑 `.claude/` 或 `.hermes/` 投影。
2. Plan 与 Plan Confirm 强制唯一 AC 编号和 I4 合规字段。
3. Implement 填完整 I3 Location，运行 `check:all`；成功才更新机器结果；随后生成 README Human Review 草稿并暂停等待用户，不替用户判 PASS。
4. Adjust / Change 在有效代码或契约变更后失效机器结果和 Review；契约变更仍执行原有状态机、代码冻结与下游 stale 流程。
5. Commit 保留原阶段门禁，在所有检查后执行 Acceptance，再决定是否进行 Git 操作。
6. Import 新建 REQ 时使用更新模板，不自行标记机器或人审通过。
7. 执行 `npm run sync:skills`，再执行 `npm run check:skills`。

**通过条件**：7 个权威源职责覆盖完整；同步和漂移检查通过；投影无手工修订；记录 S07 证据。

## S08 建立测试 Fixture 与 Runner

**目的**：让规则可重复回归，且测试不污染真实仓库。

1. 新增设计稿要求的 I3、I4、Asset、Acceptance fixtures；失败样本保留外链等负例内容。
2. 通过可注入 root 在操作系统临时目录构造最小 REQ 和静态资源树；不得将 fixtures 放进真实 requirements 或被正常 Asset 扫描。
3. 使用 Node 内置 `node:assert/strict`；测试完成后通过 `finally` 清理临时目录。
4. 新增 `scripts/run-tests.js`，在 `package.json` 注册 `npm test`。
5. 加入 `check-all` 首错终止行为测试与展示构建输出的静态检查；实际 `file://` 浏览器验证仍须保留为运行步骤，不以字符串测试替代。

**验证**：执行 `npm test` 两次；再执行 `npm run check:req` 和 `node scripts/check-assets.js`，确认 fixtures 和临时目录不会影响真实扫描。

**通过条件**：自动化用例重复运行稳定、无外网依赖、临时目录清理；覆盖列表与设计稿一致；记录 S08。

## S09 Dogfood 与故障注入

**目的**：在真实 REQ 流程中确认各门禁能按预期阻断。

1. 先确认人工已批准 Dogfood REQ 的 Plan；若未批准，停止在此门，不得伪造 `APPROVED` 或直接实施。
2. 按项目正常流程完成 Tasks、Implement 和 `check:all`，填写 Machine Verification；生成 Review 草稿后等待人工检查。
3. 人工 Review 通过后，才更新 Review 结果并运行 Acceptance；提交和归档继续遵循 Commit 技能。
4. 逐项做故障注入：删除 AC、Location 指向不存在文件、行号超界、加入 CDN script、纯 TODO 行、Human Review 改回 PENDING 后尝试 Acceptance。
5. 对每项记录注入方式、实际命令、预期与实际结果。TODO 按规则只产生 warning；若另有 lint error，必须分开归因。
6. 每次注入后以可审阅的逆向修改恢复；不使用破坏性 Git 命令。若人工 Review 或 PRD 批准不可获得，将该环节标为阻塞，不宣称 Dogfood 完成。

**通过条件**：所有自动门禁负例得到预期结果；人类审批/Review 真实完成或明确记录为阻塞；Dogfood 证据写入完成清单及发布记录。

## S10 发布记录与最终检查

**目的**：汇总可复现结果和仍未完成的人工事项。

1. 新增 `docs/v1.0.1.md`，只记录实际实施范围、文件、测试结果、故障注入结果、未完成项和人工 Review 状态，不预写成功结论。
2. 依次执行最终验证：

   ```sh
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

3. 确认同步命令无意外技能漂移；`dist/` 与 `dist-show/` 均符合各自产物契约；REQ 目录仍为 6 个核心文档；无未经人工确认的 PASS/APPROVED。
4. 发布/Release 只在维护者确认发布机制和版本号后操作；本步骤不自行创建 Git commit 或 release。
5. 将最终命令和证据写入完成清单 S10，并将所有尚未完成人工环节如实保留为阻塞/未完成。

**通过条件**：所有可运行的验证结果明确；发布记录真实完整；工作区中没有被误标完成的条目。

## 规则映射

| 实施步骤 | 设计稿权威章节 |
|---|---|
| S01 模板与文档契约 | 第 2、3、4 节 |
| S02 I3 | 第 5.1 节 |
| S03 I4 | 第 5.2 节 |
| S04 Asset Gate | 第 5.3 节 |
| S05 Acceptance | 第 5.4、5.5 节 |
| S06 总检查与展示构建 | 第 4、6 步及第 7 节完成定义 |
| S07 技能同步 | 第 4、6.7 节 |
| S08 测试 | 第 6.8 节 |
| S09 Dogfood | 第 6.9 节 |
| S10 发布记录 | 第 6.10 节及第 7 节 |