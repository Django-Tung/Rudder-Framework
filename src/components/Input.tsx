import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';

import { INPUT } from '@/design/tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** 校验错误提示（简体中文），传入即进入错误态 */
  error?: string;
  /** 字段下方的辅助说明（简体中文） */
  hint?: string;
  /** 自定义右侧内容，如字数计数 */
  addon?: ReactNode;
}

/**
 * 通用输入框，自带标签 / 错误 / 辅助说明三态。
 * 同类表单控件必须复用本组件。
 */
export function Input({ label, error, hint, addon, className = '', id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-body text-text-secondary">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={`${INPUT} ${error ? 'border-danger-600' : ''} ${addon ? 'pr-16' : ''} ${className}`.trim()}
          {...rest}
        />
        {addon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-muted">
            {addon}
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-caption text-danger-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-caption text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}