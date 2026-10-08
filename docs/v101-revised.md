# Rudder Framework v1.0.1 完整改造清单 (Revised)

## 1. 改造范围与核心原则
- **核心原则**：保持 REQ 目录 6 文件极简结构；Machine Gate 强校验，Human Gate 流畅交互；脚本零第三方依赖。
- **新增文档**：`docs/v1.0.1.md`（记录本版本实施项、测试结果、Dogfood 结果）。
- **结构调整**：废弃独立的 `verify.md` 和 `review.md`，其内容作为标准 Markdown 区块（Section）嵌入至 `requirements/REQ-XXX/README.md` 中。

---

## 2. I3 Traceability 改造 (脚本: `scripts/check-req.js`)

### 2.1 统一 AC 提取源
不拆分 I3 到独立脚本。统一使用 `check-req.js` 当前的 AC 提取逻辑（兼容 `### AC-1:` 和 `- **AC-1:**` 格式），I1、I2、I3、I4 共享此提取结果，禁止重复解析。

### 2.2 Implementation Location 格式增强
支持单个或多个位置（应对组件+样式分离场景）：
```text
src/pages/Foo.tsx:42
# 或
src/pages/Foo.tsx:42, src/styles/Foo.css:15
```
解析逻辑：按逗号分割，分别校验每个 `path:line`。

### 2.3 I3 强校验项 (任意一项失败即 I3 FAIL)
1. **AC 是否存在**：提取的 AC 必须在 plan.md 中。
2. **Implementation 是否存在**：`implement.md` 的核对表中必须有该 AC。
3. **格式校验**：必须符合 `path:line` 格式。
4. **路径安全**：禁止绝对路径、`../` 越界路径。解析后路径必须位于 `src/` 或 `public/` 内。
5. **文件存在性**：`path` 对应的文件必须真实存在。
6. **行号有效性**：`line >= 1` 且 `line <= 文件实际总行数`。
7. **AC 集合一致性**：Requirement AC 集合 == Traceability AC 集合（无缺失、无多余、无重复 AC 编号）。

### 2.4 I3 弱校验项 (占位符检查)
- 检查 Location 对应行的代码内容。
- **策略**：优先依赖项目现有的 ESLint `no-warning-comments` 规则。脚本仅做基础兜底：若该行仅包含 `TODO` / `TBD` / `FIXME` / `placeholder` / `待实现` 且无实际业务逻辑代码，则标记为 `WARN`（或根据项目严格度设为 FAIL，建议初期为 WARN 避免误杀合法注释）。

---

## 3. I4 Responsive Decision 改造 (脚本: `scripts/check-req.js`)

### 3.1 校验逻辑 (语义校验代替死板正则)
Requirement 声明 `Responsive: Required` 或 `Not Required`。

**若为 Required**：
1. **Breakpoint 存在性**：必须包含具体的数字与单位（正则匹配 `\d+\s*(px|rem|em)`），如 `1280px`, `< 768px`。
2. **Layout Behavior 存在性**：必须包含具体的布局动作词汇（如 `hidden`, `drawer`, `flex`, `grid`, `scroll`, `stack`, `column` 等），且描述长度 > 10 个字符。
3. **黑名单拦截**：禁止仅填写“自适应”、“响应式良好”、“支持多端”等无信息量空话。

**若为 Not Required**：
1. **Reason 存在性**：必须填写原因（如 `Reason: Desktop-only internal system.`），且长度 > 5 个字符。

---

## 4. Asset Machine Gate (新增脚本: `scripts/check-assets.js`)

### 4.1 职责边界
作为 ESLint 的补充，专门扫描全局静态资源和 HTML 中 ESLint 可能遗漏的硬编码外链，确保“断网可演示”。

### 4.2 扫描范围
- **包含**：`src/**/*.{ts,tsx,js,jsx,css,scss,less}`, `public/**`, `index.html`
- **排除**：`node_modules`, `.git`, `dist`, `build`, `coverage`

### 4.3 检查规则 (发现即 FAIL)
1. **HTML 外部资源**：`<script src="https://...">`, `<link href="https://...">`, `<img src="https://...">`
2. **CSS 外部资源**：`url("https://...")` 或 `url('http://...')`
3. **JS/TSX 外部媒体**：`<img src="https://..." />`, `<source src="https://..." />`
4. **字体/媒体**：任何指向外部的 font, audio, video 资源。

### 4.4 合法资源白名单
允许：相对路径 (`./`, `../`)、绝对根路径 (`/xxx`)、`data:` URI、`blob:` URI。API 请求 URL 不在检查范围内。

---

## 5. Machine Verification 总入口

### 5.1 `package.json` 脚本更新
```json
{
  "scripts": {
    "check:req": "node scripts/check-req.js",
    "check:assets": "node scripts/check-assets.js",
    "check:all": "npm run check:skills && npm run check:req && npm run check:assets && npm run lint && npm run build"
  }
}
```

### 5.2 执行与输出规范
- 顺序执行，任意一步返回非 0 exit code，`check:all` 立即终止并返回非 0。
- 统一输出阶段结果摘要：
  ```text
  [PASS] Skills
  [PASS] Requirements (I1/I2/I3/I4)
  [PASS] Assets
  [PASS] Lint
  [PASS] Build
  ```

---

## 6. README.md 改造 (替代原 verify.md & review.md)

在每个 `requirements/REQ-XXX/README.md` 的末尾，强制增加以下两个标准区块。AI 在相应阶段负责更新此处的 Checklist 和 Result。

### 6.1 Machine Verification 区块
```markdown
## Machine Verification

- [ ] I1 (AC 拆解完备)
- [ ] I2 (无虚假完成)
- [ ] I3 (实现位置对账)
- [ ] I4 (响应式口径一致)
- [ ] Assets (零外链依赖)
- [ ] Lint
- [ ] Build

**Result**: PASS
```
*规则*：`check:all` 全部通过后，AI 自动将所有 `[ ]` 替换为 `[x]`，并将 Result 设为 `PASS`。否则为 `FAIL`。

### 6.2 Human Review 区块
```markdown
## Human Review

- [ ] User Flow (用户流程顺畅)
- [ ] UX (交互体验合理)
- [ ] Visual (视觉符合预设风格)
- [ ] Business (满足业务目标与非目标约束)
- [ ] Demo (演示动线准备就绪，含假数据基线)

**Result**: PENDING
```
*规则*：初始为 `PENDING`。AI 在完成实施后生成此草稿并暂停，提示用户 Review。用户确认无误后回复“Review 通过”，AI 将 `[ ]` 替换为 `[x]`，Result 更新为 `PASS`。若需修改，则为 `FAIL`。

---

## 7. Acceptance Check (新增脚本: `scripts/check-acceptance.js`)

### 7.1 输入源
读取 `requirements/REQ-XXX/README.md`。

### 7.2 判断逻辑
解析 `README.md` 中的两个区块：
```text
IF (Machine Verification Result == "PASS") AND (Human Review Result == "PASS")
  THEN 输出 "ACCEPTED"
  ELSE 输出 "NOT ACCEPTED"
```
*注意*：缺失任一区块或 Result 为其他值，均输出 `NOT ACCEPTED`。

### 7.3 状态隔离
Acceptance 仅作为 Commit 的前置门禁，**不修改** Requirement 的顶层 `status`（仍保持 `PLANNED` / `IMPLEMENTING` / `IMPLEMENTED` / `COMMITTED`）。

---

## 8. Commit Gate 流程升级

修改 `/rudder-commit` 技能的前置检查逻辑，依次验证：
1. Requirement 顶层 `status` == `IMPLEMENTED`
2. `Machine Verification` Result == `PASS`
3. `Human Review` Result == `PASS`
4. `Acceptance` 检查 == `ACCEPTED`

**任一条件失败**：脚本拒绝执行 Git Commit，并输出具体失败的拦截项。

---

## 9. 变更与失效机制 (Section 10 更新)

如果 Requirement 在 Acceptance 后再次发生修改（如执行 `/rudder-adjust` 或 `/rudder-change`）：
1. `plan.md` 或 `implement.md` 发生实质性变更。
2. **自动失效**：AI 必须自动将 `README.md` 中的 `Machine Verification` 和 `Human Review` 的所有 `[x]` 重置为 `[ ]`，Result 重置为 `PENDING` 或 `FAIL`。
3. 强制重新执行：Verify → Review → Acceptance 流程。

---

## 10. Skills / Templates 同步更新

### 10.1 Constitution (`.rudder/constitution.md`)
增加强制规则：
- Implementation Location 必须可被机器验证（文件存在、行号有效）。
- Responsive Decision 必须明确（具体断点与行为，或合理的豁免理由）。
- **Machine Verification 必须 PASS 后，才能请求 Human Review。**
- **Human Review 必须 PASS 后，才能通过 Acceptance 检查并 Commit。**

### 10.2 Plan Skill
生成的 `plan.md` 必须包含明确的 AC 列表和 Responsive Decision。

### 10.3 Implement Skill
实施完成后，必须在 `implement.md` 填写 `AC 实现核对表`（格式：`AC-XX | src/xxx.tsx:line`），并**自动运行** `npm run check:all`，将结果更新到 `README.md` 的 Machine Verification 区块。

### 10.4 Review Skill
确认 `README.md` 中 Machine Verification 为 PASS 后，生成 Human Review Checklist 草稿，等待用户指令后更新 Result。

### 10.5 Commit Skill
Commit 前，内部调用 `check-acceptance.js`。仅当返回 `ACCEPTED` 时，才执行 `git add` / `git commit` 并更新 `commit.md`。

---

## 11. 测试目录与用例设计

在 `tests/` 目录下建立以下 Fixture（零依赖，通过自定义 `scripts/run-tests.js` 运行断言）：

### 11.1 I3 测试数据 (`tests/check-req/i3/`)
- `valid.md` (PASS: 标准 path:line)
- `multi-locations.md` (PASS: 支持逗号分隔的多个位置)
- `missing-file.md` (FAIL: 文件不存在)
- `invalid-line.md` (FAIL: 行号超出文件总行数)
- `outside-path.md` (FAIL: 包含 `../../etc` 越界路径)
- `placeholder.md` (WARN/FAIL: 对应行仅有 `// TODO`)
- `duplicate-ac.md` (FAIL: 两个不同的 AC 指向同一位置，或同一 AC 在表中出现两次)
- `missing-ac.md` (FAIL: plan 中有 AC-3，但核对表中缺失)
- `extra-ac.md` (FAIL: 核对表中有 AC-99，但 plan 中不存在)

### 11.2 I4 测试数据 (`tests/check-req/i4/`)
- `responsive-valid.md` (PASS: 包含 `1280px` 和 `flex/grid` 等行为词)
- `responsive-no-breakpoint.md` (FAIL: 只有行为描述，无数字+单位)
- `responsive-vague.md` (FAIL: 仅包含“自适应”、“响应式良好”)
- `non-responsive-valid.md` (PASS: Not Required + 有效 Reason)
- `non-responsive-no-reason.md` (FAIL: Not Required 但 Reason 为空或过短)

### 11.3 Asset 测试数据 (`tests/check-assets/`)
- `local-image.tsx` (PASS: `<img src="/assets/x.png" />`)
- `external-image.tsx` (FAIL: `<img src="https://..." />`)
- `external-css.css` (FAIL: `background: url("https://...")`)
- `external-script.html` (FAIL: `<script src="https://cdn...">`)
- `data-uri.tsx` (PASS: `<img src="data:image/png;base64,..." />`)

### 11.4 Acceptance 测试 (`tests/acceptance/`)
通过构造不同状态的 `README.md` 片段，验证 `check-acceptance.js` 的输出：
- `verify PASS + review PASS` → `ACCEPTED`
- `verify FAIL + review PASS` → `NOT ACCEPTED`
- `verify PASS + review PENDING` → `NOT ACCEPTED`
- 缺失区块 → `NOT ACCEPTED`

---

## 12. Dogfood (吃狗粮) 验证流程

使用 Rudder Framework 自身创建一个真实的 Requirement (例如: `REQ-999-v101-dogfood`)，完整执行并记录：

1. **Import/Plan**：创建需求，包含明确的 AC 和 Required 响应式。
2. **Implement**：编写代码，填写核对表，运行 `npm run check:all`。
3. **Verify**：AI 自动将 `README.md` 的 Machine Verification 更新为 PASS。
4. **Review**：AI 生成 Human Review 草稿，用户模拟 Review 并回复“通过”，AI 更新为 PASS。
5. **Acceptance**：运行 `node scripts/check-acceptance.js requirements/REQ-999-v101-dogfood`，确认输出 `ACCEPTED`。
6. **Commit**：执行 `/rudder-commit`，确认成功提交。

### 12.1 Dogfood 故障注入 (必须全部被拦截)
依次制造以下错误，验证 Gate 是否生效：
1. 删除 `plan.md` 中的一个 AC → **I3 缺失 AC 拦截**
2. 将 Implementation Location 改为不存在的文件 → **I3 文件不存在拦截**
3. 将行号改为 99999 → **I3 行号越界拦截**
4. 在 `index.html` 中添加一个外部 CDN 脚本 → **Asset Gate 拦截**
5. 在代码中添加 `// TODO: 待完善` 且无实际逻辑 → **I3/ESLint 拦截**
6. 将 `README.md` 的 Human Review Result 手动改回 `PENDING` 后尝试 Commit → **Commit Gate 拦截**

---

## 13. 最终验证与实施顺序

严格按照以下顺序执行改造，每完成一步需通过现有 CI/本地校验：

```text
01. 更新 .rudder/templates/README.md (加入 Machine Verification 和 Human Review 区块)
    ↓
02. 升级 scripts/check-req.js (实现 I3 多位置、路径安全、I4 语义校验)
    ↓
03. 新增 scripts/check-assets.js (实现外链扫描)
    ↓
04. 新增 scripts/check-acceptance.js (解析 README.md 区块)
    ↓
05. 更新 package.json (整合 check:all 命令)
    ↓
06. 更新 7 个 Skills (Plan, Implement, Verify, Review, Commit 等，指向 README.md)
    ↓
07. 建立 tests/ 目录及所有 Fixture 数据
    ↓
08. 编写并运行 scripts/run-tests.js 确保所有 Fixture 断言通过
    ↓
09. 执行 Dogfood 完整流程及 6 项故障注入验证
    ↓
10. 编写 docs/v1.0.1.md 并发布 Release
```

---

### 💡 为什么这个版本更好？
1. **零文件膨胀**：完美维持了 `requirements/` 目录下 6 个核心文件的优雅结构，所有 Gate 状态集中在 `README.md`，AI 读取上下文更高效。
2. **容错性提升**：I4 放弃死板正则，改用“数字+单位”和“行为词汇”的语义校验，大幅降低 AI 生成变体导致的误报；I3 支持多 Location，贴合真实开发场景。
3. **职责清晰**：`check-assets.js` 专注全局静态资源和 HTML 扫描，与 ESLint 的代码级检查形成完美互补，无重复建设。
4. **交互流畅**：Human Review 采用“AI 生成草稿 `[ ]` -> 用户确认 -> AI 自动打勾 `[x]`”的模式，无需用户手动编辑 Markdown 文件，体验极佳。