import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const STAGES = [
  { label: 'Skills', command: 'npm run check:skills' },
  { label: 'Requirements', command: 'npm run check:req' },
  { label: 'Assets', command: 'npm run check:assets' },
  { label: 'Lint', command: 'npm run lint' },
  { label: 'Build', command: 'npm run build' },
  { label: 'Show Build', command: 'npm run build:show' },
];

for (const stage of STAGES) {
  const result = spawnSync(stage.command, {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    console.error(`\n[FAIL] ${stage.label}`);
    process.exit(result.status ?? 1);
  }

  console.log(`\n[PASS] ${stage.label}`);
}

console.log('\n✅ 全部检查通过');
