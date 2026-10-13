import type { ComponentPropsWithRef } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { CONTROL_TRANSITION } from '@/design/tokens';
import { cn } from '@/lib/cn';

/**
 * 页签。
 *
 * 方向键切换、`aria-selected`、`aria-controls` 由 `@radix-ui/react-tabs` 承载，
 * 使用默认的 `activationMode="automatic"`：焦点移到哪个页签，面板就切到哪一块（AC-12）。
 *
 * 选中标识用「2px 下边框 + 加粗」两种视觉通道，而不是只换文字颜色——
 * 只靠颜色区分对色觉障碍用户等于没有标识。
 */

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentPropsWithRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex flex-col gap-1 border-b border-border-base md:flex-row md:items-center', className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center border-b-2 border-transparent px-3 py-2',
        'text-ui whitespace-nowrap text-text-secondary',
        CONTROL_TRANSITION,
        'hover:text-text-primary',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        'data-[state=active]:border-brand-600 data-[state=active]:font-medium data-[state=active]:text-brand-700',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentPropsWithRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'p-card text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        className,
      )}
      {...props}
    />
  );
}
