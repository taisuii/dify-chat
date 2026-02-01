---
name: dify-chat-widget-integration
description: 集成 DifyChat Widget 组件到 React 项目中。当需要将 Dify 聊天界面嵌入到现有项目、使用 @dify-chat/widget 组件、配置主题样式或处理 DifyChat 相关集成时使用此技能。
---

# DifyChat Widget 集成

DifyChat Widget 是一个可复用的 React 聊天组件，用于快速对接 Dify AI 应用。

## 对接清单（集成前必读）

**简化后**：以下为「必须由接入方做的」与「可选/内置」的边界，按此做即可获得与 **widget-showcase** 一致的效果。

| 项 | 必须？ | 说明 | 不做的后果 |
|----|--------|------|------------|
| **1. 主题色（CSS 变量）** | 二选一 | **方式 A（推荐）**：直接引入 Widget 内置主题：`import '@dify-chat/widget/theme-default.css'`。<br>**方式 B**：自己在 CSS 里定义 `:root` 与 `.dark` 下的主题变量（见下文）。 | 主题色不生效、布局/颜色错乱 |
| **2. Tailwind** | ✅ 必须 | 安装并配置 Tailwind：content 含 `node_modules/@dify-chat/widget/dist/**/*.js`，theme 扩展主题色（见下文）。 | 类名不生效，界面「无样式」 |
| **3. 国际化 (i18n)** | ✅ 最小即可 | **无需**自己提供文案。在入口执行一次 init，并在 **init 完成后**调用 `addDifyChatI18n(i18n)`（从 `@dify-chat/widget` 引入），将 Widget 文案注入到你用的 i18n 实例。打包后若存在多份 i18next，必须显式调用，否则会报错或显示 key。 | 若不 init 或不调用 addDifyChatI18n(i18n)，界面会显示 key 或报错 |
| **4. Ant Design 深色** | ✅ 建议 | 深色模式下用 `ConfigProvider` 的 `theme.algorithm: darkAlgorithm`。 | 弹窗、按钮等在深色下仍为浅色 |

**总结**：接入方**必须**做的是：Tailwind 配置、一次 i18n init 并在 init 完成后调用 **addDifyChatI18n(i18n)**、（建议）Ant 深色。主题色可**内置**（import theme-default.css）或自己写。i18n 文案由 Widget 提供，通过 **addDifyChatI18n(i18n)** 注入，无需手写 resources。

## 安装方式

### 方式一：从 GitHub 安装（推荐）

从 [taisuii/dify-chat](https://github.com/taisuii/dify-chat) 的 `dist-packages/` 直接安装 `*-latest.tgz`，一次性安装全部 5 个包：

```bash
pnpm add https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-helpers-latest.tgz \
         https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-core-latest.tgz \
         https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-api-latest.tgz \
         https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-theme-latest.tgz \
         https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-widget-latest.tgz
```

**注意**：必须一次性安装全部 5 个包，因为它们有依赖关系。`*-latest.tgz` 始终指向仓库 main 分支上的最新构建。

### 方式二：从本地 tgz 安装（私有部署 / 离线）

在 dify-chat 仓库根目录执行 `pnpm pack:local` 生成 tgz 后，在目标项目中一次性安装：

```bash
pnpm add /path/to/dify-chat/dist-packages/dify-chat-helpers-latest.tgz \
         /path/to/dify-chat/dist-packages/dify-chat-core-latest.tgz \
         /path/to/dify-chat/dist-packages/dify-chat-api-latest.tgz \
         /path/to/dify-chat/dist-packages/dify-chat-theme-latest.tgz \
         /path/to/dify-chat/dist-packages/dify-chat-widget-latest.tgz
```

### 方式三：从本地路径安装（仅限 monorepo 内开发）

仅在 dify-chat 仓库内（如开发 widget-showcase）时，可直接引用本地包路径：

```bash
# 先在 dify-chat 根目录执行 pnpm install
pnpm add /path/to/dify-chat/packages/widget
```

若在**独立项目**中用本地包，只装 widget 会导致 @dify-chat/theme 等解析失败，请改用方式一（GitHub）或方式二（tgz），或配置 `pnpm.overrides` 将 `@dify-chat/*` 指向对应 tgz。

### 方式四：从 npm 安装（如已发布）

```bash
pnpm add @dify-chat/widget @dify-chat/theme
```

## Peer Dependencies

确保项目中已安装以下依赖：

```json
{
  "antd": ">=5.0.0",
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0",
  "react-i18next": ">=14.0.0"
}
```

**注意**：DifyChat Widget 完全兼容 React 18 和 React 19。内部使用了 `useEffectEvent` 的 polyfill 实现，无需担心版本兼容性。

## 样式完整显示：CSS 变量 + Tailwind

DifyChat 的布局与主题样式依赖两件事，缺一会导致「丢样式」（布局错乱、无气泡/主题色）。

### 1. 主题色（二选一：内置 or 自写）

**方式 A（推荐）**：直接引入 Widget 内置主题，无需手写变量：

```ts
// 在入口 CSS 或 main.tsx 中
import '@dify-chat/widget/theme-default.css'
```

**方式 B**：在宿主项目中自己定义以下 CSS 变量（`:root` 与 `.dark`）：

```css
:root {
  --theme-text-color: #333;
  --theme-desc-color: #898989;
  --theme-bg-color: #f2f4f7;
  --theme-btn-bg-color: #fff;
  --theme-main-bg-color: #fff;
  --theme-border-color: #eff0f5;
  --theme-splitter-color: #eff0f5;
  --theme-button-border-color: #c9c9c9;
  --theme-primary-color: #1669ee;
  --theme-success-color: #52c41a;
  --theme-warning-color: #faad14;
  --theme-danger-color: #ff4d4f;
  --theme-bubble-bg-color: #f2f4f7;
  --theme-code-block-bg-color: #fff;
}

/* 暗色模式 */
.dark {
  --theme-text-color: #c9c9c9;
  --theme-desc-color: #aaa;
  --theme-bg-color: #000;
  --theme-btn-bg-color: #333;
  --theme-main-bg-color: #222;
  --theme-border-color: #797979;
  --theme-splitter-color: #55555555;
  --theme-button-border-color: #c9c9c9;
  --theme-bubble-bg-color: #424242;
  --theme-code-block-bg-color: #222;
}
```

### 2. Tailwind（布局与主题类名）

Widget 内部使用 **Tailwind** 类名（如 `flex`、`rounded-t-3xl`、`bg-theme-main-bg`、`text-theme-text`、`border-theme-splitter`）。若宿主项目未引入 Tailwind，这些类不会生成样式，界面会显得「无样式」。

**做法**：在宿主项目中安装并配置 Tailwind，并让 Tailwind 扫描 widget 的 dist 中的类名、扩展主题色：

- **安装**：`tailwindcss`、`postcss`（devDependencies）
- **content**：包含 `node_modules/@dify-chat/widget/dist/**/*.js`，以便扫描 widget 用到的类名
- **theme.extend.colors**：定义 `theme-text`、`theme-main-bg`、`theme-splitter` 等，值为 `var(--theme-xxx-color)`（与上面 CSS 变量对应）
- **darkMode**：`'selector'`，与 `.dark` 配合
- **入口 CSS**：在引入主题变量的同一份（或先于组件的）CSS 中写 `@tailwind base;`、`@tailwind components;`、`@tailwind utilities;`

可参考仓库 **fixtures/tgz-consumer** 的 `tailwind.config.js`、`theme-vars.css`、`postcss.config.js`。

### 3. 国际化 (i18n) — 最小 init + 显式注入 Widget 文案

**接入方**在入口（如 main.tsx）import 你的 i18n 文件；该文件中执行 init，并在 **init 完成后**调用 `addDifyChatI18n(i18n)`，将 Widget 内置文案注入到你用的 i18n 实例。**无需**自己写 `resources`。

**做法**（推荐，与 showcase / tgz-consumer 一致）：

```ts
import { addDifyChatI18n } from '@dify-chat/widget'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'  // 可选

i18n
  .use(LanguageDetector)  // 可选
  .use(initReactI18next)
  .init({ fallbackLng: 'en', interpolation: { escapeValue: false } })
  .then(() => {
    addDifyChatI18n(i18n)  // 必须：注入 Widget 文案到当前 i18n 实例
  })
```

**原因**：打包后宿主与 Widget 可能使用不同的 i18next 副本，Widget 无法可靠拿到「你用的那个 i18n」，所以需在 init 后显式调用 `addDifyChatI18n(i18n)`。

### 4. Ant Design 深色模式 — 与 showcase 一致

Widget 内使用了 Ant Design 的 Button、Drawer、Modal、Select 等；深色模式下需让 Ant 使用深色算法，否则弹窗、按钮等会仍是浅色。在包裹 DifyChat 的根组件中：

- 使用 `useThemeContext()` 取 `isDark`
- 用 `ConfigProvider` 的 `theme={{ algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}`
- 可选：`locale={i18n.language === 'zh' ? zhCN : enUS}` 与语言切换一致

可参考 **packages/widget-showcase/src/App.tsx** 或 **fixtures/tgz-consumer/src/App.tsx**。

## 基础用法

### 最简示例

```tsx
import { ThemeContextProvider } from '@dify-chat/theme'
import { DifyChat } from '@dify-chat/widget'
import '@dify-chat/widget/theme-default.css'  // 内置主题，无需手写 CSS 变量
import './libs/i18n'  // init 后调用 addDifyChatI18n(i18n)，见上文「国际化」

function App() {
  return (
    <ThemeContextProvider>
      <div style={{ height: '100vh' }}>
        <DifyChat apiBase="https://your-dify-instance.com/v1" apiKey="app-xxxxxx" user="user-123" />
      </div>
    </ThemeContextProvider>
  )
}
```

**注意**：仍需在宿主项目中配置 **Tailwind**（content 含 widget dist、theme 扩展主题色），否则类名不生效。深色模式建议加 ConfigProvider 的 `theme.algorithm: darkAlgorithm`。

### 带主题切换（含 Ant 深色与 i18n，与 showcase 一致）

```tsx
import { theme as antdTheme, ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import { useTranslation } from 'react-i18next'
import { ThemeModeEnum, useThemeContext, ThemeProvider } from '@dify-chat/theme'
import { DifyChat } from '@dify-chat/widget'

// 入口处先 import i18n 初始化（见上文「国际化」）
import './libs/i18n'

function ChatPage() {
  const { themeMode, setThemeMode, isDark } = useThemeContext()
  const { i18n } = useTranslation()

  return (
    <ConfigProvider
      locale={i18n.language?.startsWith('zh') ? zhCN : enUS}
      theme={{ algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}
    >
      <div style={{ height: '100vh' }}>
        <select value={themeMode} onChange={(e) => setThemeMode(e.target.value as ThemeModeEnum)}>
          <option value={ThemeModeEnum.SYSTEM}>跟随系统</option>
          <option value={ThemeModeEnum.LIGHT}>亮色</option>
          <option value={ThemeModeEnum.DARK}>暗色</option>
        </select>
        <DifyChat apiBase="https://your-dify-instance.com/v1" apiKey="app-xxxxxx" user="user-123" />
      </div>
    </ConfigProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ChatPage />
    </ThemeProvider>
  )
}
```

## DifyChat Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `apiBase` | string | ✅ | Dify API 地址，如 `https://api.dify.ai/v1` |
| `apiKey` | string | ✅ | Dify 应用的 API Key |
| `user` | string | 可选 | 用户标识，用于会话隔离；不传时组件内部会生成唯一 ID |
| `initialTheme` | 'light' \| 'dark' \| 'system' | 可选 | 初始主题（非受控） |
| `initialLanguage` | 'en' \| 'zh' | 可选 | 初始语言（非受控） |
| `theme` / `language` | 同上 | 可选 | 受控模式，由外部控制 |
| `onThemeChange` / `onLanguageChange` | function | 可选 | 内部切换时通知外部 |
| `onError` | (error: Error) => void | 可选 | 错误回调 |

## 常见问题

### 样式不生效 / 丢样式

确保对接清单中 **1、2、4** 已实现：
1. 已导入包含 **CSS 变量**定义的样式文件（`:root` 与 `.dark`）
2. **ThemeProvider** 包裹在组件外层
3. **Tailwind** 已安装并配置：content 包含 `node_modules/@dify-chat/widget/dist/**/*.js`，theme.extend.colors 包含 `theme-text`、`theme-main-bg` 等（值为 `var(--theme-xxx-color)`），入口 CSS 中有 `@tailwind base/components/utilities`
4. 暗色模式时 **body** 上有 `.dark` class（由 ThemeProvider 自动维护）
5. **Ant Design 深色**：用 `ConfigProvider` 的 `theme.algorithm: isDark ? darkAlgorithm : defaultAlgorithm`，否则弹窗/按钮在深色下仍为浅色

### 界面显示 key 或报错 "addResourceBundle is not a function"

说明 i18n 未正确注入 Widget 文案。请在入口的 i18n 文件中：1）执行 `i18n.use(initReactI18next).init(...)`；2）在 **init 完成后**（如 `.then(...)`）调用 `addDifyChatI18n(i18n)`（从 `@dify-chat/widget` 引入）。打包后若存在多份 i18next，必须显式调用，否则会报错或显示 key。

### 暗色模式切换

`ThemeProvider` 会自动在 **body** 上添加/移除 `.dark` class。确保 CSS 变量同时定义了 `:root` 和 `.dark` 两套值。

### TypeScript 类型

所有包都导出了完整的 TypeScript 类型定义。

## 包结构说明

| 包名 | 用途 | 是否需要手动安装 |
|------|------|----------------|
| `@dify-chat/widget` | 主组件，包含 `DifyChat` | ✅ 是 |
| `@dify-chat/theme` | 主题相关，包含 `ThemeProvider`、`useThemeContext` | ✅ 是 |
| `@dify-chat/api` | Dify API 客户端 | ❌ 否（作为 widget 依赖自动安装） |
| `@dify-chat/core` | 核心 hooks 和状态管理 | ❌ 否（作为 widget 依赖自动安装） |
| `@dify-chat/helpers` | 工具函数 | ❌ 否（作为 widget 依赖自动安装） |

**通常只需导入 `@dify-chat/widget` 和 `@dify-chat/theme`**，其他包会作为依赖自动安装。

## 最小依赖清单

接入 DifyChat Widget 时，项目的 `package.json` 至少需要：

**从 GitHub 安装**（推荐）：

```json
{
  "dependencies": {
    "@dify-chat/api": "https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-api-latest.tgz",
    "@dify-chat/core": "https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-core-latest.tgz",
    "@dify-chat/helpers": "https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-helpers-latest.tgz",
    "@dify-chat/theme": "https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-theme-latest.tgz",
    "@dify-chat/widget": "https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-widget-latest.tgz",
    "antd": ">=5.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-i18next": "^16.5.1",
    "i18next": "^25.7.4"
  }
}
```

**从 npm 安装**（如已发布）：`@dify-chat/widget`、`@dify-chat/theme` 加 peer 依赖即可。

**样式完整显示**（避免「丢样式」）：需在宿主项目中安装并配置 **Tailwind**（`tailwindcss`、`postcss` 为 devDependencies），并按上文「Tailwind」小节配置 content 与 theme 主题色。可参考仓库 [taisuii/dify-chat](https://github.com/taisuii/dify-chat) 的 `fixtures/tgz-consumer`。

**不需要**手动安装 mermaid、katex、echarts、markdown 渲染器等，这些都已包含在 widget 中。

## 其他注意事项

- **从 GitHub / tgz 安装**：必须一次性安装全部 5 个包；若只能先装 widget 再补装，需在 `package.json` 中配置 `pnpm.overrides` 将 `@dify-chat/*` 指向对应 tgz URL 或本地路径。
- **Create React App**：CRA（react-scripts 5.x）已支持，无需 CRACO 或 eject。
- **TypeScript**：theme 与 widget 的 tgz 均含 `.d.ts`，安装后即有类型提示。
- **包管理**：上述示例为 pnpm；若使用 npm，overrides 写法不同，见仓库集成文档。
