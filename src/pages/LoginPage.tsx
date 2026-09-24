import { useState, type FormEvent } from 'react';
import { ArrowRight, LockKeyhole, Radar, UserRound } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    clearError();

    if (!username.trim() || !password) {
      setValidationError('请输入账号和密码');
      return;
    }

    await signIn({ username: username.trim(), password });
  }

  return (
    <main className="min-h-screen bg-[#f3f6f4] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_520px]">
        <section className="relative hidden overflow-hidden bg-[#143b35] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-emerald-200/15" />
          <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full border border-emerald-200/10" />
          <div className="relative flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-emerald-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300 text-[#143b35]">
              <Radar size={20} />
            </span>
            投研智能体
          </div>
          <div className="relative max-w-xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-emerald-200/70">RESEARCH OS / 01</p>
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-tight">
              把分散的市场信号，汇成可行动的判断。
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-emerald-50/70">
              从信息采集到项目研判，在一张高密度工作台里掌握投研全局。
            </p>
          </div>
          <div className="relative flex items-center gap-8 text-xs text-emerald-100/60">
            <span>信息采集</span>
            <span className="h-px w-10 bg-emerald-100/25" />
            <span>智能研判</span>
            <span className="h-px w-10 bg-emerald-100/25" />
            <span>项目管理</span>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-sm">
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[#143b35]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#143b35] text-emerald-100">
                  <Radar size={20} />
                </span>
                投研智能体
              </div>
            </div>
            <div className="mb-9">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">欢迎回来</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">登录工作台</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">使用内部账号进入投研数据空间。</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">账号</span>
                <span className="relative block">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="输入账号"
                    autoComplete="username"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">密码</span>
                <span className="relative block">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="输入密码"
                    autoComplete="current-password"
                  />
                </span>
              </label>

              {(validationError || error) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {validationError ?? error}
                </div>
              )}

              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#143b35] px-4 text-sm font-semibold text-white transition hover:bg-[#1d5148] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '正在验证...' : '登录工作台'}
                {!isLoading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-5 text-xs leading-6 text-slate-400">
              <p>演示账号：researcher / 123456</p>
              <p>只读账号：viewer / 123456; 管理员：admin / 123456</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
