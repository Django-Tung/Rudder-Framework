/**
 * IMP 管道结构校验（零第三方依赖）。
 *
 * 传入 IMP 目录时断言：
 *   1. `metadata.yaml` 存在，且字段齐全
 *      （`id` / `source.type` / `source.filename` / `created_at` / `status` / `content.format` / `content.path`）；
 *   2. `status` 取值合法（`imported` / `analyzed` / `approved` / `archived`）；
 *   3. `status` ∈ {analyzed, approved, archived} 时 `analysis.md` 必须存在，
 *      且含**非空**「澄清问题清单」（条目数 ≥ 1）。
 *
 * 传入单文件（旧的导入报告路径）时，只做第 3 条的澄清问题断言，保持向后可用。
 *
 * 用法：node scripts/check-import.js <IMP 目录 | 报告文件>
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** status 的合法取值，以及各自是否要求 analysis.md 已存在。 */
const STATUSES = {
  imported: { needsAnalysis: false },
  analyzed: { needsAnalysis: true },
  approved: { needsAnalysis: true },
  archived: { needsAnalysis: true },
};

/** metadata.yaml 必须包含的字段（点号表示嵌套层级）。 */
const REQUIRED_FIELDS = [
  'id',
  'source.type',
  'source.filename',
  'created_at',
  'status',
  'content.format',
  'content.path',
];

/** 极简 YAML 子集解析：只支持一层缩进（顶层键 → 标量 或 一层子键 → 标量）。 */
function parseYamlSubset(text) {
  const root = {};
  let nested = null;
  for (const raw of text.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const kv = raw.match(/^(\s*)([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, indent, key, rawVal] = kv;
    const val = rawVal.replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
    if (indent.length === 0) {
      if (val === '') {
        root[key] = {};
        nested = root[key];
      } else {
        root[key] = val;
        nested = null;
      }
    } else if (nested) {
      nested[key] = val;
    }
  }
  return root;
}

function get(obj, dotted) {
  return dotted.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

/** 统计「澄清问题清单」章节内的列表项数（直到遇到同级或更高级标题为止）。 */
function countClarifications(text) {
  const lines = text.split('\n');
  let inSection = false;
  let sectionLevel = 0;
  let count = 0;
  for (const line of lines) {
    const h = line.match(/^(#+)\s+/);
    if (h) {
      if (inSection && h[1].length <= sectionLevel) break;
      if (/澄清问题/.test(line)) {
        inSection = true;
        sectionLevel = h[1].length;
      }
      continue;
    }
    if (inSection && /^\s*[-*]\s+\S/.test(line)) count += 1;
  }
  return count;
}

/** 断言文本含非空「澄清问题清单」章节，返回是否通过。 */
function assertClarifications(text, label) {
  const hasSection = /澄清问题清单/.test(text);
  const n = countClarifications(text);
  const ok = hasSection && n >= 1;
  console.log(`  ${ok ? '✅' : '❌'} ${label} 澄清问题清单：章节${hasSection ? '存在' : '缺失'}、条目数 ${n}`);
  return ok;
}

function checkImpDir(dir) {
  const problems = [];
  console.log(`IMP 目录: ${dir}`);

  const metaPath = join(dir, 'metadata.yaml');
  if (!existsSync(metaPath)) {
    console.error(`❌ 缺少 metadata.yaml: ${metaPath}`);
    return false;
  }
  const meta = parseYamlSubset(readFileSync(metaPath, 'utf8'));

  const missing = REQUIRED_FIELDS.filter((f) => {
    const v = get(meta, f);
    return v === undefined || v === '';
  });
  if (missing.length > 0) {
    problems.push(`metadata.yaml 字段缺失: ${missing.join(', ')}`);
    console.error(`❌ metadata.yaml 字段缺失: ${missing.join(', ')}`);
  } else {
    console.log(`✅ metadata.yaml 字段齐全（${REQUIRED_FIELDS.length} 项）`);
  }

  const status = meta.status;
  const rule = STATUSES[status];
  if (!rule) {
    problems.push(`status 取值非法: ${status ?? '（空）'}`);
    console.error(`❌ status 取值非法: ${status ?? '（空）'}（合法值：${Object.keys(STATUSES).join(' / ')}）`);
  } else {
    console.log(`✅ status 取值合法: ${status}`);
  }

  if (!rule || rule.needsAnalysis) {
    const analysisPath = join(dir, 'analysis.md');
    if (!existsSync(analysisPath)) {
      problems.push('缺少 analysis.md');
      console.error(`❌ 缺少 analysis.md: ${analysisPath}`);
    } else {
      console.log('✅ analysis.md 存在');
      if (!assertClarifications(readFileSync(analysisPath, 'utf8'), 'analysis.md')) {
        problems.push('analysis.md 的澄清问题清单为空');
      }
    }
  } else {
    console.log(`⏭  status = ${status}，尚未要求 analysis.md`);
  }

  return problems.length === 0;
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('用法: node scripts/check-import.js <IMP 目录 | 报告文件>');
    process.exitCode = 1;
    return;
  }
  if (!existsSync(target)) {
    console.error(`路径不存在: ${target}`);
    process.exitCode = 1;
    return;
  }

  const ok = statSync(target).isDirectory()
    ? checkImpDir(target)
    : assertClarifications(readFileSync(target, 'utf8'), target);

  console.log(`结论: ${ok ? '✅ 通过' : '❌ 未通过'}`);
  process.exitCode = ok ? 0 : 1;
}

main();
