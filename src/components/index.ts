/**
 * 第一层通用组件统一出口。
 *
 * 业务代码一律 `import { Button, Table } from '@/components'`，
 * 不要深入单个文件路径——这样以后把组件拆成目录（例如 `Button/index.tsx`）
 * 不会波及所有调用点。
 *
 * 组件清单与划分依据见 `.rudder/design/visual.md` §6.1。
 *
 * 本目录内容来自「应急预案与演练系统」工程 REQ-001（视觉基座）的已验收成果，
 * 是 6.1 节列出的第一层 14 个组件的完整实现。上游后续若再改这些组件，
 * 两边都需同步；改之前先确认目标工程没有对同名文件做过本地改动。
 */

export { Badge } from './Badge';
export type { IBadgeProps } from './Badge';

export { Button } from './Button';
export type { IButtonProps } from './Button';

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card';

export { EmptyState } from './EmptyState';
export type { IEmptyStateProps } from './EmptyState';

export { ErrorState } from './ErrorState';
export type { IErrorStateProps } from './ErrorState';

export { Input } from './Input';
export type { IInputProps } from './Input';

export {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalTitle,
  ModalTrigger,
} from './Modal';

export { Pagination } from './Pagination';
export type { IPaginationProps } from './Pagination';

// 本项目独有的本地占位图，无外链依赖（.rudder/design/assets.md）。
// REQ-001 的组件集里没有它，是从本工程的旧版保留下来的，勿在同步上游成果时删掉。
export { PlaceholderImage } from './PlaceholderImage';

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Select';

export { Skeleton, SkeletonRows } from './Skeleton';
export type { ISkeletonRowsProps } from './Skeleton';

export { Table } from './Table';
export type { ITableProps } from './Table';

export { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

export { Textarea } from './Textarea';
export type { ITextareaProps } from './Textarea';

export { ToastProvider } from './Toast';
export { DEFAULT_TOAST_DURATION, useToast } from './toast-context';
export type { IToastApi } from './toast-context';
