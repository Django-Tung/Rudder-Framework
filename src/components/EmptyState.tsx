import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface IEmptyStateProps {
  /** 主文案，必填——空状态没有文案等于没做 */
  title: string;
  /** 补充说明，例如「换个筛选条件再试」 */
  description?: string;
  /** 线性图标。不传则用默认的收件箱图标 */
  icon?: ReactNode;
  /** 行动入口，通常是 `<Button>`。空状态的目的是给出下一步，而不是展示「没有数据」 */
  action?: ReactNode;
  className?: string;
}

/**
 * 空数据状态。
 *
 * 预置组件，所有列表/表格的空态都必须复用它，不要在页面里手写
 * 「暂无数据」一行字（`.rudder/design/visual.md` §6.2）。
 */
export function EmptyState({ title, description, icon, action, className }: IEmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 p-section text-center', className)}
    >
      <span
        className="flex size-12 items-center justify-center rounded-full bg-surface-page text-text-muted"
        aria-hidden
      >
        {icon ?? <Inbox className="size-6" />}
      </span>

      <div className="flex flex-col gap-1">
        <p className="text-subtitle text-text-primary">{title}</p>
        {description ? <p className="text-body text-text-secondary">{description}</p> : null}
      </div>

      {action}
    </div>
  );
}
