import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },

  // 配置文件与脚本（*.js）：Node 环境
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
  },

  // 源码（*.ts / *.tsx）：浏览器环境，React 规则
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      // 命名有陷阱：react-hooks 的 configs['recommended-latest'] 仍是旧版 eslintrc 格式
      // （plugins 为字符串数组），会直接让 ESLint 10 报错。flat 原生的是 configs.flat.recommended。
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      // vite.config.ts 用得到 node 全局，源码用得到浏览器全局
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // ---- Rudder 工程策略（见 .rudder/policies/core.md）----
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      // 提交前必须清理调试语句，故设为 error 而非 warn，
      // 让 npm run lint 能在机器验证阶段直接拦住。
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
