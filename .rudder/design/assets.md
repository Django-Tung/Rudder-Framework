# 本地资源规范 — 零外网依赖

> 本文件回答「**界面上的图从哪来**」。强制项见 [`../constitution.md`](../constitution.md) §3.1。

---

## 1. 为什么零外网依赖是硬要求

Rudder 原型的主要演示场景是**会议室投屏**：

- 会议室网络经常需要访客认证、有线口不通、临时 WiFi 不可用；
- 外链图床加载失败 = 客户当场看到裂图 —— 这是**演示事故**，比做得不够好看更致命；
- 演示当天无法临时排查网络。

因此本规范的**唯一目标**：**拔掉网线也能完整走完演示动线。**

---

## 2. 资源分类与规定

| 资源类型 | 规定 | 缺失时怎么办 |
|---|---|---|
| **公司 Logo / 品牌素材** | 用户放入 `public/brand/`。**不外链** | 用统一的占位 Logo 组件（本地 SVG） |
| **商品图 / 头像 / 照片** | 用户放入 `public/assets/` | 用 `PlaceholderImage` 生成**本地 SVG 占位图**（几何风格统一，配色随令牌） |
| **空状态插画** | **固定一套**，存于 `src/components/` | 不得 AI 每次现画——风格必然漂移 |
| **图标** | `lucide-react`（唯一图标来源） | — |
| **图表** | 纯 SVG / CSS 绘制 | **不得**引入第三方图表库 |
| **字体** | 系统字体栈 | **不得**引入 webfont |

## 3. 硬性禁止

- ❌ **禁止**任何 http(s) 外链资源（图片 / 字体 / 音视频 / CSS）
- ❌ **禁止**引入占位图服务（图床，如 picsum / placehold 等）
- ❌ **禁止**在 `src/` 中出现 `url(...)` 指向远程地址

✅ **允许**：

- 相对路径（`/assets/logo.svg`、`./avatar.png`）
- `data:` 内联 base64（本地自包含）
- 本地 import 的 SVG（Vite 会打包内联或产出本地文件）

## 4. 占位图组件

`src/components/PlaceholderImage.tsx` 是**唯一**的图片占位出口：

```tsx
interface PlaceholderImageProps {
  /** 语义标签，用于生成可辨识的几何占位（中文短词） */
  label: string;
  /** 尺寸比例，默认 4:3 */
  ratio?: '1:1' | '4:3' | '16:9';
  /** 可选：用户提供的本地图片路径，存在则优先渲染 */
  src?: string;
}
```

**要求**：

- 纯 SVG 绘制，**不引入任何依赖**；
- 底色取 `--color-surface-page`，边框取 `--color-border-base`，图形取 `--color-brand-*` 的低档位；
- 同类内容生成**可复现**的图形（按 `label` 派生种子），不要每次渲染都变。

---

## 5. 用户素材的存放约定

```text
public/
├── brand/          # 公司 Logo、品牌色说明、品牌字体（用户提供）
└── assets/         # 业务图片：商品图、头像、照片（用户提供）
```

- 目录可以不存在（首次规划时创建空目录 + `.gitkeep`）；
- **README 中说明**：用户把自己的素材丢进这两个目录，Rudder 会自动优先使用。

---

## 6. 机器约束

`eslint.config.js` 规则拦截 `src/` 中的远程资源引用：

| 拦截 | 放行 |
|---|---|
| `<img src="http...">` | `<img src="/assets/x.png">` |
| `<source src="https://...">` | `<img src={dataUri}>`（`data:` 开头） |
| `style={{ backgroundImage: 'url(https://...)' }}` | `url(/assets/x.svg)` |
| `new URL('https://...', import.meta.url)` | — |

> **实施注意**：规则有误报风险（内联 SVG、base64）。
> 落地时必须**先写测试用例**验证放行路径不被误伤，再启用为 `error`。

---

## 7. 演示环境自检

`docs/demo-checklist.md` 中的「无图片加载失败」一条，**在断网环境下验证**才有意义——
联网状态下外链图也能加载，会掩盖违规。因此**验收演示能力时必须断网跑一遍**。