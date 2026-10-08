import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.turbo']);
const TEXT_EXTS = new Set(['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.svg', '.json', '.txt']);

function isTextFile(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  return TEXT_EXTS.has(ext) || !ext;
}

function listFiles(rootDir) {
  if (!existsSync(rootDir)) return [];
  const files = [];

  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(entry.name)) continue;
        if (entry.name === 'tests') continue;
        walk(join(current, entry.name));
        continue;
      }

      const fullPath = join(current, entry.name);
      if (statSync(fullPath).isFile()) {
        files.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return files;
}

function looksRemote(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^(?:data:|blob:|#|\/|\.\/|\.\.\/)/i.test(trimmed)) return false;
  if (/^mailto:|^tel:/i.test(trimmed)) return false;
  return /^(?:https?:)?\/\//i.test(trimmed) || trimmed.startsWith('//');
}

function collectResourceRefs(filePath, text) {
  const refs = [];
  const basename = filePath.split('/').pop() || filePath;
  const isHtmlLike = /\.(html?|jsx|tsx|js|ts|svg)$/i.test(basename) || basename === 'index.html';
  const isCssLike = /\.(css|scss|less)$/i.test(basename);

  if (isHtmlLike || basename.endsWith('.svg')) {
    const attrRegex = /(src|href|srcset|poster|xlinkHref|xlink:href)\s*=\s*(?:["'`])([^"'`]+)(?:["'`])/gi;
    for (const match of text.matchAll(attrRegex)) {
      const name = match[1].toLowerCase();
      const value = match[2]?.trim();
      if (!looksRemote(value)) continue;
      const line = text.slice(0, match.index).split('\n').length;
      refs.push({ type: name.includes('href') ? 'html-href' : 'html-resource', value, line });
    }
  }

  if (isCssLike || basename.endsWith('.svg')) {
    const cssRegex = /(?:url\s*\(\s*|@import\s+(?:url\()?)\s*(["'`]?)(https?:\/\/[^"'`)\s]+|\/\/[^"'`)\s]+)\1/gi;
    for (const match of text.matchAll(cssRegex)) {
      const value = match[2] ?? match[1] ?? '';
      if (!looksRemote(value)) continue;
      const line = text.slice(0, match.index).split('\n').length;
      refs.push({ type: 'css-url', value, line });
    }
  }

  if (isCssLike) {
    const importRegex = /@import\s+(?:url\()?\s*["'`]?(https?:\/\/|\/\/)[^"'`\s)]+/gi;
    for (const match of text.matchAll(importRegex)) {
      const value = match[0].replace(/^@import\s+(?:url\()?\s*/i, '').replace(/["'`)]/g, '');
      if (!looksRemote(value)) continue;
      const line = text.slice(0, match.index).split('\n').length;
      refs.push({ type: 'css-import', value, line });
    }
  }

  return refs;
}

export function checkAssets(rootDir = ROOT) {
  const errors = [];
  const files = listFiles(rootDir).filter((file) => {
    const rel = relative(rootDir, file).replace(/\\/g, '/');
    if (rel === 'index.html') return true;
    if (rel.startsWith('src/')) return true;
    if (rel.startsWith('public/')) return true;
    return false;
  });

  for (const file of files) {
    if (!existsSync(file)) continue;
    if (!isTextFile(file)) continue;
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    for (const ref of collectResourceRefs(file, text)) {
      const rel = relative(rootDir, file).replace(/\\/g, '/');
      const host = ref.value.replace(/^https?:\/\//i, '').split(/[/?#]/)[0] || 'remote-host';
      errors.push(`${rel}:${ref.line} ${ref.type} ${host}`);
    }
  }

  return errors;
}

function main() {
  const explicitRoot = process.argv[2] ? resolve(process.argv[2]) : ROOT;
  const errors = checkAssets(explicitRoot);

  if (errors.length === 0) {
    console.log('✅ Asset Gate: no remote static resources detected');
    process.exitCode = 0;
    return;
  }

  console.error('❌ Asset Gate failed:');
  for (const e of errors) {
    console.error(`   - ${e}`);
  }
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
