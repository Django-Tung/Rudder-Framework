import type { HTMLAttributes } from 'react';

import { CARD } from '@/design/tokens';
import { cn } from '@/lib/cn';

/**
 * 卡片容器。
 *
 * 用 `CARD` 常量而非本地拼 class，是为了保证「卡片」在全站只有一种外观
 * （`.rudder/design/visual.md` §6.2 强制复用条款）。
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(CARD, className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-card', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-subtitle text-text-primary', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-caption text-text-secondary', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-card pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-2 p-card pt-0', className)} {...props} />;
}
