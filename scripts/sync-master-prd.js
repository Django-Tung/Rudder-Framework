/**
 * 确定性同步 MASTER-PRD.md 的「需求状态索引」块。
 *
 * - 零第三方依赖（Node 内置 + 正则）。
 * - 扫描 requirements/ 下的 REQ 目录 与 requirements/archive/，跳过 `_` 前缀目录。
 * - 索引的 `状态` / `依赖` / `来源` 三列**从各 REQ 的 README.md 读取**（单一真相源，
 *   见 .rudder/requirement/structure.md §4）；`Phase` 列由 6 个阶段产物推导，仅供人读。
 * - 幂等；`--check` 模式只断言索引与事实一致，不写入。
 *
 * 用法：
 *   node scripts/sync-master-prd.js          # 写入（更新索引块 + updated 字段）
 *   node scripts/sync-master-prd.js --check  # 校验，不一致则退出码 1
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REQ_DIR = join(ROOT, 'requirements');
const ARCHIVE_DIR = join(REQ_DIR, 'archive');
const MASTER = join(REQ_DIR, 'MASTER-PRD.md');
const BEGIN = '<!-- BEGIN:AUTO-INDEX -->';
const END = '<!-- END:AUTO-INDEX -->';
const COLUMNS = ['需求ID', '名称', '状态', 'Phase', '依赖', '来源', '路径'];
const EMPTY = '—';

/** 读取文件 frontmatter，返回 key -> value 对象；缺失/无 frontmatter 返回空对象。 */
function readFrontmatter(file) {
  if (!existsSync(file)) return {};
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    // 剥掉行内 YAML 注释（` # ...`）与包裹引号，避免 status/title 等值被污染
    if (kv) out[kv[1]] = kv[2].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

/** 列出所有 REQ 目录（含归档目录），返回 { dir, id, name }。 */
function listReqs() {
  const out = [];
  for (const base of [REQ_DIR, ARCHIVE_DIR]) {
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      if (entry.startsWith('_')) continue;
      const full = join(base, entry);
      if (!statSync(full).isDirectory()) continue;
      const idm = entry.match(/REQ-\d+/);
      if (!idm) continue;
      out.push({ dir: full, id: idm[0], name: entry });
    }
  }
  return out;
}

/**
 * 由 6 个阶段产物推导「当前阶段」列。
 *
 * 注意：**这不是 `状态` 列的来源**——`状态` 一律取自 `README.md`（见文件头注释）。
 * 本列保留阶段细分（Plan / Tasks 之分、变更回滚），供人快速定位进度。
 */
function derivePhase(req) {
  const plan = readFrontmatter(join(req.dir, 'plan.md'));
  const tasks = readFrontmatter(join(req.dir, 'tasks.md'));
  const impl = readFrontmatter(join(req.dir, 'implement.md'));
  const verify = readFrontmatter(join(req.dir, 'verify.md'));
  const review = readFrontmatter(join(req.dir, 'review.md'));
  const commit = readFrontmatter(join(req.dir, 'commit.md'));

  if (commit.status === 'DONE') return '完成';
  if (verify.status === 'FAIL') return 'Verify';
  if (review.status === 'CHANGES_REQUESTED') return 'Review';
  // OUTDATED 表示需求变更后旧实现作废、尚未重新实施
  if (impl.status === 'OUTDATED') return '变更回滚';
  if (plan.status !== 'APPROVED') return 'Plan';
  if (tasks.status !== 'DONE') return 'Tasks';
  if (impl.status !== 'COMPLETED') return 'Implement';
  if (verify.status !== 'PASS') return 'Verify';
  if (review.status !== 'APPROVED') return 'Review';
  return 'Commit';
}

/** 把 frontmatter 里的行内列表 `[REQ-001, REQ-002]` 渲染成单元格文本。 */
function formatDeps(raw) {
  if (!raw) return EMPTY;
  const inner = raw.replace(/^\[/, '').replace(/\]$/, '').trim();
  if (inner === '') return EMPTY;
  return inner
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
    .join(', ') || EMPTY;
}

function buildBlock(reqs) {
  const lines = [
    `| ${COLUMNS.join(' | ')} |`,
    `|${COLUMNS.map(() => '------').join('|')}|`,
  ];
  const sorted = [...reqs].sort((a, b) => a.id.localeCompare(b.id));
  for (const req of sorted) {
    const readme = readFrontmatter(join(req.dir, 'README.md'));
    const id = readme.id || req.id;
    const title = readme.title || req.name;
    const status = readme.status || '（缺 README.md）';
    const deps = formatDeps(readme.deps);
    const source = readme.source || EMPTY;
    const rel = relative(REQ_DIR, req.dir);
    lines.push(`| ${id} | ${title} | ${status} | ${derivePhase(req)} | ${deps} | ${source} | ${rel}/ |`);
  }
  return lines.join('\n');
}

/** 逐行列出标记块与派生结果的差异，便于定位漂移。 */
function reportDiff(existing, derived) {
  const a = existing.split('\n');
  const b = derived.split('\n');
  const n = Math.max(a.length, b.length);
  const diffs = [];
  for (let i = 0; i < n; i += 1) {
    if (a[i] !== b[i]) {
      diffs.push(`  行 ${i + 1}:`);
      diffs.push(`    索引: ${a[i] ?? '（缺行）'}`);
      diffs.push(`    事实: ${b[i] ?? '（缺行）'}`);
    }
  }
  return diffs.join('\n');
}

function main() {
  const checkMode = process.argv.includes('--check');
  const reqs = listReqs();
  const block = buildBlock(reqs);
  const today = new Date().toISOString().slice(0, 10);

  if (!existsSync(MASTER)) {
    console.error(`MASTER-PRD.md 不存在: ${MASTER}`);
    process.exitCode = 1;
    return;
  }
  const text = readFileSync(MASTER, 'utf8');
  const start = text.indexOf(BEGIN);
  const end = text.indexOf(END);

  if (start === -1 || end === -1 || end <= start) {
    console.error('MASTER-PRD.md 缺少 AUTO-INDEX 标记块');
    process.exitCode = 1;
    return;
  }

  const existingBlock = text.slice(start + BEGIN.length, end).trim();
  if (checkMode) {
    if (existingBlock === block) {
      console.log('✅ 索引与事实一致');
      process.exitCode = 0;
    } else {
      console.error('❌ 索引与事实不一致，请运行 node scripts/sync-master-prd.js 更新');
      console.error(reportDiff(existingBlock, block));
      process.exitCode = 1;
    }
    return;
  }

  const newBlock = `${BEGIN}\n${block}\n${END}`;
  const next = text
    .slice(0, start)
    .concat(newBlock, text.slice(end + END.length))
    .replace(/^updated:\s*.*$/m, `updated: ${today}`);
  writeFileSync(MASTER, next, 'utf8');
  console.log(`✅ 索引已更新（共 ${reqs.length} 个需求）`);
}

main();
