/**
 * 演示数据 —— 仅组件预览页使用（见 `src/types/design-preview.ts` 的说明）。
 *
 * 口径来自 `requirements/MASTER-PRD.md` §2「业务场景与假数据基线」：
 * 同一场演练（2027 年第二季度 危化品储罐泄漏事故应急演练）、同一批机构、同一套任务，
 * 进度与状态互相自洽——「已核验」必然 100%，「待接收」必然 0%。
 *
 * ⚠️ 本文件不负责延迟模拟，延迟统一由 `src/services/design-preview.ts` 注入。
 */

import type { IDemoDrillTask } from '@/types/design-preview';

/**
 * 24 条演练任务。
 *
 * 为什么是 24 而不是「列表数据量下限」的 12：分页每页 12 条，
 * 只有总数超过一页，预览页的分页控件的「下一页」才有第二页可翻（AC-14）。
 * 首屏仍然只渲染 12 行，符合 AC-7。
 */
export const DEMO_DRILL_TASKS: readonly IDemoDrillTask[] = [
  { id: 'YL2027-0418-T01', name: '泄漏点确认与初期隔离', department: '生产运行部', deadline: '5 分钟', status: '已核验', progress: 100 },
  { id: 'YL2027-0418-T02', name: '现场警戒与人员疏散', department: '安环部', deadline: '15 分钟', status: '已核验', progress: 100 },
  { id: 'YL2027-0418-T03', name: '储罐区电源与物料切断', department: '生产运行部', deadline: '15 分钟', status: '已核验', progress: 100 },
  { id: 'YL2027-0418-T04', name: '泄漏气体浓度监测', department: '安环部', deadline: '5 分钟', status: '已核验', progress: 100 },
  { id: 'YL2027-0418-T05', name: '消防水幕与泡沫覆盖', department: '消防救援队', deadline: '15 分钟', status: '已提交', progress: 90 },
  { id: 'YL2027-0418-T06', name: '伤员搜救与现场救护', department: '医疗救护组', deadline: '15 分钟', status: '已提交', progress: 85 },
  { id: 'YL2027-0418-T07', name: '重伤员转运定点医院', department: '医疗救护组', deadline: '30 分钟', status: '执行中', progress: 60 },
  { id: 'YL2027-0418-T08', name: '周边道路管控与车流引导', department: '应急办', deadline: '30 分钟', status: '执行中', progress: 55 },
  { id: 'YL2027-0418-T09', name: '泄漏物料围堵与收集', department: '设备检修部', deadline: '30 分钟', status: '执行中', progress: 45 },
  { id: 'YL2027-0418-T10', name: '受损法兰更换作业', department: '设备检修部', deadline: '30 分钟', status: '执行中', progress: 40 },
  { id: 'YL2027-0418-T11', name: '应急指挥车现场就位', department: '应急办', deadline: '15 分钟', status: '已接收', progress: 20 },
  { id: 'YL2027-0418-T12', name: '演练过程影像记录', department: '宣传与保障组', deadline: '30 分钟', status: '已接收', progress: 20 },
  { id: 'YL2027-0418-T13', name: '参演人员点名与签到核对', department: '应急办', deadline: '5 分钟', status: '已核验', progress: 100 },
  { id: 'YL2027-0418-T14', name: '环境敏感点水质取样', department: '安环部', deadline: '30 分钟', status: '已接收', progress: 15 },
  { id: 'YL2027-0418-T15', name: '备用电源切换与照明保障', department: '设备检修部', deadline: '15 分钟', status: '待接收', progress: 0 },
  { id: 'YL2027-0418-T16', name: '现场通信中继架设', department: '应急办', deadline: '15 分钟', status: '待接收', progress: 0 },
  { id: 'YL2027-0418-T17', name: '应急物资补给与发放', department: '宣传与保障组', deadline: '30 分钟', status: '待接收', progress: 0 },
  { id: 'YL2027-0418-T18', name: '媒体应对口径统一发布', department: '宣传与保障组', deadline: '30 分钟', status: '待接收', progress: 0 },
  { id: 'YL2027-0418-T19', name: '泄漏量测算与影响评估', department: '安环部', deadline: '30 分钟', status: '已接收', progress: 10 },
  { id: 'YL2027-0418-T20', name: '消防车辆通道清障', department: '消防救援队', deadline: '15 分钟', status: '已提交', progress: 80 },
  { id: 'YL2027-0418-T21', name: '储罐液位与压力远程监控', department: '生产运行部', deadline: '5 分钟', status: '已核验', progress: 100 },
  { id: 'YL2027-0418-T22', name: '参演人员防护装备检查', department: '安环部', deadline: '5 分钟', status: '已核验', progress: 100 },
  { id: 'YL2027-0418-T23', name: '演练结束现场清理与复位', department: '设备检修部', deadline: '30 分钟', status: '待接收', progress: 0 },
  { id: 'YL2027-0418-T24', name: '过程偏差记录与影像归档', department: '宣传与保障组', deadline: '30 分钟', status: '已提交', progress: 75 },
];

/** 预览页分页演示用的每页条数 */
export const DEMO_PAGE_SIZE = 12;
