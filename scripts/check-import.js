/**
 * 导入报告结构校验：报告必须包含非空的「澄清问题清单」章节。
 *
 * 用法：node scripts/check-import.js <导入报告路径>
 */

import { readFileSync, existsSync } from 'node:fs';

function usage() {
  console.error('用法: node scripts/check-import.js <导入报告路径>');
  process.exitCode = 1;
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

function main() {
  const reportPath = process.argv[2];
  if (!reportPath) {
    usage();
    return;
  }
  if (!existsSync(reportPath)) {
    console.error(`报告不存在: ${reportPath}`);
    process.exitCode = 1;
    return;
  }
  const text = readFileSync(reportPath, 'utf8');
  const hasSection = /澄清问题清单/.test(text);
  const n = countClarifications(text);
  const ok = hasSection && n >= 1;

  console.log(`澄清问题章节存在: ${hasSection ? '✅' : '❌'}`);
  console.log(`澄清问题条目数: ${n}`);
  console.log(`结论: ${ok ? '✅ 通过' : '❌ 未通过（报告必须含非空「澄清问题清单」章节）'}`);
  process.exitCode = ok ? 0 : 1;
}

main();
