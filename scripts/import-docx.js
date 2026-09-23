/**
 * 需求文档导入转换器：docx / md / txt → IMP 目录 + 归一化 Markdown。
 *
 * 本脚本是 IMP 管道的**确定性部分**（.rudder/import/parsing.md §1）：
 *   - 建 `requirements/IMP-YYYYMMDD-NNN/`；
 *   - 把原件复制进 `source/`（原件留痕，不再改动）；
 *   - 生成 `imported.md` 与 `metadata.yaml`（`status: imported`）。
 *
 * 语义分块（分析与拆分）**不由本脚本负责**，由 AI 完成（见 .rudder/import/parsing.md §1、
 * .rudder/analysis/decomposition.md）。`requirements/_inbox/` 不再承载任何管道产物。
 *
 * 用法：node scripts/import-docx.js <输入文件>
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REQ_DIR = join(ROOT, 'requirements');
const ARCHIVE_DIR = join(REQ_DIR, 'archive');
const SUPPORTED = { '.docx': 'docx', '.md': 'md', '.txt': 'txt', '.markdown': 'md' };

async function convertDocx(input) {
  const result = await mammoth.convertToMarkdown({ path: input });
  return { markdown: result.value, warnings: result.messages };
}

/** 生成当日的下一个 IMP-ID（`IMP-YYYYMMDD-NNN`），扫描 requirements/ 与 archive/ 的并集。 */
function nextImpId() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const prefix = `IMP-${stamp}-`;
  let max = 0;
  for (const base of [REQ_DIR, ARCHIVE_DIR]) {
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      // 归档目录形如 <YYYY-MM>-IMP-YYYYMMDD-NNN，用 includes 而非前缀匹配
      const m = entry.match(/IMP-\d{8}-(\d+)/);
      if (m && entry.includes(prefix)) max = Math.max(max, Number(m[1]));
    }
  }
  return { id: `${prefix}${String(max + 1).padStart(3, '0')}`, date: date.toISOString().slice(0, 10) };
}

function buildMetadata({ id, date, filename, format }) {
  return `# IMP 管道元数据（由 scripts/import-docx.js 生成）
# 字段规格见 .rudder/import/normalization.md §2
# 状态取值见 .rudder/import/sources.md §1（只允许 4 个小写值，且单向推进）

id: ${id}

source:
  type: ${format}
  filename: ${filename}

created_at: ${date}

status: imported

content:
  format: markdown
  path: imported.md
`;
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('用法: node scripts/import-docx.js <输入文件>');
    process.exitCode = 1;
    return;
  }
  if (!existsSync(input)) {
    console.error(`输入文件不存在: ${input}`);
    process.exitCode = 1;
    return;
  }

  const ext = extname(input).toLowerCase();
  const format = SUPPORTED[ext];
  if (!format) {
    console.error(`不支持的文件类型: ${ext}（仅支持 .docx / .md / .txt）`);
    console.error('PDF 与 xlsx 为 Non-Goal，见 .rudder/import/sources.md §5。');
    process.exitCode = 1;
    return;
  }

  let markdown;
  let warnings = [];
  if (ext === '.docx') {
    ({ markdown, warnings } = await convertDocx(input));
  } else {
    markdown = readFileSync(input, 'utf8');
  }

  const { id, date } = nextImpId();
  const impDir = join(REQ_DIR, id);
  const sourceDir = join(impDir, 'source');
  mkdirSync(sourceDir, { recursive: true });

  const filename = basename(input);
  copyFileSync(input, join(sourceDir, filename));
  writeFileSync(join(impDir, 'imported.md'), markdown, 'utf8');
  writeFileSync(join(impDir, 'metadata.yaml'), buildMetadata({ id, date, filename, format }), 'utf8');

  const headings = { h1: 0, h2: 0, h3: 0 };
  for (const line of markdown.split('\n')) {
    const m = line.match(/^(#{1,3}) /);
    if (m) headings[`h${m[1].length}`] += 1;
  }

  console.log('════ IMP 导入完成（status: imported）════');
  console.log(`IMP-ID: ${id}`);
  console.log(`输入: ${input}`);
  console.log(`原件: source/${filename}`);
  console.log(`归一化产物: ${id}/imported.md`);
  console.log(`字符数: ${markdown.length}`);
  console.log(`标题 H1/H2/H3: ${headings.h1}/${headings.h2}/${headings.h3}`);
  if (warnings.length > 0) {
    console.log('mammoth 警告:');
    for (const w of warnings) console.log(`  [${w.type}] ${w.message}`);
  }
  console.log('');
  console.log('下一步（由 AI 完成，见 .rudder/analysis/analysis.md）:');
  console.log('  1. 只读 imported.md（**禁止**解析原始二进制），识别「全局规则」与「独立功能点」。');
  console.log(`  2. 一次性产出 ${id}/analysis.md 与 MASTER-PRD.md 的 pending_maps 条目，`);
  console.log(`     并把 metadata.yaml 的 status 推进为 analyzed。`);
  console.log(`  3. 运行 node scripts/check-import.js requirements/${id} 校验；`);
  console.log('     判定模糊时必须输出澄清问题并**停在原地**，禁止擅自猜测补全。');
}

main().catch((err) => {
  console.error('转换失败:', err);
  process.exitCode = 1;
});
