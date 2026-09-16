/**
 * 工程入口占位页。
 * 实际业务页面由 /rudder-plan 生成的 REQ 需求驱动，放置于 src/pages/。
 */
export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Rudder 原型工程</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          脚手架已就绪。使用{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-800">/rudder-plan</code>{' '}
          创建第一个需求。
        </p>
        <ul className="mt-6 space-y-2 text-sm text-slate-500">
          <li>契约优先：先定义 src/types/，再写 mocks 与 services</li>
          <li>依赖方向：UI → Service → Mock</li>
          <li>界面文案一律使用简体中文</li>
        </ul>
      </section>
    </main>
  );
}
