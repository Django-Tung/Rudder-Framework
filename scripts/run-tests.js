import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { checkAssets } from './check-assets.js';
import { evaluateAcceptance } from './check-acceptance.js';
import { checkArtifacts, checkResponsive } from './check-req.js';

function makeTempDir() {
  return mkdtempSync(join(tmpdir(), 'rudder-tests-'));
}

function testCheckAssetsDetectsRemote() {
  const root = makeTempDir();
  try {
    mkdirSync(join(root, 'src'), { recursive: true });
    writeFileSync(join(root, 'src', 'App.tsx'), '<img src="https://example.com/a.png" />\n');
    const errors = checkAssets(root);
    assert.ok(errors.length > 0, 'should detect remote asset URL');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function writeReqFixture(root, { plan = '', layout = '', tasks = '', impl = '', readme = '' }) {
  mkdirSync(root, { recursive: true });
  if (plan) writeFileSync(join(root, 'plan.md'), plan, 'utf8');
  if (layout) writeFileSync(join(root, 'layout.md'), layout, 'utf8');
  if (tasks) writeFileSync(join(root, 'tasks.md'), tasks, 'utf8');
  if (impl) writeFileSync(join(root, 'implement.md'), impl, 'utf8');
  if (readme) writeFileSync(join(root, 'README.md'), readme, 'utf8');
}

function testCheckReqI3Valid() {
  const root = makeTempDir();
  try {
    const plan = `---\nstatus: APPROVED\n---\n\n# Plan\n- **AC-1: 进入页面**\n- **AC-2: 提交表单**\n- **响应式要求**：不需要 —— 页面是单列布局，现阶段无需为小屏额外重排。\n`;
    const layout = `# Layout\n- 响应式行为：本 REQ 无响应式要求\n`;
    const impl = `---\nstatus: COMPLETED\n---\n\n## AC 实现核对表\n| AC | 实现位置（文件:行） | 核对结论 |\n|---|---|---|\n| AC-1 | \`src/App.tsx:10\` | ☐ |\n| AC-2 | \`src/App.tsx:20\` | ☐ |\n`;
    mkdirSync(join(root, 'src'), { recursive: true });
    writeFileSync(
      join(root, 'src', 'App.tsx'),
      'export const A = 1;\nexport const B = 2;\nexport const C = 3;\nexport const D = 4;\nexport const E = 5;\nexport const F = 6;\nexport const G = 7;\nexport const H = 8;\nexport const I = 9;\nexport const J = 10;\nexport const K = 11;\nexport const L = 12;\nexport const M = 13;\nexport const N = 14;\nexport const O = 15;\nexport const P = 16;\nexport const Q = 17;\nexport const R = 18;\nexport const S = 19;\nexport const T = 20;\n',
    );
    writeFileSync(join(root, 'commit.md'), '---\nstatus: PENDING\n---\n');
    writeReqFixture(root, { plan, layout, impl, tasks: '---\nstatus: DONE\n---\n- [x] AC-1\n- [x] AC-2\n', readme: '---\nid: REQ-001\ntitle: 测试需求\nstatus: IMPLEMENTED\nsource: 人工登记\ndeps: []\nstale: false\n---\n' });
    const result = checkArtifacts(root);
    assert.equal(result.errors.length, 0, `expected no I3 errors but got: ${result.errors.join(', ')}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function testCheckReqI3MissingFile() {
  const root = makeTempDir();
  try {
    const plan = `---\nstatus: APPROVED\n---\n\n# Plan\n- **AC-1: 进入页面**\n`;
    const impl = `---\nstatus: COMPLETED\n---\n\n## AC 实现核对表\n| AC | 实现位置（文件:行） | 核对结论 |\n|---|---|---|\n| AC-1 | \`src/Missing.tsx:10\` | ☐ |\n`;
    writeReqFixture(root, { plan, impl, tasks: '---\nstatus: DONE\n---\n- [x] AC-1\n', readme: '---\nid: REQ-001\nstatus: IMPLEMENTED\nsource: 人工登记\ndeps: []\nstale: false\n---\n' });
    const result = checkArtifacts(root);
    assert.ok(result.errors.some((e) => e.includes('I3') && e.includes('不存在')), 'expected missing file error');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function testCheckReqI4ResponsiveValid() {
  const root = makeTempDir();
  try {
    const plan = `---\nstatus: APPROVED\n---\n\n# Plan\n- **响应式要求**：需要 —— 在 768px 断点时将侧栏收起为顶部菜单，并在 1024px 时转为双栏布局。\n`;
    const layout = `---\nstatus: DRAFT\n---\n\n# Layout\n- 响应式行为：需要 —— 在 768px 时折叠导航，1024px 时改为两列布局。\n`;
    writeReqFixture(root, { plan, layout, tasks: '---\nstatus: DRAFT\n---\n', readme: '---\nid: REQ-002\nstatus: PLANNED\nsource: 人工登记\ndeps: []\nstale: false\n---\n' });
    const result = checkResponsive(root);
    assert.equal(result.length, 0, `expected no responsive errors but got: ${result.join(', ')}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function testCheckAcceptancePass() {
  const reqDir = makeTempDir();
  try {
    writeFileSync(
      join(reqDir, 'implement.md'),
      '## Machine Verification\n\n- [x] I1\n\n**Result**: PASS\n',
      'utf8',
    );
    writeFileSync(
      join(reqDir, 'README.md'),
      '## Human Review\n\n- [x] UX\n\n**Result**: PASS\n',
      'utf8',
    );

    const result = evaluateAcceptance(reqDir);
    assert.equal(result.accepted, true);
  } finally {
    rmSync(reqDir, { recursive: true, force: true });
  }
}

function testCheckAcceptanceFailWhenPending() {
  const reqDir = makeTempDir();
  try {
    writeFileSync(join(reqDir, 'implement.md'), '## Machine Verification\n\n**Result**: PASS\n');
    writeFileSync(join(reqDir, 'README.md'), '## Human Review\n\n**Result**: PENDING\n');
    const result = evaluateAcceptance(reqDir);
    assert.equal(result.accepted, false);
  } finally {
    rmSync(reqDir, { recursive: true, force: true });
  }
}

(async function main() {
  testCheckAssetsDetectsRemote();
  testCheckReqI3Valid();
  testCheckReqI3MissingFile();
  testCheckReqI4ResponsiveValid();
  testCheckAcceptancePass();
  testCheckAcceptanceFailWhenPending();
  console.log('✅ run-tests passed');
})().catch((error) => {
  console.error('❌ run-tests failed');
  console.error(error);
  process.exit(1);
});
