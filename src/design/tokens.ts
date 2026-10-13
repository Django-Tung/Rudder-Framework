/**
 * 设计令牌 — 语义别名与预置组合
 *
 * 规范见 `.rudder/design/visual.md`。色值的**唯一来源**是 `src/index.css` 的 `@theme`，
 * 本文件只导出由令牌生成的 utility class 组合，不含任何色值字面量。
 *
 * 用途：把高频组合固化成常量，避免 class 字符串散落在各页面里，
 * 从而保证「同类元素在不同 REQ 中外观完全一致」。
 */

import type { BadgeTone, ButtonSize, ButtonVariant, ToastTone } from '@/types/ui';

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
  /** 控件层字号（0.875rem）：按钮 / 输入框 / 下拉 / 页签 / 表格 / 分页 */
  ui: 'text-ui',
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
 * 组件片段
 *
 * 组件的 variant / size 只做「名称 → 片段」的映射，片段本身定义在这里，
 * 这样第一条定义只出现一次，组件与页面不会各写一份而慢慢漂移。
 * ------------------------------------------------------------------------- */

/** 所有可点控件共用的焦点环：2px brand-500 描边，键盘可见、鼠标点击不出现 */
export const CONTROL_FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';

/**
 * 可点控件的过渡属性。
 *
 * ⚠️ 不要用 `transition-colors`：Tailwind v4 的它**包含 `outline-color`**，
 * 会让焦点环在 150ms 内淡入。键盘用户连续 Tab 时几乎看不到它，
 * 而焦点指示器必须即时出现才有意义（AC-2 要求「键盘聚焦时显示 2px 焦点环」）。
 * 因此这里显式列出需要过渡的三个颜色属性，把 `outline-color` 排除在外。
 */
export const CONTROL_TRANSITION = 'transition-[color,background-color,border-color]';

/**
 * 焦点环的「静态版」——同样的描边，但持续显示。
 * 组件预览页用它把「聚焦态」平铺出来供一眼核对（AC-4），
 * 用的是与 `CONTROL_FOCUS` 同一套令牌，因此不会与真实聚焦态不一致。
 */
export const CONTROL_FOCUS_PREVIEW = 'outline-2 outline-offset-2 outline-brand-500';

/* ---- 按钮 ---- */

export const BTN_BASE =
  // ⚠️ 字号**不在基类里**，而在 `BTN_SIZE` 的每个档位里。`cn()` 不解析 Tailwind 冲突，
  // 基类写 `text-body`、档位再写 `text-ui` 会让两个 class 同时命中，谁生效取决于 CSS 输出顺序。
  // 同维度的样式只允许出现在一个地方。
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ' +
  // ⚠️ 1px 描边写在**基类**里、且每个变体都显式给出描边色，不能只让 secondary 带 `border`：
  // 否则只有 secondary 多占左右各 1px，四个变体并排时宽度会差 2px（肉眼可见的「不一样大」）。
  // 描边色必须逐变体写死——Tailwind v4 的 `border` 默认取 `currentColor`，
  // 主按钮的反白字会让描边变成白色。
  'border ' +
  'disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 ' +
  // 焦点环必须写在基类里：漏掉它时浏览器会回退到自带的 1px 焦点环，
  // 与 brand-500 的 2px 令牌环不一致（AC-2）。四个变体共用同一个基类，写在这里才不会漏。
  CONTROL_FOCUS +
  ' ' +
  CONTROL_TRANSITION;

/**
 * 两档尺寸。字号写在档位里（见 `BTN_BASE` 的说明），且两档各自显式给出：
 * `md` 用控件层的 `text-ui`（0.875rem，等同 shadcn 的 `text-sm`），
 * `sm` 用更小一档的 `text-caption`。
 */
export const BTN_SIZE: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-caption',
  md: 'h-8 px-3.5 text-ui',
};

export const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-brand-600 text-text-inverse hover:bg-brand-700',
  secondary:
    'border-border-base bg-surface-card text-text-primary hover:bg-surface-page hover:border-border-strong',
  // 危险色没有更深一档（预设只定义 danger-600），悬停用透明度而非自造色值
  danger: 'border-transparent bg-danger-600 text-text-inverse hover:opacity-90',
  ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-brand-50 hover:text-brand-700',
};

/**
 * 按钮尺寸说明：`loading` 态下组件把原文案保留在文档流中并叠一层「提交中」，
 * 因此按钮宽度由原文案决定、加载前后完全一致（AC-3 要求无位移）。
 */

/* ---- 表单控件 ---- */

export const CONTROL_BASE =
  'w-full rounded-md border bg-surface-card px-3 py-2 text-ui text-text-primary ' +
  'placeholder:text-text-muted ' +
  CONTROL_TRANSITION;

/** 默认描边 */
export const CONTROL_BORDER_DEFAULT = 'border-border-base';
/** 错误态描边。与默认描边**互斥使用**，不可同时传入（否则依赖 CSS 输出顺序） */
export const CONTROL_BORDER_ERROR = 'border-danger-600';

export const CONTROL_DISABLED =
  'disabled:cursor-not-allowed disabled:bg-surface-page disabled:text-text-muted';

/* ---- 标记 ---- */

export const BADGE_BASE =
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-caption font-medium';

export const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: 'border-border-base bg-surface-page text-text-secondary',
  success: 'border-transparent bg-success-600/10 text-success-600',
  warning: 'border-transparent bg-warning-600/10 text-warning-600',
  danger: 'border-transparent bg-danger-600/10 text-danger-600',
};

/* ---- 表格 ---- */

/**
 * 表头与行高。
 * ⚠️ 行高是**契约的一部分**：`Skeleton` 骨架行必须复用 `TABLE_ROW`，
 * 否则加载态与正常态之间会跳变（AC-8）。
 */
export const TABLE_HEAD = 'h-10 px-4 text-left align-middle font-medium text-text-secondary';
export const TABLE_ROW = 'h-11 border-b border-border-base';

/**
 * 表格区域的最小高度。
 *
 * 取值依据（46rem = 736px）：正常态的实际内容高度约为
 *   内容内边距 2rem×2（64）+ 表头 41 + 12 行 × 45（540）+ 分页条 77 ≈ 722px。
 * 加载态只画 5 行骨架（约 284px）、空/错误态只有一小块内容，靠这个下限把区域撑到
 * 与正常态**同一高度**——这就是 AC-8「切换过程中表格区域高度不跳变」的实现方式。
 *
 * ⚠️ 这个值必须 ≥ 正常态的实际高度，否则它就不是下限而是「永远生效的固定值」，
 * 四种状态之间照样会跳。改动正常态的表格行数或行高时，请一并复核此值。
 */
export const TABLE_AREA = 'min-h-[46rem]';

/* ---- 轻提示 ---- */

export const TOAST_TONE: Record<ToastTone, string> = {
  success: 'border-success-600/40 bg-surface-card text-text-primary',
  warning: 'border-warning-600/40 bg-surface-card text-text-primary',
  danger: 'border-danger-600/40 bg-surface-card text-text-primary',
};

export const TOAST_ICON_TONE: Record<ToastTone, string> = {
  success: 'text-success-600',
  warning: 'text-warning-600',
  danger: 'text-danger-600',
};

/* ---------------------------------------------------------------------------
 * 预置组合
 *
 * 同类元素必须复用这里的常量，不要在页面里重新拼 class。
 * 新增组合时判断它是否具备通用性——具备则加到这里，而不是留在单个 REQ 里。
 * ------------------------------------------------------------------------- */

/** 按钮（`md` 尺寸的四个变体，供不便用 `<Button>` 组件的场景直接取用） */
export const BTN_PRIMARY = [BTN_BASE, BTN_SIZE.md, BTN_VARIANT.primary].join(' ');
export const BTN_SECONDARY = [BTN_BASE, BTN_SIZE.md, BTN_VARIANT.secondary].join(' ');
export const BTN_DANGER = [BTN_BASE, BTN_SIZE.md, BTN_VARIANT.danger].join(' ');

/**
 * 文字按钮：无边框、无底色，用于表格行内操作等「不该抢视觉」的入口。
 * 不走 `BTN_VARIANT`，因为它的字形规则与四个变体不同（下划线、无高度约束）。
 */
export const BTN_LINK =
  'inline-flex items-center justify-center gap-1 rounded-sm font-medium text-brand-600 ' +
  'underline-offset-2 transition-colors hover:text-brand-700 hover:underline ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ' +
  'disabled:cursor-not-allowed disabled:text-text-muted disabled:no-underline';

/** 容器 */
export const CARD = 'bg-surface-card border border-border-base rounded-lg shadow-sm';

export const PAGE_SHELL = 'min-h-screen bg-surface-page text-text-primary';

export const PAGE_CONTENT = 'mx-auto w-full max-w-7xl px-page py-section';

/**
 * 分组容器：桌面 2rem 内边距，窄屏收窄为 1.5rem 为内容让出宽度。
 * 这是 AC-17「窄屏内边距由 p-section 收窄为 p-card」的那一处。
 */
export const SECTION_BLOCK = 'p-card md:p-section';

/** 表单（默认态组合；错误态请用 `CONTROL_BASE` + `CONTROL_BORDER_ERROR` 自行组合） */
export const INPUT = [CONTROL_BASE, CONTROL_BORDER_DEFAULT, CONTROL_DISABLED].join(' ');
export const INPUT_ERROR = CONTROL_BORDER_ERROR;

/** 语义色容器 */
export const ALERT_ERROR =
  'rounded-md border border-danger-600/30 border-l-4 border-l-danger-600 bg-surface-card p-card';
export const ALERT_SUCCESS =
  'rounded-md border border-success-600/30 border-l-4 border-l-success-600 bg-surface-card p-card';
export const ALERT_WARNING =
  'rounded-md border border-warning-600/30 border-l-4 border-l-warning-600 bg-surface-card p-card';

/* ---------------------------------------------------------------------------
 * 令牌色板清单
 *
 * 组件预览页据此逐项读取 `@theme` 的真实取值并显示十六进制值（AC-1）。
 * 这里只写**变量名**，不写色值——色值仍然只在 `src/index.css` 里存在一份。
 * ------------------------------------------------------------------------- */

export interface IColorToken {
  /** CSS 变量名，如 `--color-brand-600` */
  name: string;
  /** 展示用短名，如 `brand-600` */
  label: string;
  /** 用途说明，写在色板下方 */
  usage: string;
}

export const COLOR_SWATCHES: readonly IColorToken[] = [
  { name: '--color-brand-50', label: 'brand-50', usage: '品牌浅底（幽灵按钮悬停）' },
  { name: '--color-brand-100', label: 'brand-100', usage: '品牌浅底次级' },
  { name: '--color-brand-500', label: 'brand-500', usage: '焦点环' },
  { name: '--color-brand-600', label: 'brand-600', usage: '主色 / 主按钮底色' },
  { name: '--color-brand-700', label: 'brand-700', usage: '主按钮悬停' },
  { name: '--color-surface-page', label: 'surface-page', usage: '页面底色' },
  { name: '--color-surface-card', label: 'surface-card', usage: '卡片 / 表面' },
  { name: '--color-border-base', label: 'border-base', usage: '常规描边' },
  { name: '--color-border-strong', label: 'border-strong', usage: '加重描边' },
  { name: '--color-text-primary', label: 'text-primary', usage: '正文主色 / 遮罩' },
  { name: '--color-text-secondary', label: 'text-secondary', usage: '次要文字' },
  { name: '--color-text-muted', label: 'text-muted', usage: '占位符 / 禁用（不可用于正文）' },
  { name: '--color-text-inverse', label: 'text-inverse', usage: '深底上的反白文字' },
  { name: '--color-danger-600', label: 'danger-600', usage: '危险 / 错误' },
  { name: '--color-success-600', label: 'success-600', usage: '成功' },
  { name: '--color-warning-600', label: 'warning-600', usage: '警告' },
];
