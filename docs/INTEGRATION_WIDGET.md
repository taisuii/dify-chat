# DifyChat Widget 集成指南

本文档说明如何在 React 项目中集成 `@dify-chat/widget`，包括从本地 tgz 安装、CRA/Webpack 5 兼容配置等场景。

## 为什么本地测试没问题、打包后使用出问题？

在 monorepo 内开发时，依赖通过 `workspace:*` 解析、构建不打包成单一 tgz，且开发环境（如 Rsbuild/Vite）与消费者环境（如 CRA + Webpack 5）不同，会出现：

- **子依赖解析**：安装单个 widget tgz 时，pnpm 会从 npm 解析 `@dify-chat/*`，若未发布则报错，需 overrides 或一次性安装全部 tgz。
- **运行时依赖**：widget 的 `dist` 未 bundle 第三方库，会 `require('i18next-browser-languagedetector')` 等，若未在 package.json 的 dependencies 中声明，消费者构建会报 “Can't resolve”。
- **ESM 解析**：theme 若使用 `lucide-react/dynamic` 等子路径导入，在 Webpack 5 的 `fullySpecified` 下会解析失败；改用主入口导入可避免。
- **类型声明**：构建时若关闭 dts，tgz 中无 `.d.ts`，消费者会报 “Could not find a declaration file”。
- **文档与 API**：文档中的命名（如 ThemeProvider）需与包实际导出一致或提供别名。

本仓库已针对上述问题做修复，并在此文档中说明兼容方式与验收标准。

## 一、从本地 tgz 安装（未发布到 npm 时）

当使用 `pnpm run pack:local` 打包后，需要从 `dist-packages/` 目录安装时，由于 widget 依赖的 `@dify-chat/helpers`、`@dify-chat/core`、`@dify-chat/api`、`@dify-chat/theme` 未发布到 npm registry，pnpm 会尝试从 registry 解析并报错 `No matching version found`。

### 解决方案：配置 pnpm overrides

在**消费者项目**的 `package.json` 中添加 `pnpm.overrides`，将 `@dify-chat/*` 全部指向本地 tgz：

```json
{
  "pnpm": {
    "overrides": {
      "@dify-chat/helpers": "file:./path/to/dify-chat-widget/dist-packages/dify-chat-helpers-0.7.0.tgz",
      "@dify-chat/core": "file:./path/to/dify-chat-widget/dist-packages/dify-chat-core-0.7.0.tgz",
      "@dify-chat/api": "file:./path/to/dify-chat-widget/dist-packages/dify-chat-api-0.7.0.tgz",
      "@dify-chat/theme": "file:./path/to/dify-chat-widget/dist-packages/dify-chat-theme-0.7.0.tgz",
      "@dify-chat/widget": "file:./path/to/dify-chat-widget/dist-packages/dify-chat-widget-0.1.0.tgz"
    }
  }
}
```

然后执行：

```bash
pnpm add @dify-chat/widget
```

或一次性安装所有 tgz（无需 overrides，但需保证相对路径正确）：

```bash
pnpm add ./path/to/dify-chat-widget/dist-packages/*.tgz
```

---

## 二、Create React App + Webpack 5 兼容

若使用**含本次修复**的 `@dify-chat/theme`（已改为从 `lucide-react` 主入口导入图标，不再使用 `lucide-react/dynamic`），在 CRA（react-scripts 5.x）下一般可开箱构建，无需 CRACO。

若仍遇到类似错误：

```
Can't resolve 'lucide-react/dynamic' in '.../node_modules/@dify-chat/theme/dist/components'
The request failed to resolve only because it was resolved as fully specified
```

说明使用的是旧版 theme 包，可升级到最新 tgz，或按以下方式用 CRACO 关闭 `fullySpecified`：

1. 安装 CRACO：

```bash
pnpm add @craco/craco
```

2. 在项目根目录创建 `craco.config.js`：

```js
module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.fullySpecified = false
      return config
    },
  },
}
```

3. 修改 `package.json` 的 scripts，将 `react-scripts` 替换为 `craco`：

```json
{
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test"
  }
}
```

---

## 三、主题 Provider 使用说明

主题包提供两种命名，均可使用：

- `ThemeContextProvider`（推荐，与源码一致）
- `ThemeProvider`（别名，兼容文档中的命名）

```tsx
import { ThemeContextProvider } from '@dify-chat/theme'
import { DifyChat } from '@dify-chat/widget'
// 或使用别名：import { ThemeProvider } from '@dify-chat/theme'

function App() {
  return (
    <ThemeContextProvider>
      <DifyChat apiBase="..." apiKey="..." />
    </ThemeContextProvider>
  )
}
```

---

## 四、支持的打包工具

- **Rsbuild / Vite**：开箱即用，无需额外配置
- **Create React App (Webpack 5)**：theme 与 widget 均已改为从 `lucide-react` 主入口导入图标，CRA 下一般可开箱构建，无需 CRACO
- **Next.js**：一般无需额外配置，如有问题可参考 CRA 方案

---

## 五、版本与依赖

- **React**：>= 18.0.0（包内已提供 `useEffectEvent` 的 React 18 兼容实现）
- **peerDependencies**：`antd` >= 5.0.0，`react` >= 18.0.0，`react-dom` >= 18.0.0，`react-i18next` >= 14.0.0
- **运行时依赖**：`@dify-chat/widget` 已在 dependencies 中声明 `i18next-browser-languagedetector`、`zustand` 等，安装 widget 时会自动安装，无需消费者额外添加。
- **类型声明**：`@dify-chat/theme` 与 `@dify-chat/widget` 的 tgz 内均包含 `.d.ts`。widget 使用手写公开 API 声明（`DifyChat`、`DifyChatProps`），消费者可直接获得类型提示。

## 六、验收标准（CRA + React 18 + pnpm + 本地 tgz）

在以下环境下，**仅按本文档**完成最小集成（overrides + 安装 tgz，无需 CRACO/手写类型/自行补依赖），应能完成构建并运行：

- 包管理：pnpm  
- 脚手架：Create React App (react-scripts 5.x)  
- React：18.x  
- 安装：从 `dist-packages/*.tgz` 安装，并按「一、从本地 tgz 安装」配置 overrides  

若满足上述条件仍无法构建，请提 issue 并附报错与版本信息。

## 七、发布前验证（npm pack + 真实安装测试）

在发布或交付 tgz 前，建议在仓库内跑一遍「打包 → 用 tgz 安装 → 构建」的验证，可提前暴露缺失依赖、类型、产物等问题。

### 一键验证

在仓库根目录执行：

```bash
pnpm run pack:verify
```

流程：先执行 `pack:local` 生成 `dist-packages/*.tgz`，再在 **fixtures/tgz-consumer** 中注入 overrides、执行 `pnpm install` 与 `pnpm build`。若任一步失败则退出码非 0。

### 手动验证

1. `pnpm run pack:local` 生成 tgz。
2. 进入 `fixtures/tgz-consumer`，按 `docs/INTEGRATION_WIDGET.md` 将 `pnpm.overrides` 指向 `../../dist-packages/*.tgz`（或由 `pack:verify` 自动写入后再手动复现）。
3. 执行 `pnpm install`、`pnpm build`。

### 可选：CI 集成

在 CI 中增加「打包验证」阶段，例如：

```yaml
- name: Pack and verify
  run: pnpm run pack:verify
```

也可在干净容器中运行，以更接近真实用户环境。

## 八、测试完全可用并查看接入效果

在确认「能装、能构建」之外，可用以下方式**本地跑起来并看到界面**，验证接入效果。

### 方式一：用 tgz 启动开发服务器（推荐）

在仓库根目录执行：

```bash
pnpm run pack:dev
```

流程：若无 tgz 则先执行 `pack:local`，再将 `fixtures/tgz-consumer` 复制到**临时目录**并写入 overrides（绝对路径）、执行 `pnpm install`，最后启动 Vite 开发服务器。终端会输出本地地址（如 `http://localhost:5173`），在浏览器打开即可看到以 **tgz 安装** 的 DifyChat 接入效果，支持热更新。按 Ctrl+C 退出后临时目录会自动清理。（在临时目录中运行是为了避免 pnpm 发现 workspace 导致安装时去 registry 拉取未发布的 `@dify-chat/*`。）

### 方式二：验证通过后启动构建产物预览

在仓库根目录执行：

```bash
pnpm run pack:verify:preview
```

流程：与 `pack:verify` 相同（打包 → 临时目录安装 tgz → 构建），构建成功后自动启动 Vite 预览服务器（如 `http://localhost:4173`），在浏览器打开可查看**构建后的**接入效果。按 Ctrl+C 退出预览。

### 对比

| 方式 | 命令 | 用途 |
|------|------|------|
| **pack:dev** | 开发服务器 | 用 tgz 安装 + 热更新，方便改代码看效果 |
| **pack:verify:preview** | 验证 + 预览 | 验证「装 tgz → 构建」通过后，再看构建产物的实际效果 |
| **dev:showcase** | 展示应用 | 用 workspace 依赖，看完整展示页（非 tgz 安装） |

### 预览/构建后样式丢失（布局错乱、无气泡/主题色）

widget 使用 **Tailwind** 类名（如 `flex`、`rounded-t-3xl`、`bg-theme-main-bg`、`text-theme-text`），宿主项目需：

1. 安装并配置 **Tailwind CSS**（`tailwindcss`、`postcss`），`content` 包含 `node_modules/@dify-chat/widget/dist/**/*.js`。
2. 在 `theme.extend.colors` 中定义 `theme-text`、`theme-main-bg`、`theme-splitter` 等，值为 `var(--theme-xxx-color)`。
3. 定义**必需的 CSS 变量**（`:root` 与 `.dark`），见 skill「必需的 CSS 变量」。

可参考 `fixtures/tgz-consumer` 的 `tailwind.config.js`、`theme-vars.css` 与 `postcss.config.js`。

### 预览/构建后页面空白、控制台报 "React is not defined"

widget 构建后会自动在需要处注入 `import React from 'react'`（见 `packages/widget/scripts/inject-react-import.mjs`），使用**最新打包的 tgz** 时一般不会出现此问题。若仍报错（例如使用了旧 tgz），请确保入口或根组件中已有 `import React from 'react'`，或重新执行 `pnpm run pack:local` 后使用新 tgz。
