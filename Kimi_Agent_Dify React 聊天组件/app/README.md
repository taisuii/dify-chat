# Dify Chat Component

一个功能完善的 React 聊天组件，对接 Dify API，支持流式响应、文件上传、会话管理、消息反馈等功能。

## 在线演示

https://4hsiiuzp45gzo.ok.kimi.link

## 功能特性

### 核心功能
- **流式响应** - 实时显示 AI 回复内容，支持打字机效果
- **会话管理** - 左侧边栏支持新建、重命名、删除会话
- **文件上传** - 支持图片和文档上传（拖拽、粘贴、点击选择）
- **Markdown 渲染** - 支持代码高亮、表格、列表等富文本格式

### 交互功能
- **消息反馈** - 点赞、点踩、复制、重新生成
- **工作流展示** - 显示 Dify 工作流执行步骤
- **建议问题** - AI 回复后显示相关问题建议
- **自动滚动** - 智能滚动控制，查看历史时暂停自动滚动

### 主题与国际化
- **主题切换** - 支持浅色/深色主题
- **多语言** - 支持中文/英文切换
- **自定义主题色** - 可配置主色调

## 快速开始

### 安装

```bash
npm install
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

## 使用方法

### 基本用法

```tsx
import { ChatPanel } from '@/components/chat';

function App() {
  return (
    <ChatPanel
      apiBase="https://api.dify.ai/v1"
      apiKey="your-api-key"
      user="user-id"
      title="聊天界面"
      theme="light"
      language="zh"
      config={{
        features: {
          sidebar: true,
          fileUpload: true,
          feedback: true,
          suggestions: true,
          workflow: true,
        },
        theme: {
          primaryColor: '#3b82f6',
          accentColor: '#3b82f6',
        },
      }}
      onMessageSend={(msg, files) => console.log(msg, files)}
    />
  );
}
```

### Props 说明

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| apiBase | string | ✅ | Dify API 基础地址 |
| apiKey | string | ✅ | Dify API Key |
| user | string | ✅ | 用户标识 |
| title | string | ❌ | 聊天界面标题 |
| theme | 'light' \| 'dark' \| 'auto' | ❌ | 主题模式 |
| language | 'zh' \| 'en' | ❌ | 语言 |
| config | ChatConfig | ❌ | 组件配置 |
| onMessageSend | function | ❌ | 消息发送回调 |
| onConversationChange | function | ❌ | 会话切换回调 |
| className | string | ❌ | 自定义类名 |

### ChatConfig 配置

```tsx
interface ChatConfig {
  features?: {
    sidebar?: boolean;      // 显示侧边栏
    fileUpload?: boolean;   // 启用文件上传
    feedback?: boolean;     // 启用消息反馈
    suggestions?: boolean;  // 显示建议问题
    workflow?: boolean;     // 显示工作流步骤
  };
  theme?: {
    primaryColor?: string;  // 主色调
    accentColor?: string;   // 强调色
    backgroundColor?: string;
  };
  i18n?: {
    welcomeMessage?: string;
    placeholder?: string;
    thinking?: string;
    send?: string;
    newChat?: string;
    copy?: string;
    copied?: string;
    like?: string;
    dislike?: string;
    regenerate?: string;
    uploadFile?: string;
    uploadImage?: string;
    dragDropHint?: string;
    aiDisclaimer?: string;
  };
}
```

## 组件结构

```
src/
├── components/
│   └── chat/
│       ├── ChatPanel.tsx      # 主组件
│       ├── Sidebar.tsx        # 会话侧边栏
│       ├── MessageBubble.tsx  # 消息气泡
│       ├── SuperInput.tsx     # 超级输入框
│       ├── WelcomeScreen.tsx  # 欢迎页面
│       └── index.ts           # 组件导出
├── services/
│   └── dify.ts                # Dify API 服务
├── types/
│   └── chat.ts                # TypeScript 类型定义
└── lib/
    └── utils.ts               # 工具函数
```

## API 对接

组件对接了 Dify 的以下 API：

- `POST /chat-messages` - 发送消息（流式响应）
- `POST /files/upload` - 文件上传
- `GET /conversations` - 获取会话列表
- `DELETE /conversations/:id` - 删除会话
- `POST /conversations/:id/name` - 重命名会话
- `GET /messages` - 获取会话历史
- `POST /messages/:id/feedbacks` - 提交反馈

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- react-markdown
- date-fns

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT
