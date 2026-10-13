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

export interface ITextareaProps extends ComponentPropsWithRef<'textarea'> {
  /** 字段标签。传入后会自动与文本域通过 `htmlFor` 关联 */
  label?: string;
  /** 错误提示。语义与 `Input` 完全一致，保证两个控件的错误态外观相同 */
  error?: string;
  /** 辅助说明。与 `error` 互斥展示，错误优先 */
  hint?: string;
}

/** 多行输入框。四态与错误提示规则与 `Input` 一致，只是换成了 `textarea` */
export function Textarea({ label, error, hint, className, id, rows = 3, ...props }: ITextareaProps) {
  const autoId = useId();
  const textareaId = id ?? `textarea-${autoId}`;
  const messageId = `${textareaId}-message`;
  const message = error ?? hint;
  const invalid = Boolean(error);

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={textareaId} className="text-ui font-medium text-text-primary">
          {label}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          CONTROL_BASE,
          invalid ? CONTROL_BORDER_ERROR : CONTROL_BORDER_DEFAULT,
          CONTROL_DISABLED,
          CONTROL_FOCUS,
          'resize-y',
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
