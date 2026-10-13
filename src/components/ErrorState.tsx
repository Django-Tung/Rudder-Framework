import { TriangleAlert } from 'lucide-react';

import { Button } from '@/components/Button';
import { ALERT_ERROR } from '@/design/tokens';
import { cn } from '@/lib/cn';

export interface IErrorStateProps {
  /** 具体原因，用简体中文说清楚「什么失败了」，不要只写「出错了」 */
  message: string;
  /** 简短标题，默认「加载失败」 */
  title?: string;
  /** 重试回调。不传则不渲染重试按钮 */
  onRetry?: () => void;
  /** 重试按钮文案，默认「重试」 */
  retryText?: string;
  className?: string;
}

/**
 * 请求失败状态。
 *
 * 与 `EmptyState` 的区别：空态是「本来就没有数据」，错误态是「这次没取到」。
 * 因此错误态**必须**给出重试入口，否则使用者只能刷新整页。
 */
export function ErrorState({
  message,
  title = '加载失败',
  onRetry,
  retryText = '重试',
  className,
}: IErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        ALERT_ERROR,
        'flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <TriangleAlert className="size-5 shrink-0 text-danger-600" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-body font-medium text-text-primary">{title}</p>
          <p className="text-body text-text-secondary">{message}</p>
        </div>
      </div>

      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      ) : null}
    </div>
  );
}
