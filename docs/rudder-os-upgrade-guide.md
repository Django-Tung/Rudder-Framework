# Rudder Framework 架构升级与工程化优化实施指南（修订版 v2.0）

> **⚠️ 历史文档，不再更新。** 本文记录的是上一轮（V2.0）的整改内容，
> 其中对 `.rudder/lifecycle.md` 的引用已在 V6 整改中失效——
> 该文件已拆分至 `.rudder/workflow/{lifecycle,states,gates,transitions}.md`。
> 规则现状以 `.rudder/README.md` 导航为准；V6 的设计与落地见 `docs/v6-design.md`。

**文档版本**：v2.0（取代 v1.1）
**修订日期**：2026-09-21
**修订方**：系统架构规划组
**执行方**：工程落地团队 / AI Agent 执行环境
**目标项目**：`Rudder Framework`（前端原型自动化开发框架）

> 本版在 v1.1 基础上，经可执行性审计与规划组批复，消解了 3 处内部矛盾与 2 处 schema 缺失，并将 **S0 技术验证结论（mammoth 保真度 100%）** 固化入文。§二 的 6 项决策已获批，是本次实施的唯一权威依据。

---

## 一、 背景与核心目标

当前 Rudder Framework 处于初始化阶段。为满足"将需求文档高效转化为高质量原型"的核心诉求，对现有架构升级：

1. **结构化降维**：从单一文档升级为"总纲 + 模块化子需求"架构，优化 AI 上下文处理效率。
2. **多格式导入支持**：实现需求文档智能导入解析，**重点支持 Word (.docx)**，减少人工拆解成本。
3. **进度可追溯**：引入细粒度任务清单与归档机制，确保 AI 执行过程透明、可控。

---

## 二、 已批准的 6 项决策（D1–D6）

以下决策已由系统架构规划组于 2026-09-21 批复，本版直接采用，不再讨论：

| # | 决策 | 结论 |
|---|------|------|
| D1 | Archive 定位 | **Commit 的后置动作**，生命周期保持 6 阶段，不新增 `archive.md`（Git 提交即归档记录） |
| D2 | 依赖豁免 | **按依赖类型豁免**：`scripts/` 下 Node 工具脚本可用 `devDependencies`，前提是不被 `src/` import |
| D3 | import 定位 | **pre-lifecycle 工具**，不纳入状态机（产出归一化文本属"事实"而非"状态"） |
| D4 | 归档命名 | `archive/<YYYY-MM>-REQ-XXX-<kebab-name>/` |
| D5 | tasks.md 门控 | **纳入门控**，Commit 前置扩为 5 项；用 I1/I2 两个可机器判定的不变量替代"实时勾选"承诺 |
| D6 | 二进制 fixture | **接受入库**，用 `zip` 手工构造最小 `.docx` 支撑 AC 可复测 |

---

## 三、 目标目录结构规范

执行方需将 `requirements/` 目录重构为以下标准结构。任何偏离此结构的生成行为均视为违规。

```text
project-root/
├── requirements/
│   ├── MASTER-PRD.md              # [总纲] 全局业务规则、术语表、需求状态索引表（脚本独占维护索引块）
│   ├── REQ-XXX-<kebab-name>/      # [子需求工作区] 按需求原子化隔离
│   │   ├── plan.md                # 需求规划（用户故事、BDD 验收标准、UI 契约、对总纲的增量声明）
│   │   ├── tasks.md               # [新增] 细粒度执行任务清单（Checkbox 格式，可机器校验）
│   │   ├── implement.md           # 代码实施记录与文件变更摘要
│   │   ├── verify.md              # 机器验证证据
│   │   ├── review.md              # 代码审查记录
│   │   └── commit.md              # 归档提交记录（含 archived / archived_at / archive_path）
│   ├── _inbox/                    # [新增] 导入中间产物（归一化 Markdown + 导入报告），脚本扫描时跳过 `_` 前缀
│   └── archive/                   # [新增] 已完成需求归档目录（格式：<YYYY-MM>-REQ-XXX-<kebab-name>/）
├── .rudder/
│   ├── lifecycle.md               # 状态机（6 阶段 + 归档后置动作）
│   ├── policies/
│   │   ├── core.md                # 核心工程规范（含依赖豁免条款）
│   │   └── import.md              # [新增] 多格式需求导入解析规则
│   └── templates/                 # 6 个模板（新增 tasks.md）
└── scripts/
    ├── sync-master-prd.js         # [新增] 确定性索引同步脚本（零依赖、幂等、支持 --check）
    ├── check-tasks.js             # [新增] tasks.md 不变量校验（I1 / I2）
    ├── check-import.js            # [新增] 导入报告结构校验
    └── import-docx.js             # [新增] docx/md/txt → Markdown 转换器（mammoth，devDependency）
```

---

## 四、 状态机（6 阶段 + 归档后置动作）

权威定义在 `.rudder/lifecycle.md`。要点：

- **6 阶段**：`Plan → Tasks → Implement → Verify → Review → Commit`。
- `Tasks` 阶段由 `/rudder-implement` 的**起始步骤**执行（按 `plan.md` 拆解 `tasks.md`），不设独立命令。
- **Archive 是 Commit 的后置动作**（`commit.md = DONE` 后触发 `git mv` + 索引同步），不是阶段。
- **Commit 前置扩为 5 项**：`plan=APPROVED ∧ tasks=DONE ∧ implement=COMPLETED ∧ verify=PASS ∧ review=APPROVED`。

---

## 五、 实施任务（Action Items）

### ✅ S0 — Word 解析技术验证（已完成，无框架改动）

- mammoth 1.12.3 已作为 `devDependency` 安装；`src/` 无引用；`dist/` 产物无 mammoth。
- fixture `requirements/_inbox/fixtures/sample.docx`（3010 字节，源件留 `_build/` 可审计）。
- 探针 `scripts/spike/s0-mammoth-probe.mjs` 实测：标题 H1/H2/H3 保留率 100%，有序/无序列表保留率 100%，退出码 0。
- **结论：正案可行，不启用降级方案。** 详细证据见 §八。

### 🔴 P0 — 基础架构与模板

1. 新增 `requirements/MASTER-PRD.md` 总纲与需求索引（含脚本独占维护块）。
2. 新增 `.rudder/templates/tasks.md` 模板，并引入 I1/I2 两个可机器判定的不变量。
3. 更新 `.rudder/lifecycle.md` 为 6 阶段 + 归档后置动作。

### 🟡 P1 — 多格式需求导入与解析引擎

1. 新增 `/rudder-import` 指令（Claude 命令 + Hermes 技能，双份等价）。
2. `scripts/import-docx.js` 用 `mammoth` 提取 Word 纯文本与基础层级（标题、列表），忽略复杂排版与图片，转为 Markdown。
3. 智能分块与澄清机制：识别"全局规则"与"独立功能点"，映射到 `MASTER-PRD.md` 与新 `REQ-XXX/plan.md`；需求模糊时输出结构化澄清问题，**严禁擅自猜测补全**。

### 🟢 P2 — 工程化兜底与归档自动化

1. `scripts/sync-master-prd.js`：读取所有 `REQ-XXX` 的产物状态，**确定性**更新 `MASTER-PRD.md` 索引表，避免 AI 直接编辑大文件导致格式错乱。
2. Archive 动作：`commit.md = DONE` 后触发 `git mv` 归档 + 索引同步，保持工作区整洁。

---

## 六、 AI 行为约束规范（Prompt 策略）

1. **单一职责与上下文隔离**：处理 `REQ-XXX` 的 **Plan→Commit 窗口**内，仅允许读取 `MASTER-PRD.md` 和当前 `REQ-XXX` 目录。**`/rudder-import` 阶段除外**（须同时读外部文档与总纲才能判定全局/局部）。严禁跨需求修改代码或文档。
2. **证据优于承诺**：AI 不得口头宣称"任务已完成"。`tasks.md` 的 I1/I2 校验、`verify.md` 中的构建日志，是推进到下一阶段的凭证。
3. **增量声明原则**：`plan.md` 涉及全局规则变更时，以"增量声明"形式标注（如 `> 需同步更新 MASTER-PRD.md 的全局技术契约`），由归档脚本统一处理，**禁止 AI 直接覆写 `MASTER-PRD.md` 的索引块外内容**。
4. **防幻觉与死循环控制**：`Verify` 阶段自动化校验连续失败 3 次，AI 必须停止自动修复，标记 `FAIL` 并上报人工。

---

## 七、 验收标准（Definition of Done，可判定版）

| 编号 | 验收标准 | 判定方式 |
|------|---------|---------|
| AC-1 | 结构合规：`requirements/MASTER-PRD.md` 存在；`.rudder/templates/` 含 6 个模板 | 文件存在性检查 |
| AC-2 | Word 导入保真：fixture `.docx` 经 `import-docx.js` 转换，H1-H3 保留率 100%、列表保留率 ≥90% | `node scripts/spike/s0-mammoth-probe.mjs` 退出码 0 |
| AC-3 | 进度可信：不存在「`implement.md`=COMPLETED 但 `tasks.md` 仍有未勾选项」，且每条 AC 被任务覆盖 | `npm run check:tasks` 退出码 0 |
| AC-4 | 索引一致：索引表状态与映射表一致，归档项路径指向 `archive/` | `node scripts/sync-master-prd.js --check` 退出码 0 |
| AC-5 | 编号不复用：归档后新建需求的编号大于所有已归档编号 | 编号扫描范围为 `REQ-*/` ∪ `archive/*/` 并集 |
| AC-6 | 双份维护一致：`.claude/commands/` 与 `.hermes/skills/` 成对等价 | 逐对 diff |
| AC-7 | 规则无分叉：全仓 grep 旧表述（"5 个产物""四项前置""5 个模板"）无残留 | grep 结果为空 |
| AC-8 | 依赖豁免可验证：`mammoth` 在 `devDependencies`，`src/` 与 `dist/` 均无引用 | 三条 grep/检查 |
| AC-9 | 门控真实生效：构造「implement=COMPLETED 但 tasks 有未勾选项」，`/rudder-commit` 必须 STOP | 手动构造负例验证 |

---

## 八、 附：S0 验证证据（2026-09-21）

| 项 | 结果 |
|----|------|
| 探针脚本 | `scripts/spike/s0-mammoth-probe.mjs` |
| fixture | `requirements/_inbox/fixtures/sample.docx`（3010 字节，源件见 `_build/`） |
| mammoth 版本 | 1.12.3 |
| 标题 H1/H2/H3 保留率 | 100% / 100% / 100% |
| 列表 无序/有序 保留率 | 100% / 100% |
| mammoth 警告 | 无 |
| 退出码 | 0（正案通过，不启用降级方案） |
| 转换输出存档 | `requirements/_inbox/fixtures/sample.mammoth.md` |

---

**附注**：本次将"文档解析"与"AI 生成"解耦——Node.js 脚本负责将 Word 干净地转为 Markdown，再喂给 AI 做语义分块，这是保证解析成功率的最佳实践。
