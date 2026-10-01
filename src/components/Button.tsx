import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY } from '@/design/tokens';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** 按钮内容，须为简体中文 */
  children: ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: BTN_PRIMARY,
  secondary: BTN_SECONDARY,
  danger: BTN_DANGER,
};

const SIZE_CLASS: Record<Size, string> = {
  md: '',
  sm: 'px-3 py-1.5 text-caption',
};

/**
 * 通用按钮。同类交互必须复用本组件，确需新建须在 implement.md 说明理由。
 * 视觉规范见 .rudder/design/visual.md §6。
 */
export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}