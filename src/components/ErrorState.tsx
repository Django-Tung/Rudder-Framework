import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/Button';
import { text } from '@/design/tokens';

interface ErrorStateProps {
  /** 面向用户的中文错误说明，如「加载供应商失败，请稍后重试」 */
  message: string;
  /** 是否提供「重试」按钮 */
  onRetry?: () => void;
  /** 重试中的文案 */
  retrying?: boolean;
}

/**
 * 错误状态。**取数 UI 的 Error 态必须使用本组件**。
 * 文案必须为简体中文，且**不得**暴露技术细节（状态码、堆栈、字段名）。
 */
export function ErrorState({ message, onRetry, retrying = false }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-md border border-l-4 border-danger-600/30 border-l-danger-600 bg-surface-card px-6 py-10 text-center"
    >
      <AlertCircle aria-hidden="true" className="mb-3 size-8 text-danger-600" />
      <p className={`${text.body} text-text-primary`}>{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={onRetry}
          disabled={retrying}
        >
          <RefreshCw aria-hidden="true" className={`size-4 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? '重试中' : '重试'}
        </Button>
      )}
    </div>
  );
}