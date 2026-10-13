import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';
import type { IPagination } from '@/types/ui';

export interface IPaginationProps extends IPagination {
  /** 页码变化回调。组件是受控的，自身不保存页码 */
  onChange: (page: number) => void;
  className?: string;
}

/** 生成 1..totalPages 的页码数组 */
function buildPages(totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_unused, index) => index + 1);
}

/**
 * 分页控件。
 *
 * 受控组件：页码由页面持有，翻页只是回调。这样「表格数据」与「当前页」永远同源，
 * 不会出现页码跳了但数据没换的中间态。
 *
 * 边界禁用（首页禁用「上一页」、末页禁用「下一页」）不只是防呆——
 * 让不可用操作保持可点，使用者会以为点了没反应。
 */
export function Pagination({ page, pageSize, total, onChange, className }: IPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // 数据量变化后当前页可能越界，钳制到合法范围（例如从 24 条切到空列表再切回来）
  const currentPage = Math.min(Math.max(1, page), totalPages);

  return (
    <nav
      aria-label="分页"
      className={cn('flex flex-wrap items-center justify-center gap-2', className)}
    >
      <Button
        variant="secondary"
        size="sm"
        icon={<ChevronLeft className="size-4" aria-hidden />}
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
      >
        上一页
      </Button>

      {buildPages(totalPages).map((pageNumber) => {
        const isCurrent = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            variant={isCurrent ? 'primary' : 'secondary'}
            size="sm"
            // `tabular-nums`：让每个数字占等宽，否则「1」比「2」窄 1px，
            // 页码按钮会一个宽一个窄（等宽数字是数字列的标准做法）。
            className="tabular-nums"
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`第 ${pageNumber} 页`}
            onClick={() => onChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        );
      })}

      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        下一页
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </nav>
  );
}
