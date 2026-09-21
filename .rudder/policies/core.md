# Core Engineering Policies

## 🌐 1. Language Constraint (CRITICAL)
- **Target Audience**: Chinese-speaking users.
- **Output**: ALL communication, requirement docs, UI copy, and commit messages MUST be in **Simplified Chinese**.
- **Exception**: Code, variable names, file paths, and pure technical terms (e.g., API, Loading, Toast) remain in English.

## 🛠️ 2. Frontend Tech Stack (STRICT)
- **Core**: React 19+ (Functional Components, Hooks ONLY).
- **Language**: TypeScript (Strict Mode). `any` is strictly forbidden.
- **Build**: Vite.
- **Styling**: Tailwind CSS ONLY. 唯一允许存在的 CSS 文件是 `src/index.css`（Tailwind 入口，内容仅限 `@import 'tailwindcss';`）。**除该入口外，禁止任何自定义 `.css` / `.scss`**，所有样式一律通过 Tailwind utility class 表达。禁止重型 UI 库（Ant Design、MUI 等）。
- **State**: Zustand or React Context. No Redux.
- **Icons**: Lucide React.

> **依赖豁免（2026-09-21 增补）**：本节白名单约束的是前端运行时依赖（`dependencies`）。
> `scripts/` 下的 Node 工具/构建脚本允许引入 `devDependencies`，前提是该依赖**不被 `src/` 任何文件 import**，
> 因而不进入打包产物。校验方式：依赖位于 `devDependencies`；`src/` 全目录 grep 不到该包名；`dist/` 产物中亦无该包名。

## 🛡️ 3. Rudder Architectural Constraints
- **Dependency Direction**: UI components MUST fetch data from `src/services/`, NEVER directly from `src/mocks/`.
- **Contract-First**: Always define `src/types/` before writing mocks or UI.
- **Mock Latency**: All service functions MUST simulate 300-800ms network delay using `setTimeout`.
- **UI States**: All data-fetching UIs MUST explicitly handle Loading, Error, and Empty states.

## 🔄 4. Mandatory Feedback Loop
- After ANY code change, you MUST automatically run `npm run build` and `npm run lint` (or `npm run typecheck`).
- If it fails, read the terminal error, auto-fix the code, and re-run until it passes with 0 errors.
- **Escape Hatch**: 连续 3 轮仍失败时**必须停止**，将 `verify.md` 状态置为 `FAIL` 并上报人工，不得继续推进（详见 `.rudder/lifecycle.md` §4.1）。

## 🧹 5. Garbage Collection
- Before any `git commit`, remove unused imports, non-debug `console.log`s, and dead code.