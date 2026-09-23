# IMP 管道 — 输入与来源追踪

> 本文件回答「**什么样的文档能进来、进来后原件去哪、来源怎么记**」。
> 解析见 [`parsing.md`](parsing.md)，产物约定见 [`normalization.md`](normalization.md)。

## 1. 定位：终止式管道

IMP（Import）是**终止式管道**，不是状态机——**4 个顺序状态、无失败态、无回环**：

```text
imported ──[粗读+拆分]──► analyzed ──[人工确认]──► approved ──[归档]──► archived
```

| 状态 | 达成条件 | 落盘 |
|---|---|---|
| `imported` | `source/` 原件 + `imported.md` + `metadata.yaml` 齐备 | `metadata.yaml.status` |
| `analyzed` | `analysis.md` 已生成，且 `MASTER-PRD.md` 出现对应的 `pending_maps` 条目 | `metadata.yaml.status` |
| `approved` | 人工确认拆分，`pending_maps[i].status` = `APPROVED`，且对应 REQ 目录已产出 | `metadata.yaml.status` |
| `archived` | IMP 目录已移入 `requirements/archive/<YYYY-MM>-IMP-YYYYMMDD-NNN/` | `metadata.yaml.status` |

**状态取值一律小写**（`imported` 而非 `IMPORTED`），与 REQ 侧的大写枚举刻意区分。

### 1.1 无失败态

终止式管道不是状态机。"解析失败"或"拆分不清"的处置是**停在原地并向人工报告**，
**不引入** `ANALYSIS_FAILED` 之类的分支状态。

### 1.2 无 `DECOMPOSED` 态

「分析」与「拆分」是**步骤合并**（一步完成），但**产物仍是两个**：
`analysis.md`（人读）与 `pending_maps`（机器读）。合并的是流程步骤，不是产物。

### 1.3 单向推进

`approved` 的 IMP **不得**回退到 `analyzed` 或 `imported`。如需重新导入，**必须新建 IMP 目录**——
与 REQ 侧「归档即封存」同理，历史证据不可变。

## 2. 输入类型

| 扩展名 | 支持 | 说明 |
|---|---|---|
| `.docx` | ✅ | 经 `scripts/import-docx.js` 用 `mammoth` 转 Markdown |
| `.md` | ✅ | 直接读取 |
| `.txt` | ✅ | 直接读取 |
| `.pdf` | ❌ | **Non-Goal**，见 §5 |
| `.xlsx` / `.xls` | ❌ | **Non-Goal**，见 §5 |

## 3. 来源追踪与原件留痕

每次导入**必须**在 `requirements/IMP-YYYYMMDD-NNN/` 下创建独立目录，结构为：

```text
requirements/IMP-YYYYMMDD-NNN/
├── source/              ← 原始文件，原件留痕，不再改动
├── imported.md          ← 归一化 Markdown
├── metadata.yaml        ← 管道状态与来源元数据
└── analysis.md          ← 语义分析产物（analyzed 状态起存在）
```

- **原件留痕**：原文档**原样复制**到 `source/`，**不做任何转换**。归一化结果另有 `imported.md` 承载。
  这样即使解析脚本升级、归一化结果改变，也能回溯到原始输入。
- **来源可追溯**：`metadata.yaml` 的 `source.type` / `source.filename` 记录来源，
  `id` 供后续 `pending_maps.imp` 与 `AUTO-INDEX` 的「来源」列引用。
- **编号规则**：`IMP-YYYYMMDD-NNN`，`NNN` 为当日序号（从 `001` 起）。

## 4. 作用域例外

[`../workflow/gates.md`](../workflow/gates.md) §4 的「仅允许读取 `MASTER-PRD.md` 与当前 REQ 目录」
约束**只作用于 Plan → Commit 窗口**。**导入阶段例外**：

- 必须读取 `source/` 下的原件与 `imported.md`；
- 必须读取 `requirements/MASTER-PRD.md`，才能判定某段内容是全局规则还是独立功能点。

这两项读取是导入的必要条件，不是越界。

## 5. Non-Goal 声明：不支持的格式

> **本次范围只覆盖 `.docx` / `.md` / `.txt`。PDF 与 xlsx 明确不受支持。**

收到 PDF 或 xlsx 时，Agent **必须**：

1. 明确告知用户该格式**不受支持**；
2. 引用本节声明作为依据；
3. **不得**尝试解析（不得调用 OCR、不得自行解包、不得"尽力而为"地转换）。

该限制写进规格而非省略，是为了避免后续读者把它当作**遗漏**而擅自补齐——
扩展格式支持应当是一次独立的变更，而不是一次顺手实现。

> `docs/v6-uparade.md` §十八 的 `skills/import/` 树里提到了 PDF 与 xlsx。
> 那是探索稿，**本文件为准**。
