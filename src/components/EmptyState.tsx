import type { ReactNode } from 'react';

import { text } from '@/design/tokens';

interface EmptyStateProps {
  /** 场景说明（简体中文），如「还没有供应商」 */
  title: string;
  /** 下一步引导（简体中文），如「点击右上角『添加供应商』开始」 */
  description?: string;
  /** 引导操作，如放置一个 Button */
  action?: ReactNode;
  /** 关闭插画，使用纯文字布局 */
  plain?: boolean;
}

/**
 * 空状态。**取数 UI 的 Empty 态必须使用本组件**。
 * 插画为统一的一套本地 SVG，禁止每个页面现画（风格必然漂移）。
 */
export function EmptyState({ title, description, action, plain = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {!plain && (
        <svg
          aria-hidden="true"
          viewBox="0 0 96 72"
          className="mb-4 h-18 w-24 text-brand-100"
          fill="none"
        >
          <rect x="8" y="12" width="80" height="52" rx="6" stroke="currentColor" strokeWidth="2" />
          <path d="M8 26h80" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="19" r="2" fill="currentColor" />
          <circle cx="26" cy="19" r="2" fill="currentColor" />
          <path d="M28 50l12-14 10 11 7-8 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <p className={`${text.subtitle} text-text-primary`}>{title}</p>
      {description && <p className={`${text.caption} mt-1.5 max-w-md text-text-muted`}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}