import { createContext, useContext } from 'react';

import type { IToastOptions } from '@/types/ui';

/**
 * Toast 的 context 与读取 hook。
 *
 * 为什么单独一个文件（而不是和 `Toast.tsx` 放一起）：
 * `react-refresh/only-export-components` 要求「只导出组件的文件」才能热更新，
 * 而组件文件里再导出 context / hook 会让热更新退化。所以把非组件部分拆出来。
 */

/** 默认自动消失时长（毫秒），与 AC-13 的「3 秒后自动消失」一致 */
export const DEFAULT_TOAST_DURATION = 3000;

/** `useToast()` 的返回值。故意只暴露 `show`——队列、去重、计时器是实现细节 */
export interface IToastApi {
  show: (options: IToastOptions) => void;
}

export const ToastContext = createContext<IToastApi | null>(null);

/**
 * 读取轻提示 API。
 *
 * 在 `<ToastProvider>` 之外调用会直接抛错，而不是静默失效——
 * 静默失效会让人误以为「提示发了但没显示」，排查成本远高于启动即报错。
 */
export function useToast(): IToastApi {
  const api = useContext(ToastContext);

  if (!api) {
    throw new Error('useToast 必须在 <ToastProvider> 内部使用');
  }

  return api;
}
