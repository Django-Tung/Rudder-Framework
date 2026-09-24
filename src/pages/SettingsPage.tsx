import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

interface SettingsPageProps {
  onBack: () => void;
}

const permissionLabels: Record<string, string> = {
  dashboard: '工作台概览',
  collection: '信息采集',
  portfolio: '项目管理',
  reports: '报告中心',
  settings: '系统设置',
};

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="min-h-screen bg-[#f3f6f4] text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-5xl items-center gap-4"><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="返回工作台" onClick={onBack}><ArrowLeft size={18} /></button><div><p className="text-sm font-semibold text-slate-900">系统设置</p><p className="text-xs text-slate-400">权限与访问管理</p></div></div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">ACCESS CONTROL</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">访问权限</h1><p className="mt-2 text-sm text-slate-500">查看当前账号的部门、角色和已授权模块。</p></div>
        <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-800">{user?.name.slice(0, 1)}</span><div><h2 className="font-semibold text-slate-900">{user?.name}</h2><p className="mt-1 text-sm text-slate-500">{user?.department}</p></div></div><div className="mt-7 space-y-4 border-t border-slate-100 pt-5"><div><p className="text-xs text-slate-400">角色</p><p className="mt-1 text-sm font-medium text-slate-700">{user?.roles.join('、')}</p></div><div><p className="text-xs text-slate-400">账号状态</p><p className="mt-1 flex items-center gap-2 text-sm font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />正常</p></div></div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-start justify-between"><div><h2 className="font-semibold text-slate-900">已授权模块</h2><p className="mt-1 text-sm text-slate-500">当前账号可以访问以下工作台模块。</p></div><ShieldCheck className="text-emerald-600" size={22} /></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{user?.permissions.map((permission) => <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3" key={permission}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check size={15} /></span><span className="text-sm font-medium text-slate-700">{permissionLabels[permission]}</span></div>)}</div></section>
        </div>
      </div>
    </main>
  );
}
