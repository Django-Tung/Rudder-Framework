import type { ReactNode } from 'react';

import { TABLE_HEAD, TABLE_ROW } from '@/design/tokens';
import { cn } from '@/lib/cn';
import type { ColumnAlign, IColumn } from '@/types/ui';

const ALIGN: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/** 单元格取值：只渲染可读的原始值，其余一律降级为字符串，避免 `[object Object]` 之外的意外 */
function renderCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' || typeof value === 'number') return value;
  return String(value);
}

export interface ITableProps<T> {
  /** 列定义。数值列记得显式传 `align: 'right'`（AC-7） */
  columns: readonly IColumn<T>[];
  rows: readonly T[];
  /** 行唯一键，用于 React key */
  rowKey: (row: T) => string;
  /** 表格说明，仅供屏幕阅读器 */
  caption?: string;
  className?: string;
}

/**
 * 数据表格。
 *
 * 两点是契约、不是实现细节：
 *   1. 行高来自 `TABLE_ROW` 常量——骨架屏复用同一个常量才能保证加载态不跳变（AC-8）；
 *   2. 外层 `overflow-x-auto` + 单元格 `whitespace-nowrap`——窄屏靠横向滚动看全列，
 *      **不折叠成卡片**（AC-17）。折叠卡片会丢掉列之间的可比性，对数据表是负优化。
 */
export function Table<T>({ columns, rows, rowKey, caption, className }: ITableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-ui">
        {caption ? <caption className="sr-only">{caption}</caption> : null}

        <thead>
          <tr className="border-b border-border-base">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  TABLE_HEAD,
                  ALIGN[column.align ?? 'left'],
                  'whitespace-nowrap',
                  column.width,
                )}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className={cn(TABLE_ROW, 'transition-colors hover:bg-surface-page')}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 align-middle whitespace-nowrap text-text-primary',
                    ALIGN[column.align ?? 'left'],
                  )}
                >
                  {column.render ? column.render(row) : renderCell(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
