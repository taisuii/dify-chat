---
name: project-architecture
description: Documents Dify Chat Widget project architecture and module purposes. Use when adding features, modifying modules, onboarding developers, or when the user asks about project structure, packages, or where to change specific functionality.
---

# Dify Chat Widget 项目架构

本 skill 描述项目整体架构与各包/模块的职责，便于开发者按文档定位功能、更新或维护模块。

## 项目概览

- **技术栈**: pnpm monorepo，React 19，TypeScript，Rsbuild / Rslib
- **根命令**: `pnpm build` 全量构建，`pnpm build:pkgs` 仅构建 `@dify-chat/*` 包
- **运行环境**: Node.js ^22.21.1，pnpm ^10.8.1

## 包与模块职责

### 1. `packages/api` — @dify-chat/api

**用途**: 封装 Dify 后端 API，供上层统一调用。

- **入口**: `src/index.ts` 导出 API 类、枚举、类型
- **核心**: `src/api/index.ts` — 应用信息、会话、消息、文件、语音、Workflow、文本生成等接口
- **依赖**: `src/base-request.ts` 处理请求与 `UnauthorizedError`
- **维护要点**: 新增 Dify 能力时在此包增加方法；类型与枚举在 `src/types`、`src/enums`

### 2. `packages/core` — @dify-chat/core

**用途**: 提供应用、对话等全局上下文，供 React 消费。

- **入口**: `src/index.ts`
- **上下文**: `AppContext`（当前应用配置）、`ConversationContext`（对话列表与当前对话）
- **仓库层**: `src/repository/` 抽象数据获取（如 app）
- **维护要点**: 切换应用/对话的 Provider 与 hook 在此包；新增全局上下文时在此扩展

### 3. `packages/helpers` — @dify-chat/helpers

**用途**: 通用工具，被 api、widget、react-app 等复用。

- **导出**: `base-request`、`id`、`gzip`、`localstorage`、`responsive`、`vars`
- **维护要点**: 与业务无关的请求封装、ID 生成、压缩、本地存储、响应式、变量等放这里；避免在业务包内重复实现

### 4. `packages/theme` — @dify-chat/theme

**用途**: 主题管理（浅色/深色/跟随系统）及主题上下文。

- **入口**: `src/index.ts`
- **组件**: `ThemeContextProvider`、`ThemeSelector`
- **Hook**: `useThemeContext()` 返回 `theme`、`themeMode`、`setThemeMode`
- **维护要点**: 主题模式、常量、类型在此包；UI 只消费 context，不实现主题逻辑

### 5. `packages/widget` — @dify-chat/widget

**用途**: 可复用的 Dify 聊天组件库，可被嵌入第三方页面。

- **依赖**: 依赖 `@dify-chat/api`、`core`、`helpers`、`theme`；peer: antd、react、react-dom、react-i18next
- **结构**:
  - `src/components/`: 聊天框、会话列表、布局、Markdown 渲染、消息发送、表单、调试等
  - `src/config/`、`src/constants/`、`src/enums/`、`src/hooks/`、`src/layout/`、`src/store/`、`src/utils/`、`src/libs/i18n.ts`
- **维护要点**: 嵌入态 UI 与交互在此包；与 Dify API 的对接通过 `@dify-chat/api`，不直接写请求逻辑

### 6. `packages/react-app` — dify-chat-app-react

**用途**: 独立 Web 应用（完整站点的 React 前端），使用 Rsbuild 构建。

- **入口**: `src/index.tsx` → `App.tsx`
- **结构**:
  - `src/pages/`: 页面级组件（如 widget-test）
  - `src/components/`: 与 widget 类似的聊天框、会话列表、布局、Markdown、消息发送等（可复用或区别于 widget）
  - `src/layout/`、`src/hooks/`、`src/store/`、`src/services/`、`src/utils/`、`src/config/`、`src/libs/i18n.ts`
- **维护要点**: 全站路由、页面、与后端/平台的集成在此；和 widget 共用的逻辑尽量放在 `widget` 或 `api/core/helpers/theme`

## 依赖关系（高层）

```
react-app / 第三方页面
    → widget（可选，嵌入聊天）
    → api, core, helpers, theme
api → helpers（如 base-request）
widget → api, core, helpers, theme
```

## 修改功能时如何选包

| 需求 | 建议包/位置 |
|------|-------------|
| 调用或封装新的 Dify API | `packages/api` |
| 应用/对话等全局状态与上下文 | `packages/core` |
| 主题模式、主题切换 UI | `packages/theme` |
| 嵌入聊天 UI、消息展示、输入区 | `packages/widget` |
| 独立站点页面、路由、平台对接 | `packages/react-app` |
| 通用工具（ID、存储、请求封装等） | `packages/helpers` |

## 更多细节

- 各包内文件与子模块说明见 [reference.md](reference.md)。
- 根目录 `README.md`、各包下 `README.md` 和 `package.json` 的 `scripts` 可作为补充参考。
