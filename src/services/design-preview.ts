/**
 * 组件预览页的取数接口。
 *
 * 架构约定（`.rudder/constitution.md`）：
 *   - UI 只能调 `src/services/`，**不得**直接 import `src/mocks/`；
 *   - Service 一律返回 `Promise`，并用 `setTimeout` 模拟 300–800ms 网络延迟；
 *   - 不接真实后端（`requirements/MASTER-PRD.md` §3「集成口径：全部模拟」）。
 */

import { DEMO_DRILL_TASKS } from '@/mocks/design-preview';
import type { DemoState, IDemoDrillTask } from '@/types/design-preview';

/** 请求失败时的中文文案，与 `ErrorState` 展示的文案同源 */
export const DEMO_REQUEST_ERROR_MESSAGE = '加载演练记录失败，请稍后重试';

const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

/** 300–800ms 随机延迟，模拟真实网络的抖动而非固定耗时 */
function randomDelayMs(): number {
  return MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * 预览页四种展示状态到「请求结果」的映射。
 *
 * `loading` 与 `success` 都解析为同一批数据：`loading` 的语义是「重新走一遍请求过程」，
 * 让使用者看见骨架屏 → 300–800ms 后数据替换骨架（AC-8），而不是把骨架永久钉住。
 */
const RESOLVE_MODE: Record<DemoState, 'success' | 'empty' | 'error'> = {
  loading: 'success',
  success: 'success',
  empty: 'empty',
  error: 'error',
};

/**
 * 取演示演练任务列表。
 *
 * @param state 预览页当前选中的展示状态
 * @returns 成功/加载态返回全部 24 条；空态返回 `[]`；失败态 reject 一个带中文文案的 `Error`
 */
export async function fetchDemoTasks(state: DemoState): Promise<IDemoDrillTask[]> {
  await delay(randomDelayMs());

  switch (RESOLVE_MODE[state]) {
    case 'error':
      throw new Error(DEMO_REQUEST_ERROR_MESSAGE);
    case 'empty':
      return [];
    case 'success':
    default:
      return [...DEMO_DRILL_TASKS];
  }
}
