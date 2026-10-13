import type { HTMLAttributes } from 'react';

import { BADGE_BASE, BADGE_TONE } from '@/design/tokens';
import { cn } from '@/lib/cn';
import type { BadgeTone } from '@/types/ui';

export interface IBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 默认 `neutral`。语义只有四种，不要为了「好看」新增色调 */
  tone?: BadgeTone;
}

/**
 * 状态标记。
 *
 * 文字用 `text-caption`、圆角用 `rounded-md`（AC-6），因此表格、列表、卡片里的
 * 标记尺寸天然一致，不需要各处再调。
 */
export function Badge({ tone = 'neutral', className, ...props }: IBadgeProps) {
  return <span className={cn(BADGE_BASE, BADGE_TONE[tone], className)} {...props} />;
}
