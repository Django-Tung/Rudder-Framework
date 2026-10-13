/**
 * 零依赖的 className 合并工具。
 *
 * 为什么不用 `clsx` + `tailwind-merge`：
 * 本工程禁止引入清单外依赖（`.rudder/constitution.md` §2），而这两个包只解决
 * 「class 字符串拼接」和「冲突消解」两件事，代价是给一个原型工程加两个运行时依赖。
 *
 * ⚠️ 已知代价（必须靠约定弥补）：本函数**不解析 Tailwind 类冲突**。
 * `cn('px-4', 'px-6')` 的结果是两个类都在，谁生效取决于 CSS 输出顺序，不可预期。
 * 因此组件内部遵循两条约定（见 `requirements/REQ-001-design-foundation/plan.md` §5.3）：
 *   1. 同一维度（同一组颜色 / 间距 / 圆角）在基类与变体里**只能声明一次**；
 *      需要二选一时写成互斥表达式，如 `error ? CONTROL_BORDER_ERROR : CONTROL_BORDER_DEFAULT`。
 *   2. 尺寸与形态差异一律通过 `variant` / `size` 表达，不靠调用方用 `className` 覆盖。
 */

/** 允许传入的「类名片段」——假值用于条件表达式，如 `active && 'bg-brand-50'` */
export type ClassValue = string | false | null | undefined;

/**
 * 拼接类名，过滤掉 false / null / undefined。
 *
 * @example
 * cn('rounded-md', isActive && 'bg-brand-50', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}
