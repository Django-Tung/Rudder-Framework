export type CollectionCategory = '政策' | '项目线索' | '公告' | '竞品动态';
export type Sentiment = '正面' | '中性' | '负面';
export type TimeRange = '近7天' | '近30天' | '近90天';

export interface InformationSource {
  id: string;
  name: string;
  category: CollectionCategory;
  enabled: boolean;
  keywords: string[];
  blacklist: string[];
  timeWindow: string;
  frequency: string;
}

export interface OntologyReasoning {
  trigger: string;
  nodes: string[];
  relatedProject: string;
  confidence: number;
}

export interface CollectionItem {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  publishedAt: string;
  collectedAt: string;
  type: CollectionCategory;
  sentiment: Sentiment;
  projectName: string;
  content: string;
  originalUrl: string;
  images: string[];
  attachments: string[];
  duplicateGroupId: string | null;
  sourceCount: number;
  ontologyReasoning: OntologyReasoning | null;
}

export interface CollectionFilters {
  timeRange: TimeRange;
  type: CollectionCategory | '全部';
  sentiment: Sentiment | '全部';
  projectName: string;
}
