/**
 * S0 技术验证探针：mammoth 对 .docx 的层级保真度
 *
 * 用途：在改动任何框架文件之前，先量化验证「docx → Markdown」链路的保真度。
 * 判定阈值（系统架构规划组 2026-09-21 批复）：
 *   - 标题层级 H1-H3 保留率 必须为 100%
 *   - 有序 / 无序列表保留率 必须 ≥ 90%
 * 低于阈值不阻塞 P1，而是转入降级方案（纯文本提取 + AI 重构层级）。
 *
 * 事实来源：fixture 的未压缩源件（_build/），而非硬编码的预期值——
 * 期望值由源 XML 现算得出，避免「用假设验证假设」。
 *
 * 本文件是一次性验证工具，不属于 Rudder 生命周期产物。
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import mammoth from 'mammoth';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const FIXTURES = path.join(ROOT, 'requirements/_inbox/fixtures');
const SRC_DIR = path.join(FIXTURES, '_build/word');
const DOCX = path.join(FIXTURES, 'sample.docx');
const OUT_MD = path.join(FIXTURES, 'sample.mammoth.md');

/** 从源 XML 现算期望值：标题按 pStyle 层级，列表按 numbering.xml 的 numFmt 判类型。 */
async function readExpectations() {
  const documentXml = await readFile(path.join(SRC_DIR, 'document.xml'), 'utf8');
  const numberingXml = await readFile(path.join(SRC_DIR, 'numbering.xml'), 'utf8');

  // numId -> abstractNumId -> numFmt，用于区分无序(bullet)与有序(decimal)
  const abstractNumFmt = new Map();
  for (const m of numberingXml.matchAll(
    /<w:abstractNum w:abstractNumId="(\d+)"[\s\S]*?<w:numFmt w:val="([^"]+)"/g,
  )) {
    abstractNumFmt.set(m[1], m[2]);
  }
  const numIdToFmt = new Map();
  for (const m of numberingXml.matchAll(
    /<w:num w:numId="(\d+)"><w:abstractNumId w:val="(\d+)"\/><\/w:num>/g,
  )) {
    numIdToFmt.set(m[1], abstractNumFmt.get(m[2]));
  }

  const headings = { 1: 0, 2: 0, 3: 0 };
  for (const m of documentXml.matchAll(/<w:pStyle w:val="Heading([123])"\/>/g)) {
    headings[m[1]] += 1;
  }

  const lists = { unordered: 0, ordered: 0 };
  for (const m of documentXml.matchAll(/<w:numId w:val="(\d+)"\/>/g)) {
    const fmt = numIdToFmt.get(m[1]);
    if (fmt === 'bullet') lists.unordered += 1;
    else if (fmt) lists.ordered += 1;
  }

  return { headings, lists };
}

/** 从 Markdown 输出统计实际值。 */
function countMarkdown(md) {
  const lines = md.split('\n');
  const headings = { 1: 0, 2: 0, 3: 0 };
  const lists = { unordered: 0, ordered: 0 };

  for (const line of lines) {
    const heading = line.match(/^(#{1,3}) /);
    if (heading) {
      headings[heading[1].length] += 1;
      continue;
    }
    if (/^\s{0,4}[-*+] /.test(line)) lists.unordered += 1;
    else if (/^\s{0,4}\d+\. /.test(line)) lists.ordered += 1;
  }
  return { headings, lists };
}

/** 保留率 = 实际 / 期望；期望为 0 时视为不适用（返回 null，不计入判定）。 */
function rate(actual, expected) {
  return expected === 0 ? null : actual / expected;
}

function pct(r) {
  return r === null ? 'n/a' : `${(r * 100).toFixed(1)}%`;
}

async function main() {
  const expect = await readExpectations();
  const result = await mammoth.convertToMarkdown({ path: DOCX });
  const actual = countMarkdown(result.value);

  await writeFile(OUT_MD, result.value, 'utf8');

  // 按层级建对象，不要用 Array.map 的下标（0/1/2）去对应层级（1/2/3）——会整体错位一格。
  const headingRates = Object.fromEntries(
    [1, 2, 3].map((lvl) => [lvl, rate(actual.headings[lvl], expect.headings[lvl])]),
  );
  const unorderedRate = rate(actual.lists.unordered, expect.lists.unordered);
  const orderedRate = rate(actual.lists.ordered, expect.lists.ordered);

  console.log('════════ S0 探针：mammoth 层级保真度 ════════');
  console.log(`mammoth 版本: ${JSON.parse(await readFile(path.join(ROOT, 'node_modules/mammoth/package.json'), 'utf8')).version}`);
  console.log(`输入: ${path.relative(ROOT, DOCX)}`);
  console.log(`输出: ${path.relative(ROOT, OUT_MD)}`);
  console.log('');

  console.log('── 标题层级 ──');
  for (const lvl of [1, 2, 3]) {
    console.log(
      `  H${lvl}: 期望 ${expect.headings[lvl]} / 实际 ${actual.headings[lvl]} → ${pct(headingRates[lvl])}`,
    );
  }

  console.log('── 列表 ──');
  console.log(
    `  无序: 期望 ${expect.lists.unordered} / 实际 ${actual.lists.unordered} → ${pct(unorderedRate)}`,
  );
  console.log(
    `  有序: 期望 ${expect.lists.ordered} / 实际 ${actual.lists.ordered} → ${pct(orderedRate)}`,
  );

  if (result.messages.length > 0) {
    console.log('── mammoth 警告 ──');
    for (const msg of result.messages) console.log(`  [${msg.type}] ${msg.message}`);
  } else {
    console.log('── mammoth 警告: 无 ──');
  }

  // 判定
  const headingsOk = Object.values(headingRates).every((r) => r === null || r >= 1);
  const listRates = [unorderedRate, orderedRate].filter((r) => r !== null);
  const listsOk = listRates.length === 0 || listRates.every((r) => r >= 0.9);
  const pass = headingsOk && listsOk;

  console.log('');
  console.log('── 判定 ──');
  console.log(`  标题层级 100% 阈值: ${headingsOk ? '✅ 通过' : '❌ 未达标'}`);
  console.log(`  列表 ≥90% 阈值:     ${listsOk ? '✅ 通过' : '❌ 未达标'}`);
  console.log(`  结论: ${pass ? '✅ 正案可行，S0 通过' : '⚠️ 需转入降级方案（纯文本提取 + AI 重构层级）'}`);

  console.log('');
  console.log('──────── mammoth 原始输出 ────────');
  console.log(result.value);
  console.log('──────── 输出结束 ────────');

  process.exitCode = pass ? 0 : 2;
}

main().catch((err) => {
  console.error('S0 探针执行失败:', err);
  process.exitCode = 1;
});
