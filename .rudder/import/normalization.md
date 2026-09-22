# IMP 管道 — 归一化产物约定

> 本文件回答「**导入后落哪些文件、每个文件长什么样、`_inbox/` 还剩什么、归档去哪**」。
> 输入与来源见 [`sources.md`](sources.md)，解析见 [`parsing.md`](parsing.md)。

## 1. 产物清单

每个 IMP 目录 `requirements/IMP-YYYYMMDD-NNN/` 含：

| 文件 / 目录 | 产生时机 | 性质 |
|---|---|---|
| `source/` | `imported` | 原件留痕，**只读** |
| `imported.md` | `imported` | 归一化 Markdown，由脚本产出 |
| `metadata.yaml` | `imported` | 管道状态与来源元数据 |
| `analysis.md` | `analyzed` | 语义分析产物，规格见 [`../analysis/analysis.md`](../analysis/analysis.md) |

> 「拆分」不单独落文件——结果写入 `MASTER-PRD.md` 的 `pending_maps` 字段。
> 其中 `analysis.md` 人读、`pending_maps` 机器读，二者同时产生（步骤合并、产物两个）。

## 2. `metadata.yaml` 字段规格

字段**必须**齐全，缺一即被 `scripts/check-import.js` 断言失败：

```yaml
id: IMP-20260922-001
source:
  type: docx                        # docx | md | txt
  filename: 需求说明书.docx          # 原文件名（不含路径）
created_at: 2026-09-22
status: imported                    # imported | analyzed | approved | archived
content:
  format: markdown                  # 归一化后的格式，目前恒为 markdown
  path: imported.md                 # 相对 IMP 目录的归一化产物路径
```

- `status` 取值**只允许** 4 个小写值，且**单向推进**（见 [`sources.md`](sources.md) §1.3）。
- `content.path` 用**相对 IMP 目录**的路径，避免归档移动后失效。

## 3. `_` 前缀跳过规则

扫描 `requirements/` 的脚本（`sync-master-prd.js`、`check-req.js`）**必须跳过**所有 `_` 前缀目录。

原因为 `requirements/_inbox/` 仍然存在（见 §4），且该目录内的内容**不是 REQ，也不是 IMP**，
若被扫到会产生假的索引行与假的校验失败。

## 4. `requirements/_inbox/` 降级

`_inbox/` 从「导入中间产物落点」**降级为临时暂存**：

- **仅保留** `fixtures/`——即 `scripts/import-docx.js` 的测试样本（`sample.docx` 等）。
- **不再承载任何管道产物**。归一化 Markdown、导入报告、分析产物一律落在 `requirements/IMP-YYYYMMDD-NNN/`。

> 这是本次修订的一处**破坏性变更**：旧 `/rudder-import` 的产物位置（`_inbox/<name>.md`、
> `_inbox/<name>.import-report.md`）**全部废弃**。旧的 `import-report.md` 概念由
> `analysis.md` + `pending_maps` 两者共同承接。

## 5. 归档路径

IMP 完成后（`approved` 且 REQ 目录已产出）归档：

```text
git mv requirements/IMP-YYYYMMDD-NNN/ requirements/archive/<YYYY-MM>-IMP-YYYYMMDD-NNN/
```

- 与 REQ 侧保持同一形态：`requirements/archive/<YYYY-MM>-<原目录名>/`。
- 归档后把 `metadata.yaml.status` 置为 `archived`。
- 归档与 REQ 的归档同属**封存**语义，**不得就地修改**。
