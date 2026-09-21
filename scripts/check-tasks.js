/**
 * tasks.md 不变量校验（I1 / I2 / status 一致性）。
 *
 * - I1（拆解完备）：plan.md 的每条 AC 编号，在 tasks.md 中至少出现一次。
 * - I2（无虚假完成）：implement.md = COMPLETED 时，tasks.md 必须 status=DONE 且无未勾选项。
 * - 一致性：tasks.md 的 status 必须与勾选状态推导结果一致。
 *
 * 用法：npm run check:tasks
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REQ_DIR = join(ROOT, 'requirements');
const ARCHIVE_DIR = join(REQ_DIR, 'archive');

function readStatus(file) {
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return null;
  const s = m[1].match(/^status:\s*(.+)$/m);
  return s ? s[1].trim() : null;
}

function listReqDirs() {
  const out = [];
  for (const base of [REQ_DIR, ARCHIVE_DIR]) {
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      if (entry.startsWith('_')) continue;
      const full = join(base, entry);
      if (!statSync(full).isDirectory()) continue;
      if (!/REQ-\d+/.test(entry)) continue;
      out.push(full);
    }
  }
  return out;
}

function check(reqDir) {
  const planPath = join(reqDir, 'plan.md');
  const tasksPath = join(reqDir, 'tasks.md');
  const implPath = join(reqDir, 'implement.md');
  const errors = [];

  if (!existsSync(planPath)) {
    return { dir: reqDir, errors: ['缺少 plan.md，跳过'] };
  }
  const planText = readFileSync(planPath, 'utf8');
  const acIds = [...planText.matchAll(/^###\s+(AC-\d+)/gm)].map((m) => m[1]);

  if (!existsSync(tasksPath)) {
    // plan 已批准却无 tasks.md，属拆解缺失
    if (readStatus(planPath) === 'APPROVED') errors.push('plan 已 APPROVED 但缺少 tasks.md');
    return { dir: reqDir, errors };
  }

  const tasksText = readFileSync(tasksPath, 'utf8');
  const tasksStatus = readStatus(tasksPath);
  const unchecked = (tasksText.match(/^- \[ \]/gm) || []).length;
  const checked = (tasksText.match(/^- \[[xX]\]/gm) || []).length;

  // I1
  for (const ac of acIds) {
    if (!tasksText.includes(ac)) errors.push(`I1: ${ac} 未在 tasks.md 中被任何任务覆盖`);
  }

  // I2
  const implStatus = readStatus(implPath);
  if (implStatus === 'COMPLETED') {
    if (unchecked > 0) errors.push(`I2: implement=COMPLETED 但 tasks.md 仍有 ${unchecked} 个未勾选项`);
    if (tasksStatus !== 'DONE') errors.push(`I2: implement=COMPLETED 但 tasks.md status=${tasksStatus}≠DONE`);
  }

  // status 与勾选一致性
  if (checked === 0 && unchecked === 0) {
    if (tasksStatus !== 'DRAFT') errors.push(`一致性: 无任务但 status=${tasksStatus}≠DRAFT`);
  } else if (unchecked > 0) {
    if (tasksStatus !== 'READY') errors.push(`一致性: 存在未勾选但 status=${tasksStatus}≠READY`);
  } else if (tasksStatus !== 'DONE') {
    errors.push(`一致性: 全部勾选但 status=${tasksStatus}≠DONE`);
  }

  return { dir: reqDir, errors };
}

function main() {
  const dirs = listReqDirs();
  if (dirs.length === 0) {
    console.log('未发现任何 REQ 目录，check-tasks 通过（空）。');
    process.exitCode = 0;
    return;
  }
  let totalErrors = 0;
  for (const dir of dirs) {
    const { errors } = check(dir);
    if (errors.length > 0) {
      totalErrors += errors.length;
      console.log(`❌ ${dir}`);
      for (const e of errors) console.log(`   - ${e}`);
    } else {
      console.log(`✅ ${dir}`);
    }
  }
  console.log('');
  console.log(totalErrors === 0 ? '✅ check-tasks 全部通过' : `❌ check-tasks 失败：${totalErrors} 个问题`);
  process.exitCode = totalErrors === 0 ? 0 : 1;
}

main();
