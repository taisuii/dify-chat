# Dify Chat Widget

可复用的 Dify 聊天 React 组件，用于将 Dify AI 应用嵌入到任意 Web 页面。

## 快速开始

### 安装（从 GitHub，推荐）

```bash
pnpm add https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-helpers-latest.tgz \
         https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-core-latest.tgz \
         https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-api-latest.tgz \
         https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-theme-latest.tgz \
         https://github.com/taisuii/dify-chat/raw/main/dist-packages/dify-chat-widget-latest.tgz
```

**注意**：必须一次性安装全部 5 个包。详见 [SKILL.md](./SKILL.md) 或 [docs/INTEGRATION_WIDGET.md](./docs/INTEGRATION_WIDGET.md)。

### 最简示例

```tsx
import { ThemeContextProvider } from '@dify-chat/theme'
import { DifyChat } from '@dify-chat/widget'
import '@dify-chat/widget/theme-default.css'
import './libs/i18n'  // 见 SKILL.md 中的 i18n 配置

function App() {
  return (
    <ThemeContextProvider>
      <DifyChat apiBase="https://your-dify-instance.com/v1" apiKey="app-xxxxxx" user="user-123" />
    </ThemeContextProvider>
  )
}
```

接入还需配置 **Tailwind**、**i18n**（含 `addDifyChatI18n`）、**Ant Design 深色模式**，详见 [SKILL.md](./SKILL.md)。

## 本项目使用方式

### 作为开发者

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm build` | 全量构建 |
| `pnpm build:pkgs` | 仅构建 @dify-chat/* 包 |
| `pnpm pack:local` | 打包成 dist-packages/*-latest.tgz |
| `pnpm pack:verify` | 验证 tgz 安装与构建 |
| `pnpm dev:showcase` | 启动 widget-showcase 预览 |
| `pnpm test` | 运行测试 |

### 作为接入方

1. **从 GitHub 安装**（推荐）：见上方「快速开始」
2. **从本地 tgz 安装**：在仓库根目录执行 `pnpm pack:local` 后，从 `dist-packages/` 安装
3. **详细集成步骤**：见 [SKILL.md](./SKILL.md) 或 [docs/INTEGRATION_WIDGET.md](./docs/INTEGRATION_WIDGET.md)

## AI Agent 对接

本仓库提供 **SKILL.md**，供 AI Agent（如 Cursor、Claude、Copilot 等）在协助用户集成 Dify Chat Widget 时调用。

- **文件**：[SKILL.md](./SKILL.md)
- **用途**：包含完整的对接清单、安装方式、样式配置、i18n、常见问题等，Agent 可直接按其中步骤指导用户完成集成
- **使用方式**：在 AI 对话中引用 `@SKILL.md` 或 `@dify-chat-widget-integration`，或将该文件内容加入 Agent 的上下文，即可获得标准化集成指导

示例提示词：

> 请参考本仓库的 SKILL.md，帮我将 Dify Chat Widget 集成到当前的 React 项目中。

## 项目结构

| 包 | 用途 |
|------|------|
| `packages/widget` | 主聊天组件 |
| `packages/theme` | 主题 Provider |
| `packages/api` | Dify API 客户端 |
| `packages/core` | 核心 hooks |
| `packages/helpers` | 工具函数 |
| `packages/widget-showcase` | 展示与预览 |
| `fixtures/tgz-consumer` | tgz 安装验证 fixture |

## 相关链接

- [SKILL.md](./SKILL.md) — 完整集成技能文档（供 AI Agent 或人工参考）
- [docs/INTEGRATION_WIDGET.md](./docs/INTEGRATION_WIDGET.md) — 集成指南与 CRA 兼容说明
- [docs/PACK_AND_CONSUMER_FIX_FLOW.md](./docs/PACK_AND_CONSUMER_FIX_FLOW.md) — 打包与消费者环境修复流程

## License

MIT
