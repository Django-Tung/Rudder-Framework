import { BarChart3, FileText, LogOut, Radar, Settings2, ShieldCheck, SlidersHorizontal } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import type { Permission } from '@/types/auth';

interface WorkspacePageProps {
  onOpenSettings: () => void;
}

const MODULES: Array<{ permission: Permission; label: string; description: string; icon: typeof Radar }> = [
  { permission: 'collection', label: '信息采集', description: '动态源与舆情入口', icon: Radar },
  { permission: 'portfolio', label: '项目管理', description: '在管项目与投前线索', icon: BarChart3 },
  { permission: 'reports', label: '报告中心', description: '研判成果与周期报告', icon: FileText },
];

export default function WorkspacePage({ onOpenSettings }: WorkspacePageProps) {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  if (!user || user.permissions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f6f4] p-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto text-amber-500" size={36} />
          <h1 className="mt-5 text-xl font-semibold text-slate-950">暂无可用权限</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">当前账号尚未分配投研工作台模块，请联系系统管理员。</p>
          <button className="mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-800" onClick={() => void signOut()}>
            退出登录
          </button>
        </section>
      </main>
    );
  }

  const visibleModules = MODULES.filter((module) => user.permissions.includes(module.permission));
  const initials = user.name.slice(0, 1);

  return (
    <main className="min-h-screen bg-[#f3f6f4] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#143b35] text-emerald-100"><Radar size={19} /></span>
            <div>
              <p className="text-sm font-semibold tracking-[0.12em] text-[#143b35]">投研智能体</p>
              <p className="text-xs text-slate-400">研究工作台</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-400">{user.department} · {user.roles.join('、')}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">{initials}</span>
            <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="退出登录" onClick={() => void signOut()}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">工作台概览 / 09.24</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">早上好，{user.name}</h1>
            <p className="mt-2 text-sm text-slate-500">今天有 12 条新采集动态，2 个项目需要关注。</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-500" />数据服务正常</div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['12', '今日新增动态', '较昨日 +18%'],
            ['05', '在管项目', '全部已同步'],
            ['02', '待处理研判', '需要关注'],
          ].map(([value, label, note]) => (
            <div className="rounded-2xl border border-slate-200 bg-white p-5" key={label}>
              <p className="text-xs font-medium text-slate-400">{label}</p>
              <div className="mt-4 flex items-end justify-between"><strong className="text-3xl font-semibold tracking-tight text-slate-950">{value}</strong><span className="text-xs text-emerald-700">{note}</span></div>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">业务模块</h2><span className="text-xs text-slate-400">已授权 {visibleModules.length} 项</span></div>
          <div className="grid gap-4 md:grid-cols-3">
            {visibleModules.map(({ icon: Icon, label, description }) => (
              <button className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5" key={label}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={20} /></span>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{label}</h3>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
                <span className="mt-6 block text-xs font-semibold text-emerald-700 opacity-0 transition group-hover:opacity-100">进入模块 →</span>
              </button>
            ))}
            {user.permissions.includes('settings') && (
              <button className="group rounded-2xl border border-dashed border-slate-300 bg-transparent p-5 text-left transition hover:border-emerald-400 hover:bg-white" onClick={onOpenSettings}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Settings2 size={20} /></span>
                <h3 className="mt-5 text-base font-semibold text-slate-900">系统设置</h3>
                <p className="mt-1 text-sm text-slate-500">权限与规则配置</p>
                <span className="mt-6 block text-xs font-semibold text-emerald-700 opacity-0 transition group-hover:opacity-100">管理设置 →</span>
              </button>
            )}
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-[#143b35] p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/70">今日研究摘要</p><h2 className="mt-3 text-xl font-semibold">数据正在持续汇入</h2><p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/70">信息采集服务已完成最近一轮同步，投研团队可以从业务模块继续查看和处理最新内容。</p></div><SlidersHorizontal className="text-emerald-200/60" size={28} /></div>
        </section>
      </div>
    </main>
  );
}
