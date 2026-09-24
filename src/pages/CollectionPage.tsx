import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CalendarDays, ChevronRight, ExternalLink, FileText, Filter, Image, Link2, RefreshCw, Search, Settings2, Sparkles, X } from 'lucide-react';

import { updateInformationSource } from '@/services/collectionService';
import { useCollectionStore } from '@/stores/collectionStore';
import type { CollectionCategory, InformationSource, Sentiment, TimeRange } from '@/types/collection';

interface CollectionPageProps {
  onBack: () => void;
}

const categories: Array<CollectionCategory | '全部'> = ['全部', '政策', '项目线索', '公告', '竞品动态'];
const sentiments: Array<Sentiment | '全部'> = ['全部', '正面', '中性', '负面'];
const projects = ['全部项目', '中储智运', '北京市建筑设计研究院股份有限公司', '车库电桩控股（深圳）有限公司', '广东粤通启源芯动力科技有限公司', '潜在项目'];

const sentimentStyles: Record<Sentiment, string> = {
  正面: 'bg-emerald-50 text-emerald-700',
  中性: 'bg-slate-100 text-slate-600',
  负面: 'bg-red-50 text-red-700',
};

export default function CollectionPage({ onBack }: CollectionPageProps) {
  const { items, sources, filters, selectedItem, isLoading, error, loadItems, loadSources, setFilters, clearFilters, selectItem } = useCollectionStore();
  const [showSources, setShowSources] = useState(false);
  const [localSources, setLocalSources] = useState<InformationSource[]>([]);
  const [sourceSaved, setSourceSaved] = useState(false);

  useEffect(() => {
    void loadItems();
  }, [filters.timeRange, filters.type, filters.sentiment, filters.projectName, loadItems]);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  function toggleSource(id: string) {
    setLocalSources((current) => current.map((source) => source.id === id ? { ...source, enabled: !source.enabled } : source));
    setSourceSaved(false);
  }

  async function saveSources() {
    await Promise.all(localSources.map((source) => updateInformationSource(source)));
    setSourceSaved(true);
  }

  return (
    <main className="min-h-screen bg-[#f3f6f4] text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4"><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="返回工作台" onClick={onBack}><ArrowLeft size={18} /></button><div><p className="text-sm font-semibold text-slate-900">信息采集</p><p className="text-xs text-slate-400">采集动态与信息源管理</p></div></div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-emerald-300 hover:text-emerald-700" onClick={() => { setLocalSources(sources); setSourceSaved(false); setShowSources(true); }}><Settings2 size={16} />信息源配置</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-7 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">COLLECTION FEED / 09.24</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">采集动态</h1><p className="mt-2 text-sm text-slate-500">统一查看政策、公告、项目线索与竞品动态。</p></div><div className="flex items-center gap-2 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-500" />最近同步：今天 08:15</div></div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center gap-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Filter size={16} />筛选</div><select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-emerald-500" value={filters.timeRange} onChange={(event) => setFilters({ timeRange: event.target.value as TimeRange })}><option>近7天</option><option>近30天</option><option>近90天</option></select><select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-emerald-500" value={filters.type} onChange={(event) => setFilters({ type: event.target.value as CollectionCategory | '全部' })}>{categories.map((category) => <option key={category} value={category}>{category === '全部' ? '全部类型' : category}</option>)}</select><select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-emerald-500" value={filters.sentiment} onChange={(event) => setFilters({ sentiment: event.target.value as Sentiment | '全部' })}>{sentiments.map((sentiment) => <option key={sentiment} value={sentiment}>{sentiment === '全部' ? '全部情感' : sentiment}</option>)}</select><select className="h-9 max-w-60 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-emerald-500" value={filters.projectName || '全部项目'} onChange={(event) => setFilters({ projectName: event.target.value === '全部项目' ? '' : event.target.value })}>{projects.map((project) => <option key={project} value={project}>{project}</option>)}</select><button className="ml-auto text-sm text-slate-400 hover:text-emerald-700" onClick={clearFilters}>清除筛选</button></div></section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-800">动态时间线</h2><p className="mt-1 text-xs text-slate-400">共 {items.length} 条归并后的信息</p></div><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-700" title="刷新动态" onClick={() => void loadItems()}><RefreshCw size={16} /></button></div>
          {isLoading && <div className="space-y-3 p-5" aria-label="正在加载"><div className="h-16 animate-pulse rounded-xl bg-slate-100" /><div className="h-16 animate-pulse rounded-xl bg-slate-100" /><div className="h-16 animate-pulse rounded-xl bg-slate-100" /></div>}
          {!isLoading && error && <div className="flex flex-col items-center px-5 py-16 text-center"><AlertCircle className="text-red-500" size={30} /><p className="mt-3 text-sm font-medium text-slate-700">{error}</p><button className="mt-4 text-sm font-semibold text-emerald-700" onClick={() => void loadItems()}>重新加载</button></div>}
          {!isLoading && !error && items.length === 0 && <div className="flex flex-col items-center px-5 py-16 text-center"><Search className="text-slate-300" size={32} /><p className="mt-3 text-sm font-medium text-slate-700">当前筛选条件下暂无采集动态</p><button className="mt-4 text-sm font-semibold text-emerald-700" onClick={clearFilters}>清除筛选</button></div>}
          {!isLoading && !error && items.length > 0 && <div className="divide-y divide-slate-100">{items.map((item) => <button className="flex w-full gap-4 px-5 py-5 text-left transition hover:bg-slate-50" key={item.id} onClick={() => selectItem(item)}><div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CalendarDays size={17} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-emerald-700">{item.type}</span><span className="text-xs text-slate-400">{item.sourceName}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${sentimentStyles[item.sentiment]}`}>{item.sentiment}</span>{item.duplicateGroupId && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">已归并 {item.sourceCount} 条</span>}</div><h3 className="mt-2 truncate text-sm font-semibold text-slate-900">{item.title}</h3><p className="mt-1 truncate text-sm text-slate-500">{item.content}</p><div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400"><span>{item.publishedAt}</span><span>{item.projectName}</span>{item.ontologyReasoning && <span className="flex items-center gap-1 text-violet-600"><Sparkles size={13} />动态本体关联</span>}</div></div><ChevronRight className="mt-2 shrink-0 text-slate-300" size={18} /></button>)}</div>}
        </section>
      </div>

      {selectedItem && <div className="fixed inset-0 z-20 bg-slate-950/20" onClick={() => selectItem(null)}><aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">COLLECTION DETAIL</p><h2 className="mt-3 text-xl font-semibold leading-8 text-slate-950">{selectedItem.title}</h2></div><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="关闭详情" onClick={() => selectItem(null)}><X size={19} /></button></div><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{selectedItem.type}</span><span className={`rounded-full px-3 py-1 text-xs font-medium ${sentimentStyles[selectedItem.sentiment]}`}>{selectedItem.sentiment}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{selectedItem.projectName}</span></div><dl className="mt-7 grid grid-cols-2 gap-5 border-y border-slate-100 py-5"><div><dt className="text-xs text-slate-400">信息来源</dt><dd className="mt-1 text-sm font-medium text-slate-700">{selectedItem.sourceName}</dd></div><div><dt className="text-xs text-slate-400">发布时间</dt><dd className="mt-1 text-sm font-medium text-slate-700">{selectedItem.publishedAt}</dd></div><div><dt className="text-xs text-slate-400">采集时间</dt><dd className="mt-1 text-sm font-medium text-slate-700">{selectedItem.collectedAt}</dd></div><div><dt className="text-xs text-slate-400">来源数量</dt><dd className="mt-1 text-sm font-medium text-slate-700">{selectedItem.sourceCount} 条归并</dd></div></dl><div className="mt-7"><h3 className="text-sm font-semibold text-slate-800">正文内容</h3><p className="mt-3 text-sm leading-7 text-slate-600">{selectedItem.content}</p></div><div className="mt-7 space-y-3">{selectedItem.images.length > 0 && <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><Image size={17} className="text-slate-400" />{selectedItem.images.join('、')}</div>}{selectedItem.attachments.length > 0 && <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><FileText size={17} className="text-slate-400" />{selectedItem.attachments.join('、')}</div>}<a className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-emerald-700 hover:bg-emerald-50" href={selectedItem.originalUrl} target="_blank" rel="noreferrer"><Link2 size={17} />打开原文链接<ExternalLink size={14} className="ml-auto" /></a></div>{selectedItem.ontologyReasoning && <div className="mt-7 rounded-2xl border border-violet-100 bg-violet-50/60 p-5"><div className="flex items-center gap-2 text-sm font-semibold text-violet-900"><Sparkles size={17} />动态本体推理链</div><div className="mt-4 space-y-3 text-sm text-violet-900/75"><p><span className="text-violet-500">触发方式：</span>{selectedItem.ontologyReasoning.trigger}</p><p><span className="text-violet-500">关联节点：</span>{selectedItem.ontologyReasoning.nodes.join(' → ')}</p><p><span className="text-violet-500">关联项目：</span>{selectedItem.ontologyReasoning.relatedProject}</p><p><span className="text-violet-500">推理置信度：</span>{Math.round(selectedItem.ontologyReasoning.confidence * 100)}%</p></div></div>}</aside></div>}

      {showSources && <div className="fixed inset-0 z-20 bg-slate-950/20" onClick={() => setShowSources(false)}><aside className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">SOURCE SETTINGS</p><h2 className="mt-3 text-xl font-semibold text-slate-950">信息源配置</h2><p className="mt-2 text-sm text-slate-500">调整模拟信息源的启用状态。</p></div><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="关闭配置" onClick={() => setShowSources(false)}><X size={19} /></button></div><div className="mt-7 space-y-3">{localSources.map((source) => <div className="rounded-xl border border-slate-200 p-4" key={source.id}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{source.name}</p><p className="mt-1 text-xs text-slate-400">{source.category} · {source.frequency}</p></div><button className={`h-6 w-11 rounded-full p-1 transition ${source.enabled ? 'bg-emerald-600' : 'bg-slate-200'}`} title={source.enabled ? '停用信息源' : '启用信息源'} onClick={() => toggleSource(source.id)}><span className={`block h-4 w-4 rounded-full bg-white transition ${source.enabled ? 'translate-x-5' : ''}`} /></button></div><div className="mt-3 flex flex-wrap gap-1.5">{source.keywords.map((keyword) => <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-500" key={keyword}>{keyword}</span>)}</div></div>)}</div><div className="mt-7 flex items-center justify-between"><span className="text-sm text-emerald-700">{sourceSaved ? '配置已保存' : ''}</span><button className="rounded-lg bg-[#143b35] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d5148]" onClick={() => void saveSources()}>保存模拟配置</button></div></aside></div>}
    </main>
  );
}
