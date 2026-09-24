import { useEffect, useState } from 'react';

import LoginPage from '@/pages/LoginPage';
import SettingsPage from '@/pages/SettingsPage';
import WorkspacePage from '@/pages/WorkspacePage';
import { useAuthStore } from '@/stores/authStore';

type AppView = 'workspace' | 'settings';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const [view, setView] = useState<AppView>('workspace');

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  if (isLoading && !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f6f4]">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-600" />正在加载工作台...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (view === 'settings') {
    return <SettingsPage onBack={() => setView('workspace')} />;
  }

  return <WorkspacePage onOpenSettings={() => setView('settings')} />;
}
