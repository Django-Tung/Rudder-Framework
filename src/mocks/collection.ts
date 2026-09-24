import type { CollectionItem, InformationSource } from '@/types/collection';

export const MOCK_INFORMATION_SOURCES: InformationSource[] = [
  { id: 'source-policy', name: '政策观察站', category: '政策', enabled: true, keywords: ['产业政策', '交通运输'], blacklist: ['招聘'], timeWindow: '近12个月', frequency: '每日 08:00' },
  { id: 'source-market', name: '投研项目情报', category: '项目线索', enabled: true, keywords: ['融资', '核心技术'], blacklist: ['广告'], timeWindow: '近30天', frequency: '每4小时' },
  { id: 'source-announcement', name: '上市公司公告', category: '公告', enabled: true, keywords: ['问询回复', '经营情况'], blacklist: [], timeWindow: '近12个月', frequency: '手动采集', },
  { id: 'source-competitor', name: '竞品动态监测', category: '竞品动态', enabled: false, keywords: ['共同投标', '共同投资'], blacklist: [], timeWindow: '近90天', frequency: '每日 18:00' },
];

export const MOCK_COLLECTION_ITEMS: CollectionItem[] = [
  { id: 'item-001', sourceId: 'source-policy', sourceName: '政策观察站', title: '交通运输数字化转型释放新一轮产业机会', publishedAt: '2026-09-24 08:12', collectedAt: '2026-09-24 08:15', type: '政策', sentiment: '正面', projectName: '中储智运', content: '相关政策提出推进交通运输基础设施数字化升级，鼓励物流平台提升数据协同能力。', originalUrl: 'https://example.com/policy-001', images: [], attachments: ['政策原文.pdf'], duplicateGroupId: null, sourceCount: 1, ontologyReasoning: null },
  { id: 'item-002', sourceId: 'source-market', sourceName: '投研项目情报', title: '某智能物流企业完成新一轮战略融资', publishedAt: '2026-09-23 16:40', collectedAt: '2026-09-23 16:43', type: '项目线索', sentiment: '正面', projectName: '潜在项目', content: '项目聚焦智能调度与运力协同，正在寻找产业资本合作伙伴。', originalUrl: 'https://example.com/market-001', images: ['项目介绍海报.png'], attachments: [], duplicateGroupId: 'dup-001', sourceCount: 2, ontologyReasoning: { trigger: '未直接命中项目词条', nodes: ['智能调度', '物流运力协同', '中储智运产业链'], relatedProject: '中储智运', confidence: 0.86 } },
  { id: 'item-003', sourceId: 'source-announcement', sourceName: '上市公司公告', title: '上市公司发布半年度经营情况公告', publishedAt: '2026-09-22 11:05', collectedAt: '2026-09-22 11:08', type: '公告', sentiment: '中性', projectName: '北京市建筑设计研究院股份有限公司', content: '公告披露上半年主营业务进展及重点项目签约情况，待业务人员进一步核实。', originalUrl: 'https://example.com/announcement-001', images: [], attachments: ['半年度公告.docx'], duplicateGroupId: null, sourceCount: 1, ontologyReasoning: null },
  { id: 'item-004', sourceId: 'source-market', sourceName: '投研项目情报', title: '行业竞争企业新增重大客户合作', publishedAt: '2026-09-20 09:20', collectedAt: '2026-09-20 09:23', type: '竞品动态', sentiment: '负面', projectName: '广东粤通启源芯动力科技有限公司', content: '竞品企业公告新增重大客户合作，可能对现有市场拓展节奏产生影响。', originalUrl: 'https://example.com/competitor-001', images: [], attachments: [], duplicateGroupId: 'dup-002', sourceCount: 3, ontologyReasoning: null },
  { id: 'item-005', sourceId: 'source-policy', sourceName: '政策观察站', title: '绿色交通建设专项资金管理办法发布', publishedAt: '2026-09-18 14:30', collectedAt: '2026-09-18 14:34', type: '政策', sentiment: '正面', projectName: '车库电桩控股（深圳）有限公司', content: '专项资金支持充换电设施建设与运营，为相关项目提供政策窗口。', originalUrl: 'https://example.com/policy-002', images: [], attachments: [], duplicateGroupId: null, sourceCount: 1, ontologyReasoning: null },
];
