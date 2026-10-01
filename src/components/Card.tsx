import type { HTMLAttributes, ReactNode } from 'react';

import { CARD } from '@/design/tokens';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** 卡片标题（简体中文） */
  title?: string;
  /** 标题右侧的操作区 */
  extra?: ReactNode;
  /** 去除内边距，用于内嵌表格的场景 */
  flush?: boolean;
}

/**
 * 通用卡片容器。同类容器必须复用本组件。
 */
export function Card({ title, extra, flush = false, className = '', children, ...rest }: CardProps) {
  return (
    <div className={`${CARD} ${flush ? 'p-0' : ''} ${className}`.trim()} {...rest}>
      {title && (
        <div className={`flex items-center justify-between ${flush ? 'px-card py-4' : ''}`}>
          <h3 className="text-subtitle text-text-primary">{title}</h3>
          {extra}
        </div>
      )}
      {children}
    </div>
  );
}