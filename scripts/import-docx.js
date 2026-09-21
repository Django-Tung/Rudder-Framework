/**
 * 需求文档导入转换器：docx / md / txt → 归一化 Markdown。
 *
 * - `.docx`：用 mammoth（devDependency）提取纯文本与基础层级（标题、列表），忽略图片与复杂排版。
 * - `.md` / `.txt`：直接读取。
 * - 输出到 requirements/_inbox/<name>.md。
 *
 * 语义分块由 AI 完成（见 .rudder/policies/import.md）；本脚本只做确定性转换。
 *
 * 用法：node scripts/import-docx.js <输入文件>
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const INBOX = join(ROOT, 'requirements/_inbox');

async function convertDocx(input) {
  const result = await mammoth.convertToMarkdown({ path: input });
  return { markdown: result.value, warnings: result.messages };
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
  let markdown;
  let warnings = [];
  if (ext === '.docx') {
    ({ markdown, warnings } = await convertDocx(input));
  } else if (ext === '.md' || ext === '.txt' || ext === '.markdown') {
    markdown = readFileSync(input, 'utf8');
  } else {
    console.error(`不支持的文件类型: ${ext}（仅支持 .docx / .md / .txt）`);
    process.exitCode = 1;
    return;
  }

  if (!existsSync(INBOX)) mkdirSync(INBOX, { recursive: true });
  const stem = basename(input, ext);
  const outMd = join(INBOX, `${stem}.md`);
  writeFileSync(outMd, markdown, 'utf8');

  const headings = { h1: 0, h2: 0, h3: 0 };
  for (const line of markdown.split('\n')) {
    const m = line.match(/^(#{1,3}) /);
    if (m) headings[`h${m[1].length}`] += 1;
  }

  console.log('════ 导入转换完成 ════');
  console.log(`输入: ${input}`);
  console.log(`输出: ${outMd}`);
  console.log(`字符数: ${markdown.length}`);
  console.log(`标题 H1/H2/H3: ${headings.h1}/${headings.h2}/${headings.h3}`);
  if (warnings.length > 0) {
    console.log('mammoth 警告:');
    for (const w of warnings) console.log(`  [${w.type}] ${w.message}`);
  }
  console.log('');
  console.log('下一步（由 AI 完成）:');
  console.log('  1. 读取归一化 Markdown，识别「全局规则」与「独立功能点」。');
  console.log('  2. 生成导入报告 requirements/_inbox/<name>.import-report.md，');
  console.log('     其中必须包含非空的「澄清问题清单」章节（至少 1 条）。');
  console.log('  3. 运行 node scripts/check-import.js <报告路径> 校验。');
}

main().catch((err) => {
  console.error('转换失败:', err);
  process.exitCode = 1;
});
