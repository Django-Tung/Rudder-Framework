/**
 * 确定性同步 MASTER-PRD.md 的「需求状态索引」块。
 *
 * - 零第三方依赖（Node 内置 + 正则）。
 * - 扫描 requirements/ 下的 REQ 目录 与 requirements/archive/，跳过 `_` 前缀目录。
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

/** 读取文件 frontmatter，返回 key -> value 对象；缺失/无 frontmatter 返回空对象。 */
function readFrontmatter(file) {
  if (!existsSync(file)) return {};
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    // 剥掉行内 YAML 注释（` # ...`），避免 status/name 等值被注释污染
    if (kv) out[kv[1]] = kv[2].replace(/\s+#.*$/, '').trim();
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

/** 依据 §3.P2.1 状态映射表推导索引状态与阶段。 */
function derive(req) {
  const plan = readFrontmatter(join(req.dir, 'plan.md'));
  const tasks = readFrontmatter(join(req.dir, 'tasks.md'));
  const impl = readFrontmatter(join(req.dir, 'implement.md'));
  const verify = readFrontmatter(join(req.dir, 'verify.md'));
  const review = readFrontmatter(join(req.dir, 'review.md'));
  const commit = readFrontmatter(join(req.dir, 'commit.md'));

  if (commit.status === 'DONE') return { status: '✅ DONE', phase: '完成' };
  if (verify.status === 'FAIL') return { status: '⛔ FAIL', phase: 'Verify' };
  if (review.status === 'CHANGES_REQUESTED') return { status: '🔁 返工中', phase: 'Review' };
  // OUTDATED 表示需求变更后旧实现作废、尚未重新实施；verify/review 的 INVALIDATED 交由下方常规判断兜底
  if (impl.status === 'OUTDATED') return { status: '🔄 变更中', phase: '变更回滚' };
  if (plan.status !== 'APPROVED') return { status: '🚧 进行中', phase: 'Plan' };
  if (tasks.status !== 'DONE') return { status: '🚧 进行中', phase: 'Tasks' };
  if (impl.status !== 'COMPLETED') return { status: '🚧 进行中', phase: 'Implement' };
  if (verify.status !== 'PASS') return { status: '🚧 进行中', phase: 'Verify' };
  if (review.status !== 'APPROVED') return { status: '🚧 进行中', phase: 'Review' };
  return { status: '🚧 进行中', phase: 'Commit' };
}

function buildBlock(reqs) {
  const lines = [
    '| 需求ID | 名称 | 状态 | Phase | 路径 |',
    '|--------|------|------|-------|------|',
  ];
  const sorted = [...reqs].sort((a, b) => a.id.localeCompare(b.id));
  for (const req of sorted) {
    const plan = readFrontmatter(join(req.dir, 'plan.md'));
    const displayName = plan.name || req.name;
    const s = derive(req);
    const rel = relative(REQ_DIR, req.dir);
    lines.push(`| ${req.id} | ${displayName} | ${s.status} | ${s.phase} | ${rel}/ |`);
  }
  return lines.join('\n');
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
