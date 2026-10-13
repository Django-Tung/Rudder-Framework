import type { ComponentPropsWithRef } from 'react';
import { useId } from 'react';

import {
  CONTROL_BASE,
  CONTROL_BORDER_DEFAULT,
  CONTROL_BORDER_ERROR,
  CONTROL_DISABLED,
  CONTROL_FOCUS,
} from '@/design/tokens';
import { cn } from '@/lib/cn';

export interface IInputProps extends ComponentPropsWithRef<'input'> {
  /** 字段标签。传入后会自动与输入框通过 `htmlFor` 关联 */
  label?: string;
  /** 错误提示。传入即进入错误态：危险色描边 + `aria-invalid` + 下方中文提示 */
  error?: string;
  /** 辅助说明。与 `error` 互斥展示，错误优先 */
  hint?: string;
}

/**
 * 单行输入框（四态：默认 / 聚焦 / 错误 / 禁用）。
 *
 * 错误态用「二选一」而非叠加：`error ? CONTROL_BORDER_ERROR : CONTROL_BORDER_DEFAULT`。
 * 两个描边类都只声明 `border-*` 一个维度，同时出现时谁生效取决于 CSS 输出顺序，
 * 所以不能靠 `cn()` 的先后顺序覆盖（见 `src/lib/cn.ts` 的说明）。
 */
export function Input({ label, error, hint, className, id, ...props }: IInputProps) {
  const autoId = useId();
  const inputId = id ?? `input-${autoId}`;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;
  const invalid = Boolean(error);

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-ui font-medium text-text-primary">
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        className={cn(
          CONTROL_BASE,
          invalid ? CONTROL_BORDER_ERROR : CONTROL_BORDER_DEFAULT,
          CONTROL_DISABLED,
          CONTROL_FOCUS,
          className,
        )}
        aria-invalid={invalid || undefined}
        aria-describedby={message ? messageId : undefined}
        {...props}
      />

      {message ? (
        <p id={messageId} className={cn('text-caption', invalid ? 'text-danger-600' : 'text-text-secondary')}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
