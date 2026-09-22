/**
 * REQ 结构与状态校验（零第三方依赖）。
 *
 * 断言四组不变量：
 *   A. 拆解完备与真实完成 —— I1（每条 AC 被任务覆盖）、I2（无虚假完成）、tasks.md status 一致性。
 *   B. `README.md` 顶层状态 —— 必填字段齐全，且 `status` 等于由 6 个阶段产物推导的结果
 *      （推导表见 .rudder/workflow/states.md §2）。不符时报出**期望值与实际值**。
 *   C. 依赖图 —— 依赖边**只从 MASTER-PRD.md 的 AUTO-INDEX 依赖列读取**：
 *      悬挂依赖、自依赖、环、README 与索引的漂移。
 *   D. `STALE` 一致性（见 .rudder/analysis/dependency.md §6）：
 *      标记缺失 / `stale_reason` 指向错误 / 已被裁决却未摘除。
 *
 * `MASTER-PRD.md`（`type: master-prd`）是例外文档，不参与阶段校验，
 * 且 MUST NOT 带 `status` / `phase` 字段。
 *
 * 用法：npm run check:req
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REQ_DIR = join(ROOT, 'requirements');
const ARCHIVE_DIR = join(REQ_DIR, 'archive');
const MASTER = join(REQ_DIR, 'MASTER-PRD.md');
const BEGIN = '<!-- BEGIN:AUTO-INDEX -->';
const END = '<!-- END:AUTO-INDEX -->';

const TOP_STATUSES = [
  'PLANNED',
  'IMPLEMENTING',
  'VERIFYING',
  'VERIFIED',
  'REVIEWING',
  'REVIEWED',
  'COMMITTED',
];

/** 顶层 `status` 推导规则，**顺序即判定顺序**（自上而下，首个满足者胜出）。 */
const TOP_STATUS_RULES = [
  { status: 'PLANNED', test: (s) => ['DRAFT', 'APPROVED'].includes(s.plan) && s.impl === 'PENDING' },
  { status: 'IMPLEMENTING', test: (s) => ['IN_PROGRESS', 'OUTDATED'].includes(s.impl) || s.review === 'CHANGES_REQUESTED' },
  { status: 'VERIFYING', test: (s) => s.impl === 'COMPLETED' && ['PENDING', 'FAIL'].includes(s.verify) },
  { status: 'VERIFIED', test: (s) => s.verify === 'PASS' && s.review === 'PENDING' },
  { status: 'REVIEWING', test: (s) => s.verify === 'PASS' && s.review === 'PENDING_HUMAN_REVIEW' },
  { status: 'REVIEWED', test: (s) => s.review === 'APPROVED' && s.commit === 'PENDING' },
  { status: 'COMMITTED', test: (s) => s.commit === 'DONE' },
];

const README_REQUIRED = ['id', 'title', 'status', 'source', 'deps', 'stale'];

/** 读取文件 frontmatter，返回 key -> value（值已剥掉行内 YAML 注释）。 */
function readFrontmatter(file) {
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    // 剥掉行内 YAML 注释（` # ...`）与包裹引号：`""` 必须解析为空串而非字面量两个引号
    out[kv[1]] = kv[2].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function readStatus(file) {
  const fm = readFrontmatter(file);
  return fm ? fm.status ?? null : null;
}

/** 列出所有 REQ 目录（含归档），跳过 `_` 前缀。 */
function listReqDirs() {
  const out = [];
  for (const base of [REQ_DIR, ARCHIVE_DIR]) {
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      if (entry.startsWith('_')) continue;
      const full = join(base, entry);
      if (!statSync(full).isDirectory()) continue;
      if (!/REQ-\d+/.test(entry)) continue;
      out.push({ dir: full, name: entry });
    }
  }
  return out;
}

/** 把 frontmatter 的行内列表 `[REQ-001, REQ-002]` 解析成数组。 */
function parseInlineList(raw) {
  if (!raw) return [];
  return raw
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

/** 解析 MASTER-PRD.md 的 AUTO-INDEX 块，返回 { id, status, deps, source } 行列表。 */
function readAutoIndex() {
  if (!existsSync(MASTER)) return [];
  const text = readFileSync(MASTER, 'utf8');
  const start = text.indexOf(BEGIN);
  const end = text.indexOf(END);
  if (start === -1 || end === -1 || end <= start) return [];
  const rows = [];
  for (const line of text.slice(start + BEGIN.length, end).split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 7 || cells[0] === '需求ID' || /^-+$/.test(cells[0])) continue;
    rows.push({
      id: cells[0],
      status: cells[2],
      deps: cells[4] === '—' ? [] : cells[4].split(',').map((s) => s.trim()).filter(Boolean),
      source: cells[5],
    });
  }
  return rows;
}

/** 统计「STALE 裁决记录」表中的真实行（4 个单元格都填了且非占位符 `—`）。 */
function readAdjudications(text) {
  const out = [];
  const lines = text.split('\n');
  let inSection = false;
  for (const line of lines) {
    const h = line.match(/^(#+)\s+/);
    if (h) {
      inSection = /STALE 裁决记录/.test(line);
      continue;
    }
    if (!inSection || !line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    if (cells[0] === '日期' || /^[-:]+$/.test(cells[0])) continue;
    if (cells.every((c) => c === '' || c === '—')) continue;
    out.push({ date: cells[0], source: cells[1], verdict: cells[2] });
  }
  return out;
}

/** 计算 `id` 的**传递依赖**集合（它依赖了谁，直接 + 间接）。 */
function depsClosure(edges, id) {
  const seen = new Set();
  const stack = [...(edges.get(id) ?? [])];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (seen.has(cur)) continue;
    seen.add(cur);
    stack.push(...(edges.get(cur) ?? []));
  }
  return seen;
}

/** 计算 `id` 的**传递依赖者**集合（谁依赖了它，直接 + 间接）。 */
function dependentsClosure(edges, id) {
  const reverse = new Map();
  for (const [from, tos] of edges) {
    for (const to of tos) {
      if (!reverse.has(to)) reverse.set(to, []);
      reverse.get(to).push(from);
    }
  }
  const seen = new Set();
  const stack = [...(reverse.get(id) ?? [])];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (seen.has(cur)) continue;
    seen.add(cur);
    stack.push(...(reverse.get(cur) ?? []));
  }
  return seen;
}

/** A + B：单个 REQ 目录的产物级校验。 */
function checkArtifacts(dir) {
  const errors = [];
  const planPath = join(dir, 'plan.md');
  const tasksPath = join(dir, 'tasks.md');
  const implPath = join(dir, 'implement.md');
  const readmePath = join(dir, 'README.md');

  if (!existsSync(planPath)) {
    errors.push('缺少 plan.md');
    return { errors, artifacts: null, readme: null };
  }
  const planText = readFileSync(planPath, 'utf8');
  // I1 提取 AC 编号，兼容两种声明格式：`### AC-1: 场景`、`- **AC-1: 功能点**`
  const acIds = [
    ...new Set([...planText.matchAll(/^(?:###\s*|-\s*\*\*)(AC-\d+)/gm)].map((m) => m[1])),
  ];

  if (existsSync(tasksPath)) {
    const tasksText = readFileSync(tasksPath, 'utf8');
    const tasksStatus = readStatus(tasksPath);
    const unchecked = (tasksText.match(/^- \[ \]/gm) || []).length;
    const checked = (tasksText.match(/^- \[[xX]\]/gm) || []).length;

    for (const ac of acIds) {
      if (!tasksText.includes(ac)) errors.push(`I1: ${ac} 未在 tasks.md 中被任何任务覆盖`);
    }

    const implStatus = readStatus(implPath);
    if (implStatus === 'COMPLETED') {
      if (unchecked > 0) errors.push(`I2: implement=COMPLETED 但 tasks.md 仍有 ${unchecked} 个未勾选项`);
      if (tasksStatus !== 'DONE') errors.push(`I2: implement=COMPLETED 但 tasks.md status=${tasksStatus}≠DONE`);
    }

    if (checked === 0 && unchecked === 0) {
      if (tasksStatus !== 'DRAFT') errors.push(`一致性: 无任务但 tasks.md status=${tasksStatus}≠DRAFT`);
    } else if (unchecked > 0) {
      if (tasksStatus !== 'READY') errors.push(`一致性: 存在未勾选但 tasks.md status=${tasksStatus}≠READY`);
    } else if (tasksStatus !== 'DONE') {
      errors.push(`一致性: 全部勾选但 tasks.md status=${tasksStatus}≠DONE`);
    }
  } else if (readStatus(planPath) === 'APPROVED') {
    errors.push('plan 已 APPROVED 但缺少 tasks.md');
  }

  // ---- B. README.md 顶层状态 ----
  if (!existsSync(readmePath)) {
    errors.push('缺少 README.md（REQ 顶层元数据，见 .rudder/requirement/structure.md §1）');
    return { errors, artifacts: null, readme: null };
  }
  const readmeText = readFileSync(readmePath, 'utf8');
  const readme = readFrontmatter(readmePath) ?? {};
  const missing = README_REQUIRED.filter((f) => readme[f] === undefined || readme[f] === '');
  if (missing.length > 0) errors.push(`README.md 字段缺失: ${missing.join(', ')}`);

  const artifacts = {
    plan: readStatus(planPath),
    impl: readStatus(implPath),
    verify: readStatus(join(dir, 'verify.md')),
    review: readStatus(join(dir, 'review.md')),
    commit: readStatus(join(dir, 'commit.md')),
  };

  if (readme.status !== undefined) {
    if (!TOP_STATUSES.includes(readme.status)) {
      errors.push(`README.md status 取值非法: ${readme.status}（合法值：${TOP_STATUSES.join(' / ')}）`);
    }
    const expected = TOP_STATUS_RULES.find((r) => r.test(artifacts));
    if (!expected) {
      errors.push(
        `无法推导顶层 status：产物状态组合不匹配任何规则（plan=${artifacts.plan} impl=${artifacts.impl} ` +
          `verify=${artifacts.verify} review=${artifacts.review} commit=${artifacts.commit}）`,
      );
    } else if (expected.status !== readme.status) {
      errors.push(`顶层 status 不一致：期望 ${expected.status}，实际 ${readme.status}`);
    }
  }

  if (readme.stale === 'true') {
    if (!readme.stale_reason) errors.push('stale: true 但缺少 stale_reason');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(readme.stale_since ?? '')) {
      errors.push(`stale: true 但 stale_since 非法: ${readme.stale_since ?? '（空）'}（应为 YYYY-MM-DD）`);
    }
    if (readAdjudications(readmeText).length > 0) {
      errors.push('已被裁决却未摘除：README 已有 STALE 裁决记录，但 stale 仍为 true（见 dependency.md §5.2）');
    }
  } else if (readme.stale === 'false') {
    if (readme.stale_reason || readme.stale_since) {
      errors.push('摘除未清空：stale: false 但 stale_reason / stale_since 仍有值（见 dependency.md §5.2）');
    }
  } else if (readme.stale !== undefined) {
    errors.push(`stale 取值非法: ${readme.stale}（应为 true 或 false）`);
  }

  return { errors, artifacts, readme };
}

/** C + D：全仓依赖图与 STALE 一致性。 */
function checkGraph(entries) {
  const errors = [];
  const index = readAutoIndex();
  const edges = new Map();
  for (const row of index) edges.set(row.id, row.deps);

  // 悬挂依赖、自依赖
  for (const [id, deps] of edges) {
    for (const d of deps) {
      if (d === id) errors.push(`${id}: 自依赖（deps 含自身）`);
      else if (!edges.has(d)) errors.push(`${id}: 悬挂依赖 ${d}（该 REQ 不在 AUTO-INDEX 中）`);
    }
  }

  // 环
  for (const id of edges.keys()) {
    if (depsClosure(edges, id).has(id)) errors.push(`${id}: 依赖成环`);
  }

  // README 的 deps 与索引漂移
  for (const e of entries) {
    if (!e.readme) continue;
    const id = e.readme.id || e.name.match(/REQ-\d+/)?.[0];
    if (!id || !edges.has(id)) continue;
    const fromReadme = parseInlineList(e.readme.deps).sort().join(',');
    const fromIndex = [...(edges.get(id) ?? [])].sort().join(',');
    if (fromReadme !== fromIndex) {
      errors.push(`${id}: README.md 的 deps [${fromReadme}] 与 AUTO-INDEX 依赖列 [${fromIndex}] 漂移，请运行 node scripts/sync-master-prd.js`);
    }
  }

  // D. STALE 一致性
  const marked = new Map();
  for (const e of entries) {
    if (!e.readme) continue;
    const id = e.readme.id || e.name.match(/REQ-\d+/)?.[0];
    if (id && e.readme.stale === 'true') marked.set(id, e.readme.stale_reason);
  }

  // stale_reason 指向错误
  for (const [id, reason] of marked) {
    if (!reason) continue; // 缺失已在上方报告
    if (!edges.has(reason)) {
      errors.push(`${id}: stale_reason=${reason} 不是索引中的 REQ`);
      continue;
    }
    if (!depsClosure(edges, id).has(reason)) {
      errors.push(`${id}: stale_reason=${reason} 不在它的传递依赖闭包内（触发源必须是上游）`);
    }
  }

  // 标记缺失：R 发生了一次被登记的变更 → closure(R) 内每个 REQ 要么已标 STALE，要么已有裁决记录
  const sources = new Set([...marked.values()].filter(Boolean));
  const adjudicated = new Set(
    entries.filter((e) => e.readme && readAdjudicationsReadme(e)).map((e) => e.readme.id || e.name.match(/REQ-\d+/)?.[0]),
  );
  for (const src of sources) {
    if (!edges.has(src)) continue;
    for (const dep of dependentsClosure(edges, src)) {
      if (marked.has(dep)) continue;
      if (adjudicated.has(dep)) continue;
      errors.push(`标记缺失: ${src} 发生变更，依赖者 ${dep} 既未标 STALE 也无裁决记录（见 dependency.md §4 / §5.1）`);
    }
  }

  return errors;
}

/** 缓存 README 文本，供裁决记录解析复用。 */
const readmeTextCache = new Map();
function readAdjudicationsReadme(entry) {
  const path = join(entry.dir, 'README.md');
  if (!readmeTextCache.has(path)) {
    readmeTextCache.set(path, existsSync(path) ? readFileSync(path, 'utf8') : '');
  }
  return readAdjudications(readmeTextCache.get(path)).length > 0;
}

/** 断言 MASTER-PRD.md 作为例外文档不参与状态机。 */
function checkMasterException() {
  const errors = [];
  if (!existsSync(MASTER)) return errors;
  const fm = readFrontmatter(MASTER);
  if (!fm) return errors;
  if (fm.type !== 'master-prd') {
    errors.push(`MASTER-PRD.md 缺少 type: master-prd 标记（check-req 依据它跳过阶段校验）`);
  }
  if (fm.status !== undefined) errors.push('MASTER-PRD.md MUST NOT 设置 status 字段（例外文档，见 lifecycle.md §0）');
  if (fm.phase !== undefined) errors.push('MASTER-PRD.md MUST NOT 设置 phase 字段（例外文档，见 lifecycle.md §0）');
  return errors;
}

function main() {
  const dirs = listReqDirs();
  const entries = [];
  let totalErrors = 0;

  if (dirs.length === 0) {
    console.log('未发现任何 REQ 目录（空仓）。');
  }
  for (const { dir, name } of dirs) {
    const { errors, readme } = checkArtifacts(dir);
    entries.push({ dir, name, readme });
    if (errors.length > 0) {
      totalErrors += errors.length;
      console.log(`❌ ${name}`);
      for (const e of errors) console.log(`   - ${e}`);
    } else {
      console.log(`✅ ${name}`);
    }
  }

  const graphErrors = [...checkMasterException(), ...checkGraph(entries)];
  if (graphErrors.length > 0) {
    totalErrors += graphErrors.length;
    console.log('❌ 依赖图 / MASTER-PRD');
    for (const e of graphErrors) console.log(`   - ${e}`);
  } else {
    console.log('✅ 依赖图与 MASTER-PRD 例外声明');
  }

  console.log('');
  console.log(totalErrors === 0 ? '✅ check-req 全部通过' : `❌ check-req 失败：${totalErrors} 个问题`);
  process.exitCode = totalErrors === 0 ? 0 : 1;
}

main();
