import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react';
import { Loader } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

import { BTN_BASE, BTN_SIZE, BTN_VARIANT } from '@/design/tokens';
import { cn } from '@/lib/cn';
import type { ButtonSize, ButtonVariant } from '@/types/ui';

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 默认 `primary` */
  variant?: ButtonVariant;
  /** 默认 `md` */
  size?: ButtonSize;
  /** 把样式与行为下放给子元素（如把按钮渲染成 `<a>`） */
  asChild?: boolean;
  /** 前置图标。传 Lucide 组件并保留其默认尺寸（1rem），不要自行放大 */
  icon?: ReactNode;
  /** 加载中：禁用交互、显示旋转图标；按钮宽度保持不变 */
  loading?: boolean;
  /** 加载中显示的文案，默认「提交中」 */
  loadingText?: string;
}

/**
 * 通用按钮。
 *
 * 外观完全由 `src/design/tokens.ts` 中的片段决定，本文件只做「变体名 → 片段」的映射，
 * 不内联任何 class 字面量——这样换预设时只需改令牌。
 *
 * **加载态为什么用「同格叠放」**（AC-3 要求加载前后宽度完全一致）：
 * 把「日常内容」与「加载中内容」放进**同一个 grid 单元格**叠起来，按钮宽度恒等于两者的较大值，
 * 与当前处于哪个状态无关。两个更朴素的做法都不成立：
 *
 *   1. 直接把文案换成「提交中」——文字变短，按钮收缩，产生位移；
 *   2. 只把原文案 `invisible` 留在流内、把旋转图标插进文档流——图标本身占 16px 加 8px 间距，
 *      加载态反而**变宽 24px**（实测 114px → 138px）。这正是本组件早先版本的真实现象。
 *
 * `asChild` 时不做这层包裹：`Slot` 要把按钮样式合并到子元素（如 `<a>`）上，
 * 多包一层 `span` 会让样式落到 `span` 而不是子元素上。该分支下 `icon` / `loading` 不生效。
 */
export function Button({
  variant = 'primary',
  size = 'md',
  asChild = false,
  icon,
  loading = false,
  loadingText = '提交中',
  disabled,
  className,
  children,
  ...props
}: IButtonProps) {
  // asChild 时渲染为子元素（Radix Slot 负责把 props 合并下去）
  const Comp = (asChild ? Slot : 'button') as ElementType;

  return (
    <Comp
      className={cn(BTN_BASE, BTN_SIZE[size], BTN_VARIANT[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <span className="grid place-items-center">
          {/* 日常内容：加载期间只隐藏、不撤出，继续参与宽度计算 */}
          <span
            className={cn(
              'col-start-1 row-start-1 inline-flex items-center gap-2',
              loading && 'invisible',
            )}
          >
            {icon}
            {children}
          </span>

          {/* 加载中内容：与上一行同格叠放，不额外占宽 */}
          {loading ? (
            <span className="col-start-1 row-start-1 inline-flex items-center gap-2">
              <Loader className="size-4 animate-spin" aria-hidden />
              {loadingText}
            </span>
          ) : null}
        </span>
      )}
    </Comp>
  );
}
