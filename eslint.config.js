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
      // ---- Rudder 工程策略（见 .rudder/constitution.md）----
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

  // src/ 专属：Rudder 视觉与资源硬约束（见 .rudder/constitution.md §2.1 / §3.1）
  // 这些规则刻意做窄匹配以避免误报；确有合法例外时用 eslint-disable-next-line 并写明理由。
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // 色值唯一来源是 src/index.css 的 @theme 令牌；src/ 下禁止硬编码十六进制色值。
      // 覆盖：Tailwind 任意值 bg-[#3b82f6]、内联样式 color:'#fff'、SVG 的 fill="#fff"。
      // 说明：项目已引入 react-router，不使用 hash 锚点，因此 '#abc' 这类片段标识符不会出现在 src/ 中。
      'no-restricted-syntax': [
        'error',
        // 色值唯一来源是 src/index.css 的 @theme 令牌；src/ 下禁止硬编码十六进制色值。
        // 覆盖：Tailwind 任意值 bg-[#3b82f6]、内联样式 color:'#fff'、SVG 的 fill="#fff"。
        // 说明：项目使用 react-router，不使用 hash 锚点，因此 '#abc' 这类片段标识符不会出现在 src/ 中。
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
          message:
            '颜色必须来自 src/index.css 的 @theme 令牌，不得硬编码色值。改用语义令牌 utility class（见 src/design/tokens.ts）。',
        },
        // 零外网依赖：原型需在会议室投屏下演示，禁止远程资源引用（.rudder/design/assets.md §3）。
        // 放行：相对路径 /public、data: 内联 base64。
        {
          selector:
            'JSXAttribute[name.name=/^(src|srcSet|poster|xlinkHref)$/][value.value=/^https?:\\/\\//]',
          message:
            '禁止外链资源。原型需断网可演示，请把素材放入 public/assets/ 并用相对路径引用，或使用 PlaceholderImage 组件。',
        },
        {
          selector: 'Literal[value=/url\\(\\s*[\'"]?https?:\\/\\//]',
          message:
            '禁止外链资源（CSS url() 指向远程地址）。请使用本地素材路径。',
        },
      ],
    },
  },
);
