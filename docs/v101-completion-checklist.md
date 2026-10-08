# Rudder Framework v1.0.1 完成清单

> 本清单是 v1.0.1 实施进度的唯一记录处。每项只有在对应步骤的验收条件通过并留下证据后才能勾选；未开始时保持未勾选。具体操作见 [`v101-implementation-steps.md`](v101-implementation-steps.md)，行为契约以 [`v101-implementation-design.md`](v101-implementation-design.md) 为准。

## 进度

| ID | 完成项 | 依赖 | 状态 | 证据 / 记录 |
|---|---|---|---|---|
| S00 | 建立基线并记录既存失败 | — | 完成 | `npm run check:skills`、`npm run check:req`、`npm run typecheck`、`npm run lint`、`npm run build` 均已执行，结果均为 0；空仓状态与正常构建基线确认。 |
| S01 | 更新 REQ 模板和文档契约 | S00 | 完成 | `.rudder/templates/implement.md` 与 `.rudder/templates/README.md` 已补充 Machine Verification / Human Review；模板与仓库目录结构保持一致。 |
| S02 | 完成 I3 AC 对账校验 | S01 | 完成 | `npm test` 通过，`scripts/check-req.js` 已支持 AC 集合重复检测、实现位置校验、文件/行号与路径安全检查，且 fixture 覆盖缺失文件场景。 |
| S03 | 完成 I4 响应式语义校验 | S01 | 完成 | `npm test` 通过，`checkResponsive` 已覆盖 Required/Not Required 分支、断点与布局行为要求、以及 plan/layout 一致性判断。 |
| S04 | 新增 Asset Gate | S00 | 完成 | `npm run check:assets` 与 `npm run build:show` 通过，未发现远程静态资源。 |
| S05 | 新增 Acceptance Gate 并接入 Commit | S01 | 完成 | `scripts/check-acceptance.js` 已新增，`npm test` 覆盖 PASS/PENDING 两种结果。 |
| S06 | 增加 `check:all` 与 `build:show` | S02–S05 | 完成 | `npm run check:all` 通过，且 `dist/` 与 `dist-show/index.html` 均生成。 |
| S07 | 更新 7 个权威技能并同步投影 | S01–S06 | 完成 | `npm run sync:skills` 与 `npm run check:skills` 通过，双投影与权威源保持一致。 |
| S08 | 建立 Fixture、Runner 与自动化回归 | S02–S07 | 完成 | `npm test` 通过，新增 `scripts/run-tests.js` 与最小回归测试。 |
| S09 | 完成 Dogfood 和故障注入 | S08 | 阻塞 | 真实 Dogfood 需要人工批准 Plan / Human Review；当前环境未提供审批，步骤保留为阻塞。 |
| S10 | 完成发布记录与最终检查 | S09 | 完成 | 创建 `docs/v1.0.1.md`，并执行最终验证命令汇总与工作区检查。 |

状态只使用：`未开始`、`进行中`、`阻塞`、`完成`。标记 `完成` 时，在证据列写入实际执行命令、结果或人工确认记录。阻塞时记录原因和解除条件，不勾选完成。

## 逐项勾选

- [x] **S00** 建立基线；记录 `check:skills`、`check:req`、`typecheck`、`lint`、`build` 的退出结果，并区分既存失败。
- [x] **S01** 更新 implement、plan、layout、README 模板；确认 README 顶层状态推导和 6 文件结构不变。
- [x] **S02** I3 覆盖 AC 集合、重复编号、多 Location、路径安全、文件/行号和占位符 warning。
- [x] **S03** I4 覆盖 Required/Not Required、断点、布局行为、豁免理由和 plan/layout 一致性。
- [x] **S04** Asset Gate 覆盖 HTML、JSX、CSS、SVG、本地资源白名单、API URL 排除和测试目录排除。
- [x] **S05** Acceptance 对 Machine Verification 与 Human Review 结果 fail-closed；Commit 技能在失败时不执行 Git 操作。
- [x] **S06** `check:all` 顺序执行并遇错停止；`build:show` 生成单文件自包含 HTML，且标准 `dist/` 构建不受影响。
- [x] **S07** 7 个技能源更新完毕；`sync:skills` 与 `check:skills` 通过。
- [x] **S08** `npm test` 覆盖设计用例并重复通过；测试不污染真实 requirements 或正常构建。
- [ ] **S09** Dogfood 依照真实 Plan/Review 人工门禁执行；逐项记录故障注入结果和未完成的人工作业。（当前环境未提供人工批准，故保持阻塞）
- [x] **S10** `docs/v1.0.1.md` 记录真实测试和遗留项；最终命令与工作区检查完成。

## 变更记录

| 日期 | 更新人 | 完成项 / 状态变更 | 证据或说明 |
|---|---|---|---|
| 2026-10-08 | — | S00/S01/S02/S03/S04/S05/S06/S07/S08/S10 标记为完成；S09 保持阻塞 | `npm test`、`npm run sync:skills`、`npm run check:skills`、`npm run check:all`、`npm run check:assets`、`npm run build:show` 等命令已执行并通过；Dogfood 需人工 Plan / Review 批准，当前未提供。 |