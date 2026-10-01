/**
 * 设计令牌 — 语义别名与预置组合
 *
 * 规范见 `.rudder/design/visual.md`。色值的**唯一来源**是 `src/index.css` 的 `@theme`，
 * 本文件只导出由令牌生成的 utility class 组合，不含任何色值字面量。
 *
 * 用途：把高频组合固化成常量，避免 class 字符串散落在各页面里，
 * 从而保证「同类元素在不同 REQ 中外观完全一致」。
 */

/* ---------------------------------------------------------------------------
 * 当前生效预设
 * ------------------------------------------------------------------------- */

/** 预设包标识，记录在 `requirements/MASTER-PRD.md` §1 */
export type StylePreset = 'P1' | 'P2' | 'P3' | 'BRAND';

export const CURRENT_PRESET: StylePreset = 'P1';

/* ---------------------------------------------------------------------------
 * 语义别名
 *
 * 用命名指向具体的 utility class，使业务代码读起来是「意图」而非「样式」。
 * ------------------------------------------------------------------------- */

export const text = {
  title: 'text-title',
  subtitle: 'text-subtitle',
  body: 'text-body',
  caption: 'text-caption',
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  inverse: 'text-text-inverse',
  brand: 'text-brand-600',
  danger: 'text-danger-600',
  success: 'text-success-600',
  warning: 'text-warning-600',
} as const;

export const surface = {
  page: 'bg-surface-page',
  card: 'bg-surface-card',
} as const;

export const border = {
  base: 'border-border-base',
  strong: 'border-border-strong',
} as const;

export const brand = {
  soft: 'bg-brand-50',
  base: 'bg-brand-600',
  hover: 'bg-brand-700',
  text: 'text-brand-600',
} as const;

/* ---------------------------------------------------------------------------
 * 预置组合
 *
 * 同类元素必须复用这里的常量，不要在页面里重新拼 class。
 * 新增组合时判断它是否具备通用性——具备则加到这里，而不是留在单个 REQ 里。
 * ------------------------------------------------------------------------- */

/** 按钮 */
export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-body font-medium ' +
  'bg-brand-600 text-text-inverse transition-colors hover:bg-brand-700 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ' +
  'disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-text-muted';

export const BTN_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-body font-medium ' +
  'bg-surface-card text-text-primary border border-border-base transition-colors ' +
  'hover:bg-surface-page hover:border-border-strong ' +
  'disabled:cursor-not-allowed disabled:text-text-muted';

export const BTN_DANGER =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-body font-medium ' +
  'bg-danger-600 text-text-inverse transition-colors hover:opacity-90 ' +
  'disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-text-muted';

/** 容器 */
export const CARD =
  'bg-surface-card border border-border-base rounded-lg p-card shadow-sm';

export const PAGE_SHELL = 'min-h-screen bg-surface-page text-text-primary';

export const PAGE_CONTENT = 'mx-auto w-full max-w-7xl px-page py-section';

/** 表单 */
export const INPUT =
  'w-full rounded-md border border-border-base bg-surface-card px-3 py-2 text-body ' +
  'text-text-primary placeholder:text-text-muted ' +
  'focus:border-brand-600 focus:outline-2 focus:outline-offset-0 focus:outline-brand-600';

/** 语义色容器 */
export const ALERT_ERROR = 'rounded-md border border-danger-600/30 border-l-4 border-l-danger-600 bg-surface-card p-card';
export const ALERT_SUCCESS = 'rounded-md border border-success-600/30 border-l-4 border-l-success-600 bg-surface-card p-card';
export const ALERT_WARNING = 'rounded-md border border-warning-600/30 border-l-4 border-l-warning-600 bg-surface-card p-card';