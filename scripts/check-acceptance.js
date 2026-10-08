import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const VALID_RESULTS = new Set(['PENDING', 'PASS', 'FAIL']);

function readSection(text, heading) {
  const lines = text.split(/\r?\n/);
  const headingPattern = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
  const startIndex = lines.findIndex((line) => headingPattern.test(line.trim()));
  if (startIndex === -1) return { found: false, lines: [] };

  const matches = lines
    .slice(startIndex + 1)
    .reduce((acc, line) => {
      if (/^##\s+/.test(line.trim())) return acc;
      acc.push(line);
      return acc;
    }, []);

  return { found: true, lines: matches };
}

export function evaluateAcceptance(reqDir) {
  const dir = resolve(reqDir);
  const implPath = join(dir, 'implement.md');
  const readmePath = join(dir, 'README.md');

  if (!existsSync(implPath) || !existsSync(readmePath)) {
    return { accepted: false, reason: 'Missing implement.md or README.md' };
  }

  const implText = readFileSync(implPath, 'utf8');
  const readmeText = readFileSync(readmePath, 'utf8');

  const implSection = readSection(implText, 'Machine Verification');
  const reviewSection = readSection(readmeText, 'Human Review');

  if (!implSection.found || !reviewSection.found) {
    return { accepted: false, reason: 'Missing required section' };
  }

  const implResult = (implSection.lines.join('\n').match(/\*\*Result\*\*\s*:\s*([A-Za-z]+)/i) ?? [null, ''])[1]?.toUpperCase();
  const reviewResult = (reviewSection.lines.join('\n').match(/\*\*Result\*\*\s*:\s*([A-Za-z]+)/i) ?? [null, ''])[1]?.toUpperCase();

  if (!VALID_RESULTS.has(implResult) || !VALID_RESULTS.has(reviewResult)) {
    return { accepted: false, reason: `Invalid result values: Machine=${implResult || 'missing'}, Human=${reviewResult || 'missing'}` };
  }

  if (implResult !== 'PASS' || reviewResult !== 'PASS') {
    return { accepted: false, reason: `Machine=${implResult}, Human=${reviewResult}` };
  }

  return { accepted: true, reason: 'ACCEPTED' };
}

function main() {
  const reqDir = process.argv[2] ? resolve(process.argv[2]) : process.cwd();
  const result = evaluateAcceptance(reqDir);

  if (result.accepted) {
    console.log('ACCEPTED');
    process.exitCode = 0;
    return;
  }

  console.log('NOT ACCEPTED');
  console.log(`  - ${result.reason}`);
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
