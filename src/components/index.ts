/**
 * 通用组件出口。UI 层一律从 `@/components` 引入，不直接引用具体文件路径。
 *
 * 复用规则见 .rudder/design/visual.md §6.2：
 * 同类交互元素必须复用本目录下的组件；确需新建须在 implement.md 说明理由。
 *
 * 待补（按需再加，不要预先造无人使用的组件）：
 *   Modal / Select / Tabs —— 用 @radix-ui headless 原语承载行为，外观自绘
 *   Badge / Pagination / Toast
 */

export { Button } from '@/components/Button';
export { Card } from '@/components/Card';
export { EmptyState } from '@/components/EmptyState';
export { ErrorState } from '@/components/ErrorState';
export { Input } from '@/components/Input';
export { PlaceholderImage } from '@/components/PlaceholderImage';
export { Skeleton, SkeletonRows } from '@/components/Skeleton';
export { Table } from '@/components/Table';
export type { TableColumn } from '@/components/Table';