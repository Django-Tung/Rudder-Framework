# 视觉规范 — 设计令牌与预设风格包

> 本文件回答「**Rudder 项目的界面长什么样**」。强制项见 [`../constitution.md`](../constitution.md) §2.1。
> 本文件是**唯一定义处**；`constitution.md` 只列强制项，`MASTER-PRD.md` 只记录当前项目选中了哪一套。

---

## 1. 为什么需要它

Rudder 面向**不懂前端的业务人员**，他们无法描述「我要什么风格」。若规则体系不定义视觉：

- AI 每次生成的配色、圆角、间距都不一样 → **REQ 之间视觉割裂**，客户一眼看出是拼的；
- 「好看」没有判定依据 → 不可复现、不可 Review、不可交接。

因此本文件把「好看」从**AI 当场发挥**转成**规则保证**。

## 2. 三层结构

```text
第 1 层  设计令牌 @theme   ← 机器可读，AI 只能引用，不得自造
第 2 层  预设风格包        ← 人类可选，新手回答「这两个要哪个」
第 3 层  通用组件          ← 跨 REQ 复用，消灭风格漂移
```

**三层缺一不可**：只有规范文字会被绕过；只有组件库覆盖不了长尾场景；只有令牌无法保证复用。

---

## 3. 第 1 层：设计令牌

### 3.1 唯一色值来源

**所有色值只能写在 `src/index.css` 的 `@theme` 块中**，`src/` 其余位置一律禁止硬编码色值。

Tailwind v4 在 `@theme` 中定义 `--color-*` / `--text-*` / `--radius-*` / `--shadow-*` / `--spacing-*`，
会**自动生成同名 utility class**：`--color-brand-600` → `bg-brand-600` / `text-brand-600` / `border-brand-600`。

### 3.2 令牌清单（**每个预设都必须齐备**）

| 类别 | 令牌 | 缺失后果 |
|---|---|---|
| 色板 | `brand-{50,100,500,600,700}` | 主色不统一 |
| | `surface-{page,card}` · `border-{base,strong}` | 层次不明 |
| | `text-{primary,secondary,muted,inverse}` | 文字层级混乱 |
| | `danger-600` · `success-600` · `warning-600` | 三态语义色缺失 |
| 字阶 | `title` / `subtitle` / `body` / `caption`（含 line-height、font-weight） | **视觉层级缺失，「好看」的最大破坏源** |
| 圆角 | `sm` / `md` / `lg` | 同款按钮出现三种圆角 |
| 阴影 | `sm` / `md` | 过深阴影 = 廉价感 |
| 间距节奏 | `page` / `card` / `section` | 留白混乱 |

> **字阶用语义名而非数值**（`text-title` 而非 `text-xl`）：换预设时只改令牌，代码不动。

---

## 4. 第 2 层：预设风格包

项目级 UI 主风格**只能**取以下四者之一，**不接受自由文本描述**。

### P1 · 清爽后台（**默认预设**）

克制、企业感、通用性最强。适用于绝大多数 B 端管理系统。

```css
@theme {
  --color-brand-50:  #eff6ff;  --color-brand-100: #dbeafe;
  --color-brand-500: #3b82f6;  --color-brand-600: #2563eb;  --color-brand-700: #1d4ed8;
  --color-surface-page: #f8fafc;  --color-surface-card: #ffffff;
  --color-border-base:  #e2e8f0;  --color-border-strong: #cbd5e1;
  --color-text-primary:   #0f172a;  --color-text-secondary: #475569;
  --color-text-muted:     #94a3b8;  --color-text-inverse: #ffffff;
  --color-danger-600:  #dc2626;  --color-success-600: #16a34a;  --color-warning-600: #d97706;

  --text-title:    1.5rem;   --text-title--line-height:    2rem;    --text-title--font-weight:    700;
  --text-subtitle: 1.125rem; --text-subtitle--line-height: 1.75rem; --text-subtitle--font-weight: 600;
  --text-body:     1rem;     --text-body--line-height:     1.5rem;  --text-body--font-weight:     400;
  --text-caption:  0.75rem;  --text-caption--line-height:  1rem;    --text-caption--font-weight:  400;

  --radius-sm: 0.25rem;  --radius-md: 0.5rem;  --radius-lg: 0.75rem;
  --shadow-sm: 0 1px 2px rgb(15 23 42 / 0.06);
  --shadow-md: 0 4px 12px rgb(15 23 42 / 0.08);

  --spacing-page: 1.5rem;  --spacing-card: 1.5rem;  --spacing-section: 2rem;
}
```

### P2 · 深色数据台

监控 / 运营 / 数据密集场景。**间距比 P1 更紧**（信息密度更高）。

```css
@theme {
  --color-brand-50:  #0c4a6e;  --color-brand-100: #075985;
  --color-brand-500: #38bdf8;  --color-brand-600: #0ea5e9;  --color-brand-700: #0284c7;
  --color-surface-page: #0b1220;  --color-surface-card: #111a2b;
  --color-border-base:  #1f2b3d;  --color-border-strong: #334155;
  --color-text-primary:   #e2e8f0;  --color-text-secondary: #94a3b8;
  --color-text-muted:     #64748b;  --color-text-inverse: #0b1220;
  --color-danger-600: #f87171;  --color-success-600: #4ade80;  --color-warning-600: #fbbf24;
  /* 字阶 / 圆角 / 阴影同 P1 */
  --spacing-page: 1rem;  --spacing-card: 1rem;  --spacing-section: 1.5rem;
}
```

### P3 · 温暖内容型

消费级 / 留白多 / 亲和力。**圆角更圆润、留白更多**。

```css
@theme {
  --color-brand-50:  #fff7ed;  --color-brand-100: #ffedd5;
  --color-brand-500: #f97316;  --color-brand-600: #ea580c;  --color-brand-700: #c2410c;
  --color-surface-page: #fffdfb;  --color-surface-card: #ffffff;
  --color-border-base:  #f0e9e3;  --color-border-strong: #e0d5cc;
  --color-text-primary:   #1c1917;  --color-text-secondary: #6b5f57;
  --color-text-muted:     #a89b91;  --color-text-inverse: #ffffff;
  --color-danger-600: #dc2626;  --color-success-600: #16a34a;  --color-warning-600: #d97706;
  --radius-sm: 0.375rem;  --radius-md: 0.75rem;  --radius-lg: 1rem;
  --shadow-sm: 0 1px 2px rgb(28 25 23 / 0.05);
  --shadow-md: 0 4px 16px rgb(28 25 23 / 0.08);
  --spacing-page: 2rem;  --spacing-card: 2rem;  --spacing-section: 3rem;
}
```

### BRAND · 品牌派生

客户有自己的品牌规范时使用。**不是第四套固定令牌，而是一条派生规则**：

1. 用户提供品牌主色（及可选的品牌辅助色），记录在 `MASTER-PRD.md`；
2. 按 P1 的档位结构派生 `--color-brand-{50,100,500,600,700}`；
3. **其余令牌（字阶、间距、圆角、阴影）全部沿用 P1**，仅色板被替换。

> **为什么只替换色板**：保证客户品牌色的原型**仍然与其他 REQ 视觉一致**。
> 若连字阶圆角一起自定义，风格会立刻漂移回「每次都不一样」的老问题。

---

## 5. 风格确认流程（面向不懂前端的用户）

**❌ 禁止**向用户提这样的问题：

> 「你要什么风格？—— 数据密集型工作台 / 轻量内容型 / 品牌主导 / 自定义」

用户无法在脑中成像，也无从判断哪个适合他的客户，流程会卡在 `UNCONFIRMED`。

**✅ 正确做法**：

1. Agent 展示 `docs/styles/` 下三套预设的图示（色板 + 线框 + 适用场景）；
2. 用中文问二选一：**「① 选 P1 / P2 / P3 哪一个？② 或者直接说『你决定』」**；
3. 用户选 ② → 采用**默认预设 P1**，在 `MASTER-PRD.md` 记录「用户未指定，采用默认预设 P1 · 清爽后台」；
4. **不写「待用户确认」，流程不得因此卡住**。

`MASTER-PRD.md` §1 的取值：

```yaml
## 1. UI 主风格
- 预设：P1 | P2 | P3 | BRAND
- 来源：用户选定 | 用户未指定，采用默认预设 P1
- 令牌集：src/index.css @theme（随预设同步）
- 例外：<单个 REQ 的例外及原因，无则「无」>
- 确认日期：YYYY-MM-DD
```

**换预设的操作** = 替换 `src/index.css` 中整个 `@theme` 块 + 更新本记录。
代码中的 class 名**不需要改动**（因为用的是语义令牌名）。

---

## 6. 第 3 层：通用组件

### 6.1 两层划分

| 层 | 组件 | 来源 |
|---|---|---|
| **第一层 · 手写外观** | `Button` `Input` `Textarea` `Select` `Card` `Badge` `Table` `Skeleton` `EmptyState` `ErrorState` `Pagination` `Modal` `Toast` `Tabs` | 预置，外观 100% 自绘；`Modal`/`Select`/`Tabs` 用 headless 原语库承载行为 |
| **第二层 · 边做边沉淀** | 业务组件 | 各 REQ 的 implement 阶段产出 |

### 6.2 强制复用条款

> 同类交互元素**必须**使用 `src/components/` 中的组件。
> 确需新建的，须在 `implement.md` 说明现有组件为何不适用。
> 新组件若具备通用性，**必须**下沉到第一层。

**理由**：多 REQ 迭代下，「好看」最容易崩的地方就是同款按钮在不同 REQ 里长得不一样。
组件复用比任何设计规范都可靠——它把规范变成了**代码**而不是文字。

### 6.3 Token 别名

复杂组合在 `src/design/tokens.ts` 中固化为语义常量，避免 class 字符串散落：

```ts
export const BTN_PRIMARY = 'bg-brand-600 text-text-inverse rounded-md px-4 py-2 text-body';
export const CARD = 'bg-surface-card border border-border-base rounded-lg p-card shadow-sm';
```

---

## 7. 机器约束

| 约束 | 实现 | 拦截什么 |
|---|---|---|
| 禁止硬编码色值 | `eslint.config.js` 的 `no-restricted-syntax` | `bg-[#3b82f6]`、`style={{color:'#fff'}}`、SVG 的 `fill="#fff"` |
| 禁止外链资源 | `eslint.config.js` 规则 | `<img src="https://...">`（放行 `data:` 与相对路径） |

> **实施注意**：两条规则均有**误报风险**（SVG 属性、base64 data URI、内联 background）。
> 落地时必须**先写测试用例**验证不误报，再启用为 `error`。

---

## 8. 未纳入规范的部分（明确不做）

| 项 | 原因 |
|---|---|
| 强制响应式双端 | 需求「**明确了再做**」，不作为默认强制项（见 [`../requirement/structure.md`](../requirement/structure.md) 与 `layout.md` 模板） |
| 图表库 | 图表一律用纯 SVG / CSS 绘制，不引第三方图表库 |
| 字体文件 | 不引入 webfont；使用系统字体栈 |
| 暗色模式自动切换 | 预设 P2 即为深色，不额外实现 `prefers-color-scheme` |