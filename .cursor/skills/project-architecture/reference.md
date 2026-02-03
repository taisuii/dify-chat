# 项目架构 — 模块与文件参考

与 [SKILL.md](SKILL.md) 配合使用，提供包内目录与关键文件说明，便于定位修改点。

## packages/api

| 路径 | 用途 |
|------|------|
| `src/index.ts` | 导出 API、枚举、类型 |
| `src/api/index.ts` | DifyApi 类：getAppInfo、getAppParameters、listConversations、sendMessage、uploadFile、runWorkflow 等 |
| `src/base-request.ts` | 请求封装、UnauthorizedError |
| `src/enums/` | 事件等枚举 |
| `src/types/` | 请求/响应类型（message、file、event 等） |

## packages/core

| 路径 | 用途 |
|------|------|
| `src/index.ts` | 导出 Context、Provider、hooks |
| `src/hooks/` | useAppContext、useConversationsContext 等 |
| `src/repository/` | 应用等数据获取抽象 |
| `src/constants/`、`src/enums/`、`src/types/`、`src/utils/` | 常量、枚举、类型、工具 |

## packages/helpers

| 路径 | 用途 |
|------|------|
| `src/index.ts` | 汇总导出 |
| `src/base-request.ts` | 基础请求（与 api 包可能共用逻辑） |
| `src/id.ts` | ID 生成（如 UUID） |
| `src/gzip.ts` | Gzip 压缩/解压 |
| `src/localstorage.ts` | 本地存储封装 |
| `src/responsive/` | 响应式相关 |
| `src/vars.ts` | 环境/变量工具 |

## packages/theme

| 路径 | 用途 |
|------|------|
| `src/index.ts` | 导出 Provider、Selector、hook、枚举与类型 |
| `src/components/` | ThemeContextProvider、ThemeSelector |
| `src/constants/`、`src/hooks/` | 主题常量与 hook |

## packages/widget

| 路径 | 用途 |
|------|------|
| `dist/cjs/` | CJS 构建产物（index.cjs 及 chunk），与 CSS/.d.ts 隔离，避免 Next.js 中 context require 误匹配 |
| `dist/assets/` | 主题与 Markdown 样式（theme-default.css、markdown-renderer.css） |
| `src/index.ts` | 包入口 |
| `src/components/` | 聊天框(chatbox)、会话列表(conversation-list)、布局(layout)、Markdown(markdown-renderer)、消息发送(message-sender)、表单(form)、调试(debug-mode)、i18n-switcher、lucide-icon 等 |
| `src/config/` | 运行时配置 |
| `src/constants/`、`src/storage.ts` | 常量与存储 key |
| `src/enums/` | 业务枚举 |
| `src/hooks/` | use-auth、use-jump、use-latest、useX（含 workflow-data-storage） |
| `src/layout/` | chat-layout、common-layout、main-layout、workflow-layout |
| `src/libs/i18n.ts` | 国际化 |
| `src/store/` | 全局状态（如 zustand） |
| `src/theme/config.ts` | 主题配置 |
| `src/types/` | 组件与业务类型 |
| `src/utils/` | dify-api 封装与通用工具 |

## packages/widget-showcase

| 路径 | 用途 |
|------|------|
| `src/index.tsx`、`src/App.tsx` | 应用入口与根组件 |
| `src/pages/showcase.tsx` | 展示 DifyChat 组件使用效果的页面 |
| `src/libs/i18n.ts` | 国际化 |
| `src/App.css` | 主题变量与基础样式 |
| `rsbuild.config.ts` | Rsbuild 构建配置 |

## 根目录

| 路径 | 用途 |
|------|------|
| `package.json` | 根脚本：build、dev:showcase、build:pkgs、test、lint、format 等 |
| `pnpm-workspace.yaml` | workspace 与 catalog 定义 |

修改功能时：先根据 [SKILL.md](SKILL.md) 的「修改功能时如何选包」确定包，再在本 reference 中查该包下的具体文件。
