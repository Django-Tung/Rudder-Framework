/**
 * ⚠️ 演示专用契约 —— 仅组件预览页（`/design`）使用，**不是业务契约**。
 *
 * 依据 `requirements/REQ-001-design-foundation/plan.md` §1 非目标：
 * 后续业务 REQ 必须定义自己的 types / mocks，**不得**依赖本文件的结构，
 * 否则本 REQ 的演示数据会变成事实上的业务契约，无法演进。
 *
 * 字段口径来自 `requirements/MASTER-PRD.md` §2「业务场景与假数据基线」。
 */

/** 预览页可切换的四种展示状态 */
export type DemoState = 'loading' | 'success' | 'empty' | 'error';

/** 演示用的演练任务行 */
export interface IDemoDrillTask {
  id: string;
  /** 演练任务名，围绕「2027 年第二季度 危化品储罐泄漏事故应急演练」 */
  name: string;
  /** 责任机构，取 MASTER-PRD §2 的真实机构名 */
  department: string;
  /** 时限，真实感数值：报告类 5 分钟 / 处置类 15 分钟 / 保障类 30 分钟 */
  deadline: string;
  /** 状态词，取 MASTER-PRD §2 的真实流转形态（待接收 → 已接收 → 执行中 → 已提交 → 已核验） */
  status: string;
  /** 进度百分比，整数 */
  progress: number;
}
