import { MOCK_COLLECTION_ITEMS, MOCK_INFORMATION_SOURCES } from '@/mocks/collection';
import type { CollectionFilters, CollectionItem, InformationSource } from '@/types/collection';

const MOCK_LATENCY_MS = 450;

function withMockLatency<T>(callback: () => T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(callback()), MOCK_LATENCY_MS));
}

function matchesTimeRange(item: CollectionItem, timeRange: CollectionFilters['timeRange']): boolean {
  const days = timeRange === '近7天' ? 7 : timeRange === '近30天' ? 30 : 90;
  const current = new Date('2026-09-24T23:59:59');
  const published = new Date(item.publishedAt.replace(' ', 'T'));
  return current.getTime() - published.getTime() <= days * 24 * 60 * 60 * 1000;
}

export function getCollectionItems(filters: CollectionFilters): Promise<CollectionItem[]> {
  return withMockLatency(() => MOCK_COLLECTION_ITEMS.filter((item) => (
    matchesTimeRange(item, filters.timeRange)
      && (filters.type === '全部' || item.type === filters.type)
      && (filters.sentiment === '全部' || item.sentiment === filters.sentiment)
      && (!filters.projectName || item.projectName === filters.projectName)
  )));
}

export function getInformationSources(): Promise<InformationSource[]> {
  return withMockLatency(() => MOCK_INFORMATION_SOURCES.map((source) => ({ ...source, keywords: [...source.keywords], blacklist: [...source.blacklist] })));
}

export function updateInformationSource(source: InformationSource): Promise<InformationSource> {
  return withMockLatency(() => source);
}

export function getOntologyReasoning(itemId: string): Promise<CollectionItem['ontologyReasoning']> {
  return withMockLatency(() => MOCK_COLLECTION_ITEMS.find((item) => item.id === itemId)?.ontologyReasoning ?? null);
}
