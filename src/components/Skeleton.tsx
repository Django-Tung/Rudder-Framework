import type { HTMLAttributes } from 'react';

import { TABLE_ROW } from '@/design/tokens';
import { cn } from '@/lib/cn';

/**
 * 骨架块。
 *
 * 尺寸由调用方通过 `className` 给出。表格的骨架行**必须**复用
 * `TABLE_ROW`（`src/design/tokens.ts`）作为行高，否则加载态与正常态之间会跳变（AC-8）。
 *
 * `motion-reduce:animate-none`：开启动效减弱时退化为静态灰块。
 * 闪动的骨架屏对前庭敏感人群不友好，且此时「在加载」的语义已由 `aria-busy` 承载。
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-sm bg-border-base motion-reduce:animate-none', className)}
      {...props}
    />
  );
}

export interface ISkeletonRowsProps {
  /** 骨架行数，通常等于首屏可见行数 */
  rows?: number;
  /**
   * 每行各占位块的宽度类，按列数给几段即可。**最后一段会自动贴右**，
   * 与表格里数值列右对齐的观感一致。
   */
  widths?: readonly string[];
  /** 屏幕阅读器播报文案 */
  label?: string;
  className?: string;
}

/** 默认形状：五列，最后一段是右对齐的窄块（对应「进度」这类数值列） */
const DEFAULT_WIDTHS = ['w-40', 'w-24', 'w-20', 'w-16', 'w-12'] as const;

/**
 * 数据表的加载骨架。
 *
 * 取数 UI 的 Loading 态一律用它，不要手搓 `animate-pulse` 的 div 数组——
 * 手搓的版本会各自挑行高，于是加载态与正常态高度不一致，切换时整块区域跳动。
 * 本组件用 `TABLE_ROW` 与真实数据行共用同一个行高常量，从结构上杜绝这种跳变（AC-8）。
 *
 * 渲染成表格形状而不是转圈图标：骨架能表达「这里会出现几列、每列多宽」，
 * 转圈图标不能，且骨架能避免数据到达时的布局二次计算。
 */
export function SkeletonRows({
  rows = 5,
  widths = DEFAULT_WIDTHS,
  label = '正在加载',
  className,
}: ISkeletonRowsProps) {
  return (
    <div className={cn('w-full', className)} aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_unused, rowIndex) => (
        <div key={rowIndex} className={cn(TABLE_ROW, 'flex items-center gap-4 px-4')}>
          {widths.map((width, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn(
                'h-4',
                width,
                columnIndex === widths.length - 1 && 'ml-auto',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
