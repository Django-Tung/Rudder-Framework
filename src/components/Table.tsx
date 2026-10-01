import type { ReactNode } from 'react';

export interface TableColumn<T> {
  /** 列标题（简体中文） */
  key: string;
  title: string;
  /** 自定义单元格渲染；未提供时直接渲染该字段 */
  render?: (row: T) => ReactNode;
  /** 数值列右对齐 */
  align?: 'left' | 'right';
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  /** 行的唯一键 */
  rowKey: (row: T) => string;
  /** 表格下方的一行说明文字（中文），如「共 N 条」 */
  footer?: ReactNode;
}

const ALIGN_CLASS = {
  left: 'text-left',
  right: 'text-right',
} as const;

/**
 * 通用表格。列宽由内容自适应，窄屏下由使用方决定改表格还是转卡片列表
 * （响应式是否为硬要求见 plan.md 的「响应式要求」条目）。
 */
export function Table<T>({ columns, rows, rowKey, footer }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-border-base bg-surface-page">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`${ALIGN_CLASS[col.align ?? 'left']} whitespace-nowrap px-4 py-3 text-caption font-medium text-text-secondary ${col.className ?? ''}`.trim()}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border-base last:border-0">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${ALIGN_CLASS[col.align ?? 'left']} px-4 py-3 text-text-primary ${col.className ?? ''}`.trim()}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer && (
        <div className="border-t border-border-base px-4 py-3 text-caption text-text-muted">
          {footer}
        </div>
      )}
    </div>
  );
}