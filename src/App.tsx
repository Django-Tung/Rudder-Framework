import { BrowserRouter, HashRouter, Route, Routes } from 'react-router';

import { CARD, PAGE_SHELL, SECTION_BLOCK, text } from '@/design/tokens';
import DesignPreviewPage from '@/pages/DesignPreviewPage';

/**
 * 工程入口占位页。
 * 实际业务页面由 /rudder-plan 生成的 REQ 需求驱动，放置于 src/pages/。
 *
 * 样式一律取自 `@/design/tokens`，与预览页同源——占位页用裸色板 class 的话，
 * 它会成为全工程唯一不跟令牌走的页面，换预设时被漏掉。
 */
function HomePage() {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-center ${PAGE_SHELL} p-page`}>
      <section className={`w-full max-w-md ${CARD} ${SECTION_BLOCK}`}>
        <h1 className={text.title}>Rudder 原型工程</h1>
        <p className={`mt-3 ${text.body} ${text.secondary} leading-relaxed`}>
          脚手架已就绪。使用{' '}
          <code className="rounded-sm bg-surface-page px-1.5 py-0.5 text-text-primary">
            /rudder-plan
          </code>{' '}
          创建第一个需求。
        </p>
        <ul className={`mt-6 space-y-2 ${text.body} ${text.muted}`}>
          <li>契约优先：先定义 src/types/，再写 mocks 与 services</li>
          <li>依赖方向：UI → Service → Mock</li>
          <li>界面文案一律使用简体中文</li>
        </ul>
      </section>
    </main>
  );
}

// `npm run build:show` 产出单文件后是双击（file://）打开的：此时
// location.pathname 是磁盘路径（如 /Users/.../index.html），BrowserRouter
// 匹配不到任何路由 → 白屏。file:// 下退回 HashRouter，其余场景保持 BrowserRouter。
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

/**
 * 路由表。
 *
 * - `/` 是脚手架自带的占位首页，待首个业务 REQ 接管后替换；
 * - `/design` 是**仅开发期**的组件预览页。导航里不挂入口，地址栏手动访问——
 *   它演示已验收的第一层通用组件与设计令牌，新 REQ 搭页面前先来这里取用，
 *   避免同款控件各写一遍（.rudder/design/visual.md §6.2）。
 */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/design" element={<DesignPreviewPage />} />
      </Routes>
    </Router>
  );
}
