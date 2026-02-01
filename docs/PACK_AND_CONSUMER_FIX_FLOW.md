# 从「打包后对接失败」到「tgz 可跑可看」的修复流程

本文档按**实际修复顺序**记录：在 CRA + React 18 + pnpm 环境下对接 `dist-packages/*.tgz` 时遇到的问题，以及一步步的修复做法，供他人学习「可发布库」在打包与消费者环境下的常见坑与应对。

---

## 一、背景与问题清单

### 1.1 现象

- **本地**：在 monorepo 内 `pnpm dev:showcase` 运行正常。
- **打包后**：消费者从 `dist-packages/*.tgz` 安装，按文档最小集成，出现：
  - 子依赖无法从 registry 解析
  - 运行时依赖缺失导致构建失败
  - ESM 子路径（`lucide-react/dynamic`）在 Webpack 5 下解析失败
  - 类型声明缺失
  - 文档与 API 不一致（如 ThemeProvider）
  - 预览页面空白（React is not defined）
  - 样式丢失（布局错乱、无气泡/主题色）

### 1.2 根因概览

| 问题 | 根因 |
|------|------|
| 子依赖解析失败 | 安装单个 widget tgz 时，pnpm 从 npm 解析 `@dify-chat/*`，未发布则报错 |
| 运行时依赖缺失 | widget dist 未 bundle 第三方库，但 package.json 未声明全部依赖 |
| lucide-react/dynamic | Webpack 5 对 ESM 默认 `fullySpecified`，无扩展子路径解析失败 |
| 类型缺失 | 构建时未生成 .d.ts，tgz 无类型 |
| React is not defined | 部分 dist 文件使用 `React.createElement` 但未 `import React` |
| 样式丢失 | 仅定义 CSS 变量不够，widget 使用 Tailwind 类名，宿主未引入 Tailwind |

---

## 二、修复流程（按执行顺序）

### 步骤 1：子依赖与 overrides 文档

- **问题**：`pnpm add ./dist-packages/dify-chat-widget-0.1.0.tgz` 报 `No matching version found for @dify-chat/helpers@^0.7.0`。
- **原因**：widget 依赖的 `@dify-chat/helpers`、`core`、`api`、`theme` 未发布到 npm，pnpm 从 registry 解析失败。
- **做法**：
  - 在 **docs/INTEGRATION_WIDGET.md** 中写清「从本地 tgz 安装」：必须一次性安装全部 5 个 tgz，或配置 **pnpm.overrides** 将 `@dify-chat/*` 指向本地 tgz。
  - 在 **scripts/pack-packages.mjs** 的结束提示中增加：从本地 tgz 安装若遇子依赖解析失败，参考 `docs/INTEGRATION_WIDGET.md` 配置 overrides。
- **涉及**：`docs/INTEGRATION_WIDGET.md`、`scripts/pack-packages.mjs`。

---

### 步骤 2：运行时依赖声明

- **问题**：消费者构建报 `Can't resolve 'i18next-browser-languagedetector'`、`zustand` 等。
- **原因**：widget 的 dist 中引用了这些包，但 **package.json 的 dependencies** 未声明。
- **做法**：在 **packages/widget/package.json** 的 `dependencies` 中补全：`i18next-browser-languagedetector`、`zustand` 等（本仓库已包含，若你 fork 需核对）。
- **涉及**：`packages/widget/package.json`。

---

### 步骤 3：lucide-react/dynamic → 主入口导入（避免 fullySpecified）

- **问题**：CRA 构建报 `Can't resolve 'lucide-react/dynamic' ... resolved as fully specified`。
- **原因**：theme 与 widget 中使用了 `lucide-react/dynamic` 的子路径导入，Webpack 5 对 ESM 要求完全限定请求。
- **做法**：
  - **theme**：在 **packages/theme/src/components/theme-selector.tsx** 中，将 `import { DynamicIcon } from 'lucide-react/dynamic'` 改为从 `lucide-react` 主入口按名导入（如 `Monitor`、`Sun`、`Moon`），并用对应组件替换 `<DynamicIcon name="..." />`。
  - **widget**：在 **packages/widget/src/components/lucide-icon/index.tsx** 中，不再使用 `lucide-react/dynamic`，改为从 `lucide-react` 主入口导入所需图标，维护一份「图标名 → 组件」的映射表（如 `ICON_MAP`），渲染时从映射表取组件。
- **涉及**：`packages/theme/src/components/theme-selector.tsx`、`packages/widget/src/components/lucide-icon/index.tsx`。

---

### 步骤 3.1：react-syntax-highlighter 子路径 → 带扩展的完全路径（避免 fullySpecified）

- **问题**：CRA 构建报 `Can't resolve 'react-syntax-highlighter/dist/esm/styles/hljs' ... resolved as fully specified`。
- **原因**：widget 的 markdown-renderer 使用无扩展子路径 `react-syntax-highlighter/dist/esm/styles/hljs`，Webpack 5 对 ESM 要求完全限定请求（含扩展名）。
- **做法**：在 **packages/widget/src/components/markdown-renderer/index.tsx** 中，将样式导入改为带扩展的完全路径（该包中 `hljs` 为目录，入口为 `index.js`）：`from 'react-syntax-highlighter/dist/esm/styles/hljs/index.js'`。
- **涉及**：`packages/widget/src/components/markdown-renderer/index.tsx`。

---

### 步骤 4：类型声明（widget 手写 .d.ts）

- **问题**：消费者报 `Could not find a declaration file for module '@dify-chat/widget'`。
- **原因**：widget 构建时 `dts: false`，tgz 中无 `.d.ts`；若开启 dts 则暴露出大量既有 TS 错误导致构建失败。
- **做法**：
  - 在 **packages/widget/declarations/index.d.ts** 中手写公开 API 类型（如 `DifyChatProps`、`DifyChat`）。
  - 在 **packages/widget/rslib.config.ts** 的 `output.copy` 中增加：将 `declarations/index.d.ts` 复制到 `dist/index.d.ts`。
- **涉及**：`packages/widget/declarations/index.d.ts`、`packages/widget/rslib.config.ts`。

---

### 步骤 5：ThemeProvider 别名

- **问题**：文档示例使用 `ThemeProvider`，实际导出为 `ThemeContextProvider`，按文档写会报错。
- **做法**：在 **packages/theme/src/hooks/index.tsx** 中增加 `export const ThemeProvider = ThemeContextProvider`，并在文档中说明两者均可使用。
- **涉及**：`packages/theme/src/hooks/index.tsx`、文档/ skill。

---

### 步骤 6：发布前验证脚本（pack:verify）

- **问题**：无法在发布前系统验证「装 tgz → 构建」是否通过。
- **做法**：
  - 新增 **fixtures/tgz-consumer**：最小 Vite + React 应用，依赖 `@dify-chat/widget`、`@dify-chat/theme`，含 `pnpm.overrides`（由脚本写入）。
  - 新增 **scripts/verify-pack.mjs**：执行 `pack:local` → 将 fixture 复制到**临时目录**并写入 overrides（绝对路径）→ 在临时目录执行 `pnpm install`、`pnpm build`。使用临时目录是为了避免 pnpm 发现 monorepo 根目录导致对 workspace 做安装。
  - 根目录 **package.json** 增加脚本：`pack:verify`。
- **涉及**：`fixtures/tgz-consumer/`、`scripts/verify-pack.mjs`、根目录 `package.json`。

---

### 步骤 7：验证通过后预览（pack:verify:preview）

- **问题**：仅构建通过无法直观看到「装 tgz 后的页面效果」。
- **做法**：在 **scripts/verify-pack.mjs** 中支持 `--preview`：构建成功后不删临时目录，在临时目录执行 `pnpm preview`，启动 Vite 预览服务器；根目录增加 `pack:verify:preview`。
- **涉及**：`scripts/verify-pack.mjs`、根目录 `package.json`。

---

### 步骤 8：预览页面空白 / React is not defined

- **问题**：打开 pack:verify:preview 的地址后页面空白，控制台报 `React is not defined`。
- **原因**：widget 的 dist 中部分文件使用 `React.createElement`，但构建输出未包含 `import React from 'react'`（rslib lib 构建部分文件仍输出经典 JSX）。
- **做法**：
  - 新增 **packages/widget/scripts/inject-react-import.mjs**：构建结束后扫描 `dist/**/*.js` 与 `*.cjs`，在包含 `React.createElement` 且未已有 React 引入的文件顶部注入 `import React from 'react';`（ESM）或 `var React = require('react');`（CJS）。
  - **packages/widget/package.json** 的 `build` 改为：`rslib build && node scripts/inject-react-import.mjs`。
- **涉及**：`packages/widget/scripts/inject-react-import.mjs`、`packages/widget/package.json`。

---

### 步骤 9：用 tgz 启动开发服务器（pack:dev）

- **问题**：在仓库根执行 `pnpm install --dir fixtures/tgz-consumer` 时，pnpm 做 workspace 安装，会解析 `packages/widget` 等包的依赖并报子依赖找不到。
- **做法**：
  - 新增 **scripts/run-pack-dev.mjs**：与 verify 类似，在**临时目录**中复制 fixture、写入 overrides（绝对路径）、`pnpm install`、`pnpm dev`；Ctrl+C 时清理临时目录。
  - 根目录 `pack:dev` 改为调用该脚本，不再在仓库内对 fixture 直接 install。
- **涉及**：`scripts/run-pack-dev.mjs`、根目录 `package.json`。

---

### 步骤 10：样式丢失（CSS 变量 + Tailwind）

- **问题**：预览能打开，但聊天区域无布局、无气泡样式，像「丢样式」。
- **原因**：
  - 只补了 **CSS 变量**（`:root` / `.dark` 的 `--theme-*`），但 widget 还大量使用 **Tailwind** 类名（如 `flex`、`rounded-t-3xl`、`bg-theme-main-bg`、`text-theme-text`）。宿主未引入 Tailwind 时，这些类不会生成任何样式。
- **做法**：
  - 在 **fixtures/tgz-consumer** 中：安装 **tailwindcss**、**postcss**（devDependencies），新增 **postcss.config.js**、**tailwind.config.js**。
  - **tailwind.config.js**：`content` 包含 `./node_modules/@dify-chat/widget/dist/**/*.js`；`theme.extend.colors` 定义 `theme-text`、`theme-main-bg`、`theme-splitter` 等，值为 `var(--theme-xxx-color)`；`darkMode: 'selector'`。
  - **fixtures/tgz-consumer/src/theme-vars.css**：在原有 CSS 变量前增加 `@tailwind base;`、`@tailwind components;`、`@tailwind utilities;`，并在 **main.tsx** 中引入该 CSS。
- **涉及**：`fixtures/tgz-consumer/package.json`、`fixtures/tgz-consumer/postcss.config.js`、`fixtures/tgz-consumer/tailwind.config.js`、`fixtures/tgz-consumer/src/theme-vars.css`、`fixtures/tgz-consumer/src/main.tsx`。

---

### 步骤 11：文档与 skill 同步

- **做法**：
  - **docs/INTEGRATION_WIDGET.md**：补充「为什么本地测试没问题、打包后出问题」；CRA 兼容说明；发布前验证（pack:verify、pack:verify:preview）；测试与查看接入效果（pack:dev、pack:verify:preview）；预览/构建后样式丢失（需 Tailwind + 主题色 + CSS 变量）；React is not defined 说明（widget 已注入 React 引用）。
  - **dify-chat-widget-integration skill**：增加「样式完整显示：CSS 变量 + Tailwind」；「样式不生效 / 丢样式」中增加 Tailwind 配置要点；最小依赖清单中注明「样式完整显示」需 Tailwind，并指向 `fixtures/tgz-consumer` 作为参考。
- **涉及**：`docs/INTEGRATION_WIDGET.md`、skill 文件。

---

## 三、验证与验收

- **pack:verify**：在仓库根执行，应完成「打包 → 临时目录安装 tgz → 构建」且无报错。
- **pack:verify:preview**：同上，构建成功后自动启动预览；浏览器打开给定地址，应看到 DifyChat 界面，布局与主题样式正常，无空白、无 React is not defined、无「丢样式」。
- **pack:dev**：在仓库根执行，应在临时目录中安装 tgz 并启动开发服务器；浏览器打开后效果同上，且可热更新（用于调试 fixture 代码）。

验收标准：在 CRA + React 18 + pnpm 环境下，按 skill/INTEGRATION_WIDGET 完成最小集成（overrides + 安装 tgz + CSS 变量 + Tailwind 配置），无需 CRACO、手写类型、自行补依赖，即可构建并运行，且样式完整。

---

## 四、小结：供他人学习

1. **开发环境 ≠ 消费者环境**：monorepo 内 workspace 解析、不打包 tgz、本机打包工具与消费者（CRA/Webpack 5）可能不同，要在「装 tgz + 消费者构建」下验证。
2. **依赖要写全**：库的 dist 若未 bundle 第三方包，所有运行时用到的依赖都应在 **dependencies** 中声明；子依赖若未发布，需在文档中说明 overrides 或一次性安装全部 tgz。
3. **避免 ESM 子路径坑**：在 Webpack 5 等环境下，尽量用包的主入口导入，少用无扩展名的子路径（如 `lucide-react/dynamic`），或文档中写明所需构建配置。
4. **类型与产物**：发布用 tgz 应包含类型（.d.ts）；若构建链暂无法全量 dts，可手写公开 API 声明并在构建时复制到 dist。
5. **文档与 API 一致**：示例中的组件名、导出名要与包实际导出一致，或提供别名。
6. **发布前验证**：用「打包 → 在隔离环境（临时目录）安装 tgz → 构建 → 可选预览」的脚本（如 pack:verify / pack:verify:preview）提前发现问题。
7. **React 与构建链**：若 dist 中仍出现 `React.createElement` 且无 `import React`，需在构建后注入 React 引用，或从源头统一为新 JSX 运行时。
8. **样式完整 = CSS 变量 + Tailwind**：若组件使用 Tailwind 类名，消费者需安装并配置 Tailwind（content 含库的 dist、theme 与 CSS 变量一致），并在文档/skill 中写清。

以上流程对应的具体文件与命令，见第二节各步骤「涉及」与仓库内 `docs/INTEGRATION_WIDGET.md`、`fixtures/tgz-consumer`。
