import type { ReactNode } from 'react';

/**
 * 第一层通用组件的对外契约（`src/components/`）。
 *
 * 契约优先：先定义本文件，再由 mocks / services / UI 消费。
 * 后续所有业务 REQ 都应 import 这里的类型，而不是各自重新声明一套。
 */

/** 按钮变体。`primary` 主操作、`secondary` 次操作、`danger` 破坏性操作、`ghost` 低视觉权重入口 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/** 按钮尺寸。`sm` 用于表格行内与工具栏，`md` 为默认 */
export type ButtonSize = 'sm' | 'md';

/** 标记色调。用于状态、类别等碎片信息的语义着色 */
export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

/** 状态语义色，语义与 `BadgeTone` 一致，供表格、列表等复用 */
export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger';

/** 轻提示色调。只有「非阻塞」消息才用 Toast，阻塞性错误用 `ErrorState` */
export type ToastTone = 'success' | 'warning' | 'danger';

/** `useToast().show()` 的入参 */
export interface IToastOptions {
  /** 语义色调，决定图标与描边颜色 */
  tone: ToastTone;
  /** 简体中文文案 */
  message: string;
  /** 自动消失毫秒数，默认 3000 */
  duration?: number;
}

/** 单条轻提示实例（由 Provider 内部生成 id） */
export interface IToastItem extends IToastOptions {
  id: number;
}

/** 对齐方式。文本列用 `left`，数值列必须用 `right`（见 plan.md AC-7） */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * 表格列定义。`T` 为行数据类型。
 *
 * `key` 既是取值键，也是 React key 的组成部分，因此要求是 `T` 上的字符串键。
 */
export interface IColumn<T> {
  /** 取值键，必须存在于 `T` 上 */
  key: keyof T & string;
  /** 表头中文标题 */
  title: string;
  /** 默认 `left` */
  align?: ColumnAlign;
  /** Tailwind 宽度类（如 `w-32`）；不传则按内容自适应 */
  width?: string;
  /**
   * 自定义单元格渲染。不传则直接渲染该键的原始值。
   *
   * 用途是给数值加上单位或换成 `<Badge>`，同时保住 `align` 的对齐规则——
   * 若让页面自己拼整张表，对齐规则就会在每个页面里各写一遍。
   */
  render?: (row: T) => ReactNode;
}

/** 分页受控参数。由页面持有，组件只负责渲染与回调 */
export interface IPagination {
  /** 当前页，从 1 开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 总条数 */
  total: number;
}
