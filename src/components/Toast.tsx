import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircleCheck, CircleX, TriangleAlert, X } from 'lucide-react';

import { DEFAULT_TOAST_DURATION, ToastContext } from '@/components/toast-context';
import { TOAST_ICON_TONE, TOAST_TONE } from '@/design/tokens';
import { cn } from '@/lib/cn';
import type { IToastItem, IToastOptions, ToastTone } from '@/types/ui';

/**
 * 轻提示。
 *
 * 为什么自绘而不是引入 `sonner` / `@radix-ui/react-toast`：
 * 本工程禁止清单外依赖，而 Toast 需要的行为（定时消失、队列、`aria-live` 播报）
 * 用 React context + `setTimeout` 不到百行就能覆盖，
 * 不值得为它开一个依赖口子（见 `requirements/REQ-001-design-foundation/plan.md` §5.4）。
 */

const TOAST_ICON: Record<ToastTone, ReactNode> = {
  success: <CircleCheck className="size-5" />,
  warning: <TriangleAlert className="size-5" />,
  danger: <CircleX className="size-5" />,
};

function ToastCard({ item, onDismiss }: { item: IToastItem; onDismiss: (id: number) => void }) {
  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border p-card shadow-md',
        TOAST_TONE[item.tone],
      )}
    >
      <span className={cn('mt-0.5 shrink-0', TOAST_ICON_TONE[item.tone])} aria-hidden>
        {TOAST_ICON[item.tone]}
      </span>

      <p className="flex-1 text-ui text-text-primary">{item.message}</p>

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className={cn(
          'shrink-0 rounded-sm text-text-secondary transition-opacity hover:opacity-70',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        )}
      >
        <X className="size-4" aria-hidden />
        <span className="sr-only">关闭提示</span>
      </button>
    </div>
  );
}

/**
 * 轻提示容器。挂在 provider 内部、页面内容之后。
 *
 * `aria-live="polite"` 必须放在**常驻**的这个容器上，而不是每条提示自己身上：
 * 区域本身要先存在于 DOM 中，后插入的内容才会被屏幕阅读器播报（AC-13）。
 */
function Toaster({ items, onDismiss }: { items: IToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-card left-card right-card z-[60] flex flex-col items-center gap-3 md:left-auto md:right-card md:items-end"
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/**
 * 轻提示 Provider。包住需要发提示的界面即可，不要提到应用最外层——
 * 它是界面级的交互反馈，不是全局状态。
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<IToastItem[]>([]);
  const nextIdRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const show = useCallback(
    (options: IToastOptions) => {
      nextIdRef.current += 1;
      const id = nextIdRef.current;

      setItems((prev) => [...prev, { ...options, id }]);

      const duration = options.duration ?? DEFAULT_TOAST_DURATION;
      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  // 卸载时清掉所有待触发的计时器，避免在已卸载的组件上继续排队
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
