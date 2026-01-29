# Dify Pro Chat Widget

一个为 Dify 构建的专业级 React 聊天组件库,具有沉浸式 UI/UX 设计。

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 特性

- 🎨 **现代化 UI 设计** - 参考 Intercom/Notion 风格的清爽界面，使用专业图标库
- 📱 **完全响应式** - 完美适配桌面端和移动端，移动端全屏优化
- 🎭 **主题支持** - 内置亮色/暗色主题，支持动态主题配置
- 🌍 **国际化** - 支持中文和英文
- 💬 **Markdown 渲染** - 支持富文本消息显示，代码语法高亮
- 📎 **文件上传** - 支持图片拖拽、粘贴上传，智能压缩
- 🔄 **流式响应** - 打字机效果的实时响应
- 📜 **历史管理** - 按时间分组的对话历史
- 🔍 **消息搜索** - 快速查找历史消息
- 🎙️ **语音输入** - Web Speech API 语音识别
- 🖼️ **文件预览** - 图片、文档在线预览
- ⚡ **性能优化** - 虚拟滚动、React.memo、图片懒加载
- ♿ **可访问性** - WCAG AA 级别，焦点管理，键盘导航
- 🎯 **零依赖冲突** - 独立 CSS 命名空间
- 🎬 **流畅动画** - Framer Motion 驱动的微交互
- 🔧 **灵活配置** - 功能开关、自定义渲染、主题定制

## 📦 安装

```bash
npm install dify-chat-widget
```

或使用 yarn:

```bash
yarn add dify-chat-widget
```

## 🚀 快速开始

### 获取 Dify API 密钥

在使用组件之前，你需要从 Dify 平台获取 API 密钥：

1. 登录你的 [Dify 控制台](https://cloud.dify.ai/)
2. 选择或创建一个应用
3. 在应用设置中找到 **API 密钥**（格式为 `app-xxxxx`）
4. 复制 **API 端点**（例如 `https://api.dify.ai/v1`）

> ⚠️ **注意**：API 密钥格式应该是 `app-` 开头，组件会自动添加 `Bearer` 前缀。

### 基础用法

```tsx
import { ChatWidget } from 'dify-chat-widget';
import 'dify-chat-widget/dist/dify-chat-widget.css';

function App() {
  return (
    <ChatWidget
      apiBase="https://api.dify.ai/v1"
      apiKey="app-your-api-key-here"  // 从 Dify 控制台获取
      user="user-123"
      title="AI 助手"
      theme="light"
      language="zh"
    />
  );
}
```

### 常见问题

**Q: 出现 401 授权错误怎么办？**

A: 请检查以下几点：
- API 密钥格式是否正确（应该以 `app-` 开头）
- API 端点 URL 是否正确
- API 密钥是否有效且未过期
- 确保没有在密钥前手动添加 `Bearer ` 前缀（组件会自动添加）

### 嵌入式面板

如果你想在页面中直接嵌入聊天面板(而不是浮动窗口):

```tsx
import { ChatPanel } from 'dify-chat-widget';
import 'dify-chat-widget/dist/dify-chat-widget.css';

function App() {
  return (
    {/* 容器需要设置固定的宽高，组件会自动适应 */}
    <div style={{ width: '100%', height: '600px' }}>
      <ChatPanel
        apiBase="https://api.dify.ai/v1"
        apiKey="your-api-key"
        user="user-123"
        title="AI 助手"
        theme="light"
        language="zh"
      />
    </div>
  );
}
```

> **注意**：组件采用响应式设计，会自动适应父容器的大小。请确保为父容器设置明确的宽高。

## 📖 API 文档

### ChatWidget Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `apiBase` | `string` | - | **必填** Dify API 基础地址 |
| `apiKey` | `string` | - | **必填** Dify API 密钥 |
| `user` | `string` | 自动生成 | 用户标识符 |
| `title` | `string` | `'Dify Chat'` | 聊天窗口标题 |
| `theme` | `'light' \| 'dark'` | `'light'` | 主题模式 |
| `language` | `'zh' \| 'en'` | `'zh'` | 界面语言 |
| `initialMessage` | `string` | - | 初始欢迎消息(覆盖 Dify 配置) |
| `initialConversationId` | `string` | - | 初始对话 ID(用于恢复对话) |
| `config` | `WidgetConfig` | - | 组件配置（功能开关、主题、UI 等） |
| `onMessageSend` | `(message: string) => void` | - | 消息发送回调 |
| `onMessageReceive` | `(message: UiMessage) => void` | - | 消息接收回调 |
| `onConversationChange` | `(id: string) => void` | - | 对话切换回调 |
| `onFileUpload` | `(file: File) => void` | - | 文件上传回调 |
| `onError` | `(error: Error) => void` | - | 错误处理回调 |

### WidgetConfig 配置

```typescript
interface WidgetConfig {
  features?: {
    showHeader?: boolean;      // 显示/隐藏顶部标题栏（默认: true）
    sidebar?: boolean;         // 显示侧边栏
    fileUpload?: boolean;      // 支持文件上传
    voiceInput?: boolean;      // 语音输入
    messageSearch?: boolean;   // 消息搜索
    feedback?: boolean;        // 反馈按钮
    codeHighlight?: boolean;   // 代码高亮
    filePreview?: boolean;     // 文件预览
  };
  ui?: {
    showTimestamp?: boolean;
    showMessageStatus?: boolean;
    enableMarkdown?: boolean;
    maxFileSize?: number;
    maxFileCount?: number;
    widgetWidth?: string | number;    // 悬浮窗宽度（默认: 384）
    widgetHeight?: string | number;   // 悬浮窗高度（默认: 560）
  };
  theme?: {
    primaryColor?: string;     // 主题色（十六进制颜色）
    accentColor?: string;      // 强调色
    borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
    fontFamily?: string;
    cssVariables?: Record<string, string>;
  };
  customRenders?: {
    header?: () => React.ReactNode;
    footer?: () => React.ReactNode;
    messageHeader?: (message: UiMessage) => React.ReactNode;
    emptyState?: () => React.ReactNode;
    loadingState?: () => React.ReactNode;
    errorState?: (error: Error) => React.ReactNode;
  };
}
```

### ChatPanel Props

`ChatPanel` 继承 `ChatWidget` 的所有 props,并额外支持:

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `onClose` | `() => void` | - | 关闭按钮点击回调 |
| `className` | `string` | `''` | 自定义 CSS 类名 |

## 🎨 样式自定义

### 方式一：使用配置对象（推荐）

```tsx
<ChatPanel
  apiBase="..."
  apiKey="..."
  config={{
    features: {
      showHeader: false,  // 隐藏顶部标题栏
    },
    theme: {
      primaryColor: '#2563eb',   // 蓝色主题
      accentColor: '#2563eb',
      borderRadius: 'lg',        // 大圆角
    }
  }}
/>
```

### 方式二：使用 CSS 变量

组件使用 CSS 变量,可以轻松自定义主题:

```css
:root {
  /* 品牌色 */
  --dify-accent: #0066ff;
  --dify-accent-contrast: #ffffff;
  
  /* 圆角 */
  --dify-radius-md: 12px;
  --dify-radius-lg: 16px;
  
  /* 阴影 */
  --dify-shadow-lg: 0 12px 30px rgba(0, 0, 0, 0.15);
}
```

### 常用主题色示例

```tsx
// 蓝色主题
config={{ theme: { primaryColor: '#2563eb' } }}

// 紫色主题
config={{ theme: { primaryColor: '#7c3aed' } }}

// 绿色主题
config={{ theme: { primaryColor: '#059669' } }}

// 自定义多个属性
config={{
  theme: {
    primaryColor: '#f59e0b',
    borderRadius: 'xl',
    fontFamily: 'Inter, sans-serif'
  }
}}
```

## 🌟 高级用法

### 完整配置示例

```tsx
import { ChatWidget, PRESET_THEMES } from 'dify-chat-widget';
import 'dify-chat-widget/dist/dify-chat-widget.css';

<ChatWidget
  apiBase="https://api.dify.ai/v1"
  apiKey="your-api-key"
  user="user-123"
  title="AI 助手"
  theme="light"
  language="zh"
  
  // 高级配置
  config={{
    // 功能开关
    features: {
      showHeader: true,        // 显示顶部标题栏
      sidebar: true,           // 显示侧边栏
      fileUpload: true,        // 支持文件上传
      voiceInput: true,        // 启用语音输入
      messageSearch: true,     // 启用消息搜索
      feedback: true,          // 显示反馈按钮
      codeHighlight: true,     // 代码语法高亮
      filePreview: true,       // 文件预览功能
    },
    
    // UI 配置
    ui: {
      showTimestamp: true,     // 显示时间戳
      showMessageStatus: true, // 显示消息状态
      enableMarkdown: true,    // 启用 Markdown
      maxFileSize: 10 * 1024 * 1024,  // 最大文件大小 10MB
      maxFileCount: 5,         // 最多上传 5 个文件
    },
    
    // 主题配置
    theme: {
      primaryColor: '#6366f1',   // 主题色
      accentColor: '#6366f1',    // 强调色
      borderRadius: 'lg',        // 圆角大小
      fontFamily: 'Inter, sans-serif',
      cssVariables: {
        '--dify-accent': '#6366f1',
        '--dify-radius-md': '16px',
      },
    },
    
    // 自定义渲染
    customRenders: {
      header: () => <CustomHeader />,
      emptyState: () => <CustomEmptyState />,
      errorState: (error) => <CustomErrorState error={error} />,
    },
  }}
  
  // 事件回调
  onMessageSend={(message) => {
    console.log('用户发送:', message);
  }}
  onMessageReceive={(message) => {
    console.log('收到消息:', message);
  }}
  onConversationChange={(id) => {
    console.log('切换对话:', id);
  }}
  onFileUpload={(file) => {
    console.log('上传文件:', file);
  }}
  onError={(error) => {
    console.error('错误:', error);
  }}
/>
```

### 使用预设主题

```tsx
import { ChatWidget, PRESET_THEMES, applyTheme } from 'dify-chat-widget';

// 使用预设主题
<ChatWidget
  apiBase={apiBase}
  apiKey={apiKey}
  config={{
    theme: PRESET_THEMES.blue,  // 蓝色主题
  }}
/>

// 或手动应用主题
useEffect(() => {
  applyTheme(PRESET_THEMES.purple);
}, []);
```

### 导出的 Hooks 使用

```tsx
import {
  useVoiceInput,
  useCopyToClipboard,
  useAutoScroll,
} from 'dify-chat-widget';

// 语音输入
const {
  isRecording,
  transcript,
  startRecording,
  stopRecording,
} = useVoiceInput({
  lang: 'zh-CN',
  continuous: false,
});

// 复制到剪贴板
const { copied, copy } = useCopyToClipboard();

// 自动滚动
const { containerRef, scrollToBottom } = useAutoScroll([messages]);
```

### 图片优化工具

```tsx
import {
  compressImage,
  createImageLazyLoader,
} from 'dify-chat-widget';

// 压缩图片
const compressedFile = await compressImage(
  file,
  1920,  // maxWidth
  1080,  // maxHeight
  0.8    // quality
);

// 创建懒加载观察器
const lazyLoader = createImageLazyLoader({
  rootMargin: '50px',
  threshold: 0.01,
});

// 使用懒加载
const img = document.querySelector('img');
img.dataset.src = 'image-url.jpg';
lazyLoader.observe(img);
```

## 📱 响应式设计

### 容器自适应

组件采用 **100% 宽高**响应式设计，会自动适应父容器的大小：

```tsx
{/* 小尺寸容器 */}
<div style={{ width: '400px', height: '500px' }}>
  <ChatPanel apiBase="..." apiKey="..." />
</div>

{/* 全屏容器 */}
<div style={{ width: '100vw', height: '100vh' }}>
  <ChatPanel apiBase="..." apiKey="..." />
</div>

{/* Flex 布局中 */}
<div style={{ display: 'flex', height: '100vh' }}>
  <div style={{ flex: 1 }}>
    <ChatPanel apiBase="..." apiKey="..." />
  </div>
</div>
```

### 屏幕尺寸适配

组件自动适配不同屏幕尺寸:

- **桌面端 (>768px)**: 完整的三栏布局(侧边栏 + 消息区 + 输入区)
- **平板 (<768px)**: 侧边栏自动折叠
- **移动端 (<480px)**: 全屏优化,简化操作

### 悬浮窗尺寸自定义

`ChatWidget` 组件支持自定义悬浮窗尺寸，支持像素值和百分比等多种格式：

```tsx
{/* 默认尺寸: 384 x 560 像素 */}
<ChatWidget apiBase="..." apiKey="..." />

{/* 自定义像素尺寸 */}
<ChatWidget
  apiBase="..."
  apiKey="..."
  config={{
    ui: {
      widgetWidth: 450,      // 数字会自动添加 px 单位
      widgetHeight: 700,
    }
  }}
/>

{/* 使用百分比和视口单位 */}
<ChatWidget
  apiBase="..."
  apiKey="..."
  config={{
    ui: {
      widgetWidth: '90%',    // 字符串格式支持任意 CSS 单位
      widgetHeight: '85vh',  // 视口高度的 85%
    }
  }}
/>

{/* 移动端适配示例 */}
<ChatWidget
  apiBase="..."
  apiKey="..."
  config={{
    ui: {
      widgetWidth: 'min(400px, 90vw)',  // 响应式宽度
      widgetHeight: 'min(600px, 80vh)', // 响应式高度
    }
  }}
/>
```

> **说明**：
> - `widgetWidth` 和 `widgetHeight` 只对 `ChatWidget`（悬浮窗）组件有效
> - `ChatPanel`（嵌入式）组件会自动适应父容器尺寸，无需配置

## 🎯 功能亮点

### 1. 智能对话管理

- 按时间自动分组:"今天"、"昨天"、"过去 7 天"、"更早"
- Hover 显示操作菜单(重命名、删除)
- 会话持久化
- 消息搜索功能，快速查找历史对话

### 2. 沉浸式消息体验

- Markdown 渲染支持(粗体、列表、代码块等)
- 代码语法高亮，支持多种编程语言
- 流式打字机效果
- 消息反馈(点赞/点踩)
- 一键复制
- 重新生成
- 流畅的入场动画

### 3. 多模态输入

- 多行文本自动扩展
- 优雅的滚动条样式（仅在多行文本时显示）
- 图片拖拽上传
- 粘贴截图直接上传
- 语音输入支持 (Web Speech API)
- 上传进度显示
- 乐观 UI 更新
- 智能图片压缩

### 4. 快捷引导

- 欢迎页展示
- 预设问题快捷按钮
- 建议问题 Pills

### 5. 文件预览

- 图片在线预览
- 缩放控制
- 文档预览支持
- 下载功能

### 6. 性能优化

- React.memo 优化渲染
- 图片懒加载
- 代码高亮缓存
- 防抖搜索

### 7. 可访问性

- WCAG AA 级别支持
- 焦点管理和陷阱
- 键盘导航 (Tab, Enter, ESC)
- ARIA 属性完整
- 屏幕阅读器友好

## 📦 导出的组件和工具

### 组件

- `ChatWidget` - 浮动聊天窗口组件
- `ChatPanel` - 嵌入式聊天面板组件
- `Skeleton` / `MessageSkeleton` / `ConversationSkeleton` - 骨架屏组件
- `FileViewer` - 文件预览组件
- `MessageSearch` - 消息搜索组件

### Hooks

- `useAutoScroll` - 自动滚动
- `useCopyToClipboard` - 复制到剪贴板
- `useVoiceInput` - 语音输入
- 动画变体: `fadeInVariants`, `slideInRightVariants` 等

### 工具函数

- `applyTheme` / `removeTheme` - 主题管理
- `PRESET_THEMES` - 预设主题
- `compressImage` - 图片压缩
- `createImageLazyLoader` - 图片懒加载
- `getTranslations` - 获取翻译文本

## 🔧 开发

### 本地开发

```bash
# 安装依赖
npm install --legacy-peer-deps

# 开发模式(监听模式)
npm run dev

# 构建库
npm run build

# 运行演示
npm run demo

# 代码检查
npm run lint

# 格式化代码
npm run format

# 类型检查
npm run typecheck

# 完整检查
npm run check
```

### 项目结构

```
dify-chat-widget/
├── src/
│   ├── components/
│   │   ├── ChatWidget.tsx           # 主组件(浮动窗口)
│   │   ├── ChatPanel.tsx            # 聊天面板
│   │   ├── Sidebar/                 # 侧边栏组件
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   └── ConversationItem.tsx
│   │   ├── MessageList/             # 消息列表组件
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ActionBar.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── WelcomeScreen/           # 欢迎页组件
│   │   │   ├── WelcomeScreen.tsx
│   │   │   └── PromptStarter.tsx
│   │   ├── InputComposer/           # 输入区组件
│   │   │   ├── InputComposer.tsx
│   │   │   ├── ImagePreview.tsx
│   │   │   └── SendButton.tsx
│   │   └── common/                  # 通用组件
│   │       ├── Button.tsx
│   │       └── Popover.tsx
│   ├── api/
│   │   └── dify.ts                  # Dify API 封装
│   ├── hooks/                       # 自定义 Hooks
│   │   ├── useAutoScroll.ts
│   │   └── useCopyToClipboard.ts
│   ├── utils/                       # 工具函数
│   │   ├── time.ts
│   │   └── translations.ts
│   ├── types/                       # 类型定义
│   │   └── index.ts
│   ├── styles.css                   # 样式文件
│   └── index.ts                     # 入口文件
├── demo.tsx                         # 演示文件
├── demo.html                        # 演示 HTML
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License

## 🙏 致谢

- 设计灵感来自 Intercom、Notion
- 基于 [Dify](https://dify.ai/) API 构建

---

**如有问题或建议,欢迎提 Issue!** 🎉
