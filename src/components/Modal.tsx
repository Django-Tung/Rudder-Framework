import type { ComponentPropsWithRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * 模态弹窗。
 *
 * 遮罩、焦点陷阱（Tab 不会跑出弹窗）、`Esc` 关闭、关闭后焦点归还触发元素——
 * 这些全部由 `@radix-ui/react-dialog` 提供，本文件只画外观。
 * **不要**在这里补焦点管理代码：手写的焦点逻辑与原语库叠加会产生争抢，反而让焦点跑丢。
 *
 * 无障碍硬要求：`ModalContent` 内必须有 `ModalTitle`，否则屏幕阅读器只会读出
 * 一个无名的对话框。`ModalDescription` 可选，给了会自动关联到 `aria-describedby`。
 */

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalClose = DialogPrimitive.Close;

export function ModalOverlay({
  className,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-text-primary/60', className)}
      {...props}
    />
  );
}

export function ModalContent({
  className,
  children,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <ModalOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-3rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
          'gap-4 rounded-lg border border-border-base bg-surface-card p-card shadow-md',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            'absolute top-4 right-4 rounded-sm text-text-secondary transition-opacity hover:opacity-70',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          )}
        >
          <X className="size-4" aria-hidden />
          <span className="sr-only">关闭</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function ModalHeader({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 pr-8', className)} {...props} />;
}

export function ModalFooter({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 md:flex-row md:justify-end', className)}
      {...props}
    />
  );
}

export function ModalTitle({ className, ...props }: ComponentPropsWithRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-subtitle text-text-primary', className)}
      {...props}
    />
  );
}

export function ModalDescription({
  className,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-caption text-text-secondary', className)}
      {...props}
    />
  );
}
