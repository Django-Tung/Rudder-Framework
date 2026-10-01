/**
 * 本地占位图——**本项目唯一的图片占位出口**。
 *
 * 为什么不用占位图服务：原型要在会议室投屏下演示，网络不可靠。
 * 外链图裂当场就是演示事故，因此一律本地生成（见 .rudder/design/assets.md）。
 *
 * 无依赖、纯 SVG；配色取自设计令牌（通过 currentColor），不含任何色值字面量。
 */

interface PlaceholderImageProps {
  /** 语义标签（中文短词），用于生成可辨识且**可复现**的几何图形 */
  label: string;
  /** 尺寸比例 */
  ratio?: '1:1' | '4:3' | '16:9';
  /** 用户提供的本地图片路径；存在时优先渲染真实图片 */
  src?: string;
  className?: string;
}

const RATIO_CLASS = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
} as const;

/** 由字符串派生的确定性种子——保证同一 label 每次渲染出同样的图形 */
function seedOf(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) % 9973;
  }
  return hash;
}

/** 四种基础图形，按种子轮换——足以让列表里的占位图有变化又不杂乱 */
function Motif({ seed }: { seed: number }) {
  switch (seed % 4) {
    case 0:
      return (
        <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
          <circle cx="40" cy="36" r="18" />
          <path d="M20 68c4-12 12-18 20-18s16 6 20 18" />
        </g>
      );
    case 1:
      return (
        <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinejoin="round">
          <rect x="18" y="22" width="44" height="34" rx="4" />
          <path d="M26 50l10-12 8 9 6-7 10 12" strokeLinecap="round" />
        </g>
      );
    case 2:
      return (
        <g stroke="currentColor" strokeWidth="6" fill="none">
          <rect x="20" y="26" width="40" height="28" rx="4" />
          <path d="M20 34h40M32 62h16" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
          <path d="M40 16l6 14 15 2-11 10 3 15-13-8-13 8 3-15-11-10 15-2z" />
        </g>
      );
  }
}

export function PlaceholderImage({ label, ratio = '4:3', src, className = '' }: PlaceholderImageProps) {
  const seed = seedOf(label);

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={`${RATIO_CLASS[ratio]} w-full rounded-md object-cover ${className}`.trim()}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={`${RATIO_CLASS[ratio]} flex w-full items-center justify-center overflow-hidden rounded-md border border-border-base bg-surface-page text-brand-100 ${className}`.trim()}
    >
      <svg viewBox="0 0 80 80" className="h-1/2 w-1/2" aria-hidden="true">
        <Motif seed={seed} />
      </svg>
    </div>
  );
}