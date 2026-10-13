import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Send } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SkeletonRows,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ToastProvider,
  useToast,
} from '@/components';
import {
  CARD,
  COLOR_SWATCHES,
  CONTROL_FOCUS_PREVIEW,
  PAGE_CONTENT,
  PAGE_SHELL,
  SECTION_BLOCK,
  TABLE_AREA,
} from '@/design/tokens';
import { cn } from '@/lib/cn';
import { DEMO_PAGE_SIZE } from '@/mocks/design-preview';
import { DEMO_REQUEST_ERROR_MESSAGE, fetchDemoTasks } from '@/services/design-preview';
import type { DemoState, IDemoDrillTask } from '@/types/design-preview';
import type { BadgeTone, IColumn } from '@/types/ui';

/**
 * 组件预览页（`/design`）。
 *
 * ⚠️ 仅开发期使用：导航里没有入口，只能手动访问，页面顶部固定显示「不对外演示」标识（AC-16）。
 *
 * 本页有两个职责，不要因为「它只是个演示页」就降标准：
 *   1. 它是本 REQ 全部 AC 在浏览器里的验证载体——评审时逐条对着点；
 *   2. 它是后续业务 REQ 的视觉参照——写业务页面时先来这里看「应该长什么样」。
 *
 * 状态一律用组件内部 `useState`，**不引入 Zustand**：
 * 本页没有跨页共享状态，为演示开一个全局 store 会让后续 REQ 误以为需要沿用（plan.md §5.2）。
 */

/* ===========================================================================
 * 01 设计令牌（AC-1）
 * ========================================================================= */

type TokenValueMap = Record<string, string>;

/**
 * 读取 `@theme` 中每个令牌的**实际生效值**。
 *
 * 为什么在渲染期读 `getComputedStyle` 而不是把色值写进数据里：
 *   1. 写死就等于出现了第二份色值，令牌改了这个页面不会跟着变，AC-1 沦为摆设；
 *   2. `src/` 下禁止硬编码十六进制色值（eslint 会拦），写死也过不了 lint；
 *   3. 读计算值本身就能证明「令牌确实生效」——读到空值说明 `@theme` 没写对。
 *
 * 放在 `useState` 的惰性初始化里而不是 `useEffect` 里：首帧就要显示，
 * 否则色板会先空一下再填上，演示时看得很明显。CSS 由 `main.tsx` 在渲染前 import，
 * 因此渲染期读取一定能拿到值。
 */
function readTokenValues(): TokenValueMap {
  const computed = getComputedStyle(document.documentElement);
  const values: TokenValueMap = {};

  for (const token of COLOR_SWATCHES) {
    values[token.name] = computed.getPropertyValue(token.name).trim();
  }

  return values;
}

function TokenSection() {
  const [values] = useState<TokenValueMap>(readTokenValues);

  // 窄屏 2 列、桌面 5 列（AC-17 与 layout.md 的移动端线框一致）
  return (
    <div className="grid grid-cols-2 gap-card md:grid-cols-5">
      {COLOR_SWATCHES.map((token) => (
        <div key={token.name} className="flex flex-col gap-2">
          <div
            className="h-16 w-full rounded-md border border-border-base"
            // 色块与下方打印的值取自同一个 CSS 变量，因此二者必然一致
            style={{ backgroundColor: `var(${token.name})` }}
          />
          <div className="flex flex-col gap-0.5">
            <code className="text-caption font-medium text-text-primary">{token.label}</code>
            <code className="text-caption text-text-secondary tabular-nums">
              {values[token.name] ?? '—'}
            </code>
            <span className="text-caption text-text-muted">{token.usage}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===========================================================================
 * 02 按钮（AC-2、AC-3）
 * ========================================================================= */

const BUTTON_VARIANTS = [
  { variant: 'primary', label: '主要' },
  { variant: 'secondary', label: '次要' },
  { variant: 'danger', label: '危险' },
  { variant: 'ghost', label: '幽灵' },
] as const;

function ButtonSection() {
  const [submitting, setSubmitting] = useState(false);

  // 加载态下按钮自身 `disabled`，再点一次不会触发 `onClick`——所以**不能**用「点一下切换」来复位，
  // 那会让按钮点一次就永久卡在加载态，后面的演示再也点不动。
  // 这里模拟一次真实提交：1.5s 后自行结束，进/出两个方向都能演示「宽度不跳」。
  useEffect(() => {
    if (!submitting) return;
    const timer = window.setTimeout(() => setSubmitting(false), 1500);
    return () => window.clearTimeout(timer);
  }, [submitting]);

  return (
    <div className="flex flex-col gap-card">
      {/* 四变体：窄屏纵向堆叠，桌面单行（AC-17） */}
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        {BUTTON_VARIANTS.map((item) => (
          <Button key={item.variant} variant={item.variant}>
            {item.label}按钮
          </Button>
        ))}
      </div>

      {/* 尺寸成对比较，两种宽度下都保持横排 */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-caption text-text-secondary">尺寸</span>
        <Button size="sm">小号按钮</Button>
        <Button size="md">中号按钮</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-caption text-text-secondary">图标 / 加载</span>
        <Button variant="secondary" icon={<Send className="size-4" aria-hidden />}>
          下发任务
        </Button>
        <Button loading={submitting} loadingText="提交中" onClick={() => setSubmitting(true)}>
          提交演练方案
        </Button>
        <span className="text-caption text-text-muted">
          点左侧按钮：加载期间文案变「提交中」，按钮宽度不变（不抖动），约 1.5 秒后自动结束、可重复点
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-caption text-text-secondary">禁用</span>
        <Button disabled>不可点击</Button>
        <Button variant="secondary" disabled>
          不可点击
        </Button>
      </div>
    </div>
  );
}

/* ===========================================================================
 * 03 表单（AC-4、AC-5）
 * ========================================================================= */

/** 机构名取自 `requirements/MASTER-PRD.md` §2 的真实机构，不用占位名（AC-5） */
const DEPARTMENTS = [
  '应急办',
  '安环部',
  '生产运行部',
  '设备检修部',
  '消防救援队',
  '医疗救护组',
  '宣传与保障组',
];

/**
 * Input 四态。
 *
 * 聚焦态用 `CONTROL_FOCUS_PREVIEW` 把焦点环**平铺**出来——它与真实的
 * `CONTROL_FOCUS` 取自同一套令牌，因此不会出现「预览的聚焦态与真聚焦态不一致」。
 * 不直接 `autoFocus`：四个控件抢焦点没有意义，且真聚焦会盖掉另外三个的展示。
 */
function InputStates() {
  return (
    <div className="flex flex-col gap-3">
      <Input placeholder="默认态" aria-label="演练名称（默认态）" />
      <Input
        className={CONTROL_FOCUS_PREVIEW}
        defaultValue="聚焦态"
        aria-label="演练名称（聚焦态）"
      />
      <Input error="请输入演练名称" aria-label="演练名称（错误态）" />
      <Input disabled placeholder="禁用态" aria-label="演练名称（禁用态）" />
    </div>
  );
}

function TextareaStates() {
  return (
    <div className="flex flex-col gap-3">
      <Textarea placeholder="默认态" aria-label="演练说明（默认态）" />
      <Textarea
        className={CONTROL_FOCUS_PREVIEW}
        defaultValue="聚焦态"
        aria-label="演练说明（聚焦态）"
      />
      <Textarea error="请输入演练说明" aria-label="演练说明（错误态）" />
      <Textarea disabled placeholder="禁用态" aria-label="演练说明（禁用态）" />
    </div>
  );
}

function FormSection() {
  const [department, setDepartment] = useState('生产运行部');

  return (
    <div className="flex flex-col gap-card">
      <div className="grid gap-card md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-caption text-text-secondary">
            Input · 默认 / 聚焦 / 错误 / 禁用
          </span>
          <InputStates />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-caption text-text-secondary">
            Textarea · 默认 / 聚焦 / 错误 / 禁用
          </span>
          <TextareaStates />
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-1.5">
        <span className="text-caption text-text-secondary">
          Select · 键盘可达（Enter 展开 / 方向键移动 / Enter 选中 / Esc 收起）
        </span>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger aria-label="责任机构">
            <SelectValue placeholder="请选择责任机构" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ===========================================================================
 * 04 卡片与标记（AC-6）
 * ========================================================================= */

const BADGE_TONES: readonly { tone: BadgeTone; label: string }[] = [
  { tone: 'neutral', label: '中性' },
  { tone: 'success', label: '成功' },
  { tone: 'warning', label: '警告' },
  { tone: 'danger', label: '危险' },
];

function CardSection() {
  return (
    <div className="grid gap-card md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>演练准备完成情况</CardTitle>
          <CardDescription>2027 年第二季度 危化品储罐泄漏事故应急演练</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-body text-text-secondary">待确认事项</span>
            <span className="text-body text-text-primary tabular-nums">3 项</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body text-text-secondary">责任机构</span>
            <span className="text-body text-text-primary">安环部</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col justify-center gap-3">
        <span className="text-caption text-text-secondary">Badge · 四种色调</span>
        {/* 标记短小，窄屏也保持横排（layout.md 移动端线框） */}
        <div className="flex flex-wrap items-center gap-2">
          {BADGE_TONES.map((item) => (
            <Badge key={item.tone} tone={item.tone}>
              {item.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
 * 05 数据展示（AC-7 ~ AC-10、AC-14）
 * ========================================================================= */

type ViewState =
  | { kind: 'loading' }
  | { kind: 'success'; rows: IDemoDrillTask[] }
  | { kind: 'empty' }
  | { kind: 'error' };

/** 演练任务流转状态 → 标记色调。未知状态降级为中性，不抛错 */
const STATUS_TONE: Record<string, BadgeTone> = {
  待接收: 'neutral',
  已接收: 'neutral',
  执行中: 'warning',
  已提交: 'warning',
  已核验: 'success',
};

const DEMO_TABLE_COLUMNS: readonly IColumn<IDemoDrillTask>[] = [
  { key: 'name', title: '演练任务', width: 'w-72' },
  { key: 'department', title: '责任机构' },
  { key: 'deadline', title: '时限' },
  {
    key: 'status',
    title: '状态',
    render: (row) => <Badge tone={STATUS_TONE[row.status] ?? 'neutral'}>{row.status}</Badge>,
  },
  {
    // 数值列必须右对齐（AC-7）
    key: 'progress',
    title: '进度',
    align: 'right',
    render: (row) => <span className="tabular-nums">{row.progress}%</span>,
  },
];

/** 非成功态共用的空行集。用常量而非 `[]` 字面量，保证引用稳定 */
const NO_ROWS: readonly IDemoDrillTask[] = [];

const DEMO_SWITCHES: readonly { state: DemoState; label: string }[] = [  { state: 'loading', label: '加载中' },
  { state: 'success', label: '正常' },
  { state: 'empty', label: '空数据' },
  { state: 'error', label: '请求失败' },
];

function DataSection() {
  const [demo, setDemo] = useState<DemoState>('success');
  // 首帧就是加载中：与真实页面「先骨架后数据」的时序一致
  const [view, setView] = useState<ViewState>({ kind: 'loading' });
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const rows = await fetchDemoTasks(demo);
        if (cancelled) return;
        setView(rows.length === 0 ? { kind: 'empty' } : { kind: 'success', rows });
      } catch {
        if (cancelled) return;
        setView({ kind: 'error' });
      }
    };

    void load();

    // 连续切换时丢弃过期响应，否则慢的旧请求会覆盖新状态
    return () => {
      cancelled = true;
    };
  }, [demo, reloadToken]);

  /**
   * 切换展示状态。
   *
   * `loading` 与 `success` 都走「重新请求」：服务端在 `loading` 下返回的仍是正常数据，
   * 让评审看见骨架屏在 300–800ms 后被 12 行数据替换（AC-8），
   * 而不是把骨架永久钉在页面上。
   */
  const switchState = useCallback((next: DemoState) => {
    setView({ kind: 'loading' });
    setPage(1);
    setDemo(next);
    setReloadToken((token) => token + 1);
  }, []);

  /**
   * 重试。
   *
   * 直接把状态切到「正常」。AC-10 要求「点击重试后先回到加载中，随后重新渲染数据」——
   * 若沿用 `demo === 'error'` 重新请求，只会再次失败，「重试」按钮就成了摆设。
   */
  const retry = useCallback(() => {
    switchState('success');
  }, [switchState]);

  // 非成功态复用同一个空数组常量：若写成 `[]` 字面量，每次渲染都是新引用，
  // 下面 `pageRows` 的 memo 会每帧失效，等于白 memo。
  const rows = useMemo(
    () => (view.kind === 'success' ? view.rows : NO_ROWS),
    [view],
  );

  const pageRows = useMemo(
    () => rows.slice((page - 1) * DEMO_PAGE_SIZE, page * DEMO_PAGE_SIZE),
    [rows, page],
  );

  const centered = view.kind !== 'success';

  return (
    <div className="flex flex-col gap-card">
      {/* 状态开关：窄屏换行，不溢出屏幕（layout.md 移动端线框） */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-caption text-text-secondary">状态</span>
        {DEMO_SWITCHES.map((item) => (
          <Button
            key={item.state}
            size="sm"
            variant={demo === item.state ? 'primary' : 'secondary'}
            aria-pressed={demo === item.state}
            onClick={() => switchState(item.state)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className={cn(CARD, TABLE_AREA, 'flex flex-col overflow-hidden')}>
        {/*
          内容区：正常态自上而下排表格，其余三态垂直居中。
          高度由外层 `TABLE_AREA` 的下限统一撑住，因此切换状态时整块区域不跳变（AC-8）。
        */}
        <div
          className={cn(
            'flex flex-1 flex-col p-card md:p-section',
            centered && 'items-center justify-center',
          )}
        >
          {view.kind === 'loading' ? <SkeletonRows label="正在加载演练记录" /> : null}

          {view.kind === 'success' ? (
            <Table
              caption="演练任务列表"
              columns={DEMO_TABLE_COLUMNS}
              rows={pageRows}
              rowKey={(row) => row.id}
            />
          ) : null}

          {view.kind === 'empty' ? (
            <EmptyState
              icon={<ClipboardList className="size-6" aria-hidden />}
              title="本年度还没有演练记录"
              description="演练计划发布后，参演任务会自动出现在这里"
              action={
                <Button
                  icon={<Send className="size-4" aria-hidden />}
                  onClick={() => switchState('success')}
                >
                  新建演练计划
                </Button>
              }
            />
          ) : null}

          {view.kind === 'error' ? (
            <ErrorState message={DEMO_REQUEST_ERROR_MESSAGE} onRetry={retry} />
          ) : null}
        </div>

        {/* 仅有数据时出现；它的高度被外层下限预留，故不会挤动上方内容 */}
        {view.kind === 'success' ? (
          <div className="border-t border-border-base px-card py-card md:px-section">
            <Pagination
              page={page}
              pageSize={DEMO_PAGE_SIZE}
              total={rows.length}
              onChange={setPage}
            />
          </div>
        ) : null}
      </div>

      <p className="text-caption text-text-muted">
        共 {rows.length} 条演示任务，每页 {DEMO_PAGE_SIZE} 条。数据来自
        <code className="mx-1">src/mocks/design-preview.ts</code>
        （演示口径，非业务契约）。
      </p>
    </div>
  );
}

/* ===========================================================================
 * 06 反馈（AC-11 ~ AC-13）
 * ========================================================================= */

const TOAST_DEMOS = [
  { tone: 'success', label: '成功提示', message: '方案已发布' },
  { tone: 'warning', label: '警告提示', message: '演练计划还有 2 项未确认' },
  { tone: 'danger', label: '失败提示', message: '提交失败，请重试' },
] as const;

function FeedbackSection() {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-card">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-caption text-text-secondary">Modal</span>

        <Modal>
          <ModalTrigger asChild>
            <Button variant="secondary">打开弹窗</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>新建演练任务</ModalTitle>
              <ModalDescription>
                任务下发后会向责任机构推送通知，参演人员可在移动端接收并打卡。
              </ModalDescription>
            </ModalHeader>

            <div className="flex flex-col gap-3">
              <Input label="任务名称" placeholder="例如：泄漏气体浓度监测" />
              <Select defaultValue="生产运行部">
                <SelectTrigger aria-label="责任机构">
                  <SelectValue placeholder="请选择责任机构" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ModalFooter>
              <ModalClose asChild>
                <Button variant="secondary">取消</Button>
              </ModalClose>
              <Button>确定下发</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <span className="text-caption text-text-muted">
          按 Tab 焦点不跑出弹窗；Esc 关闭后焦点回到「打开弹窗」
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-caption text-text-secondary">Tabs · 方向键切换</span>
        <Tabs defaultValue="prepare">
          <TabsList>
            <TabsTrigger value="prepare">演练准备</TabsTrigger>
            <TabsTrigger value="execute">演练实施</TabsTrigger>
          </TabsList>
          <TabsContent value="prepare">
            演练准备阶段共 18 项任务，其中 3 项待确认，责任机构为安环部与设备检修部。
          </TabsContent>
          <TabsContent value="execute">
            演练实施阶段参演 48 人，已产生打卡记录 137 条，超时任务 2 项。
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <span className="text-caption text-text-secondary">Toast</span>
        {TOAST_DEMOS.map((item) => (
          <Button
            key={item.tone}
            size="sm"
            variant="secondary"
            onClick={() => toast.show({ tone: item.tone, message: item.message })}
          >
            {item.label}
          </Button>
        ))}
        <span className="text-caption text-text-muted">
          出现后 3 秒自动消失；窄屏位于屏幕顶部居中，桌面位于右上角
        </span>
      </div>
    </div>
  );
}

/* ===========================================================================
 * 页面骨架
 * ========================================================================= */

interface ISectionProps {
  index: string;
  title: string;
  description: string;
  children: ReactNode;
}

/** 分组容器。`SECTION_BLOCK` 让内边距随断点由 2rem 收窄为 1.5rem（AC-17） */
function Section({ index, title, description, children }: ISectionProps) {
  return (
    <section className={cn(CARD, SECTION_BLOCK, 'flex flex-col gap-card')}>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-caption font-medium text-brand-600 tabular-nums">{index}</span>
          <h2 className="text-title text-text-primary">{title}</h2>
        </div>
        <p className="text-body text-text-secondary">{description}</p>
      </div>

      {children}
    </section>
  );
}

export default function DesignPreviewPage() {
  return (
    // Provider 只包本页：轻提示是界面级反馈，不是全局状态（见 Toast.tsx 的说明）
    <ToastProvider>
      <div className={PAGE_SHELL}>
        <div className={PAGE_CONTENT}>
          <header className="flex flex-col gap-2 px-card pb-section md:px-section">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-title text-text-primary">设计系统预览</h1>
              <Badge tone="warning">开发预览 · 不对外演示</Badge>
            </div>
            <p className="text-body text-text-secondary">
              本页用于核对 P1 设计令牌与第一层 14 个通用组件。导航中不挂入口，仅开发期手动访问
              <code className="mx-1">/design</code>。
            </p>
          </header>

          <main className="flex flex-col gap-section">
            <Section
              index="01"
              title="设计令牌"
              description="全站色值的唯一来源是 src/index.css 的 @theme。下列色块与十六进制值都直接读自这些令牌。"
            >
              <TokenSection />
            </Section>

            <Section
              index="02"
              title="按钮"
              description="四种变体、两种尺寸；图标与加载态不引起布局位移。"
            >
              <ButtonSection />
            </Section>

            <Section
              index="03"
              title="表单"
              description="输入类控件覆盖默认 / 聚焦 / 错误 / 禁用四态；下拉框全程可键盘操作。"
            >
              <FormSection />
            </Section>

            <Section
              index="04"
              title="卡片与标记"
              description="卡片是内容容器，标记用于状态与分类。"
            >
              <CardSection />
            </Section>

            <Section
              index="05"
              title="数据展示"
              description="同一块区域承载加载中 / 正常 / 空数据 / 请求失败四种状态，高度不跳变。"
            >
              <DataSection />
            </Section>

            <Section
              index="06"
              title="反馈"
              description="弹窗、页签与轻提示。三者都自带键盘与屏幕阅读器支持。"
            >
              <FeedbackSection />
            </Section>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
