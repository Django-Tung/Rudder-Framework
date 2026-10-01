import { border } from '@/design/tokens';

interface SkeletonProps {
  className?: string;
}

/** 单条骨架占位块 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sm bg-brand-50 ${className}`.trim()}
    />
  );
}

interface SkeletonRowsProps {
  /** 行数，通常等于首屏可见行数 */
  rows?: number;
  /** 每行左侧是否带圆形头像位 */
  avatar?: boolean;
}

/**
 * 列表加载骨架。**取数 UI 的 Loading 态必须使用本组件**，
 * 不允许用「转圈图标」代替骨架（骨架能表达内容结构，spinner 不能）。
 */
export function SkeletonRows({ rows = 6, avatar = false }: SkeletonRowsProps) {
  return (
    <div role="status" aria-label="正在加载" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`flex items-center gap-3 ${border.base} rounded-lg bg-surface-card p-4`}>
          {avatar && <Skeleton className="size-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
      <span className="sr-only">正在加载</span>
    </div>
  );
}