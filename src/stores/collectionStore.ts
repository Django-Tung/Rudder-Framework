import { create } from 'zustand';

import { getCollectionItems, getInformationSources } from '@/services/collectionService';
import type { CollectionFilters, CollectionItem, InformationSource } from '@/types/collection';

interface CollectionStore {
  items: CollectionItem[];
  sources: InformationSource[];
  filters: CollectionFilters;
  selectedItem: CollectionItem | null;
  isLoading: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  loadSources: () => Promise<void>;
  setFilters: (filters: Partial<CollectionFilters>) => void;
  clearFilters: () => void;
  selectItem: (item: CollectionItem | null) => void;
}

const DEFAULT_FILTERS: CollectionFilters = { timeRange: '近30天', type: '全部', sentiment: '全部', projectName: '' };

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  items: [],
  sources: [],
  filters: DEFAULT_FILTERS,
  selectedItem: null,
  isLoading: false,
  error: null,
  loadItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await getCollectionItems(get().filters);
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false, error: '采集动态加载失败，请稍后重试' });
    }
  },
  loadSources: async () => {
    try {
      const sources = await getInformationSources();
      set({ sources });
    } catch {
      set({ error: '信息源配置加载失败，请稍后重试' });
    }
  },
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
  selectItem: (selectedItem) => set({ selectedItem }),
}));
