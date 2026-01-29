/**
 * 类型定义文件
 */

// UI 消息类型
export type UiMessage = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: number;
  feedback?: 'like' | 'dislike' | null;
  isStreaming?: boolean;
  taskId?: string | null;
  suggestions?: string[];
  files?: MessageFile[];
};

// 消息附件类型
export type MessageFile = {
  type: 'image' | 'document' | 'audio' | 'video';
  url?: string;
  name?: string;
  size?: number;
};

// 上传中的文件
export type PendingFile = {
  file: File;
  preview?: string;
  isUploading?: boolean;
  uploadedId?: string;
  error?: string;
};

// 主题模式
export type ThemeMode = 'light' | 'dark';

// 语言
export type Language = 'zh' | 'en';

// 翻译文本
export type Translations = {
  conversations: string;
  empty: string;
  rename: string;
  renamePrompt: string;
  remove: string;
  deleteConfirm: string;
  newChat: string;
  inputPlaceholder: string;
  like: string;
  dislike: string;
  copy: string;
  copied: string;
  regenerate: string;
  upload: string;
  stop: string;
  failed: string;
  networkError: string;
  retry: string;
  thinking: string;
  welcome: string;
  today: string;
  yesterday: string;
  lastWeek: string;
  older: string;
};

// 主题配置
export interface ThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily?: string;
  cssVariables?: Record<string, string>;
}

// 功能开关
export interface FeatureFlags {
  sidebar?: boolean;
  fileUpload?: boolean;
  voiceInput?: boolean;
  messageSearch?: boolean;
  feedback?: boolean;
  codeHighlight?: boolean;
  filePreview?: boolean;
}

// UI配置
export interface UIConfig {
  avatarUrl?: string;
  showTimestamp?: boolean;
  showMessageStatus?: boolean;
  enableMarkdown?: boolean;
  maxFileSize?: number;
  maxFileCount?: number;
  placeholderText?: string;
  // 悬浮窗尺寸配置
  widgetWidth?: string | number;  // 支持 '384px', '90%', 384 等格式
  widgetHeight?: string | number; // 支持 '560px', '80vh', 560 等格式
}

// 自定义渲染
export interface CustomRenders {
  header?: () => React.ReactNode;
  footer?: () => React.ReactNode;
  messageHeader?: (message: UiMessage) => React.ReactNode;
  emptyState?: () => React.ReactNode;
  loadingState?: () => React.ReactNode;
  errorState?: (error: Error) => React.ReactNode;
}

// 组件配置
export interface WidgetConfig {
  features?: FeatureFlags;
  ui?: UIConfig;
  theme?: ThemeConfig;
  customRenders?: CustomRenders;
}
