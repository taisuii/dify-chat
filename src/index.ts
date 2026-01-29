/**
 * Dify Chat Widget - Entry Point
 */

import './styles.css';

// 组件导出
export { ChatWidget } from './components/ChatWidget';
export { ChatPanel } from './components/ChatPanel';
export { Skeleton, MessageSkeleton, ConversationSkeleton, ScreenReaderOnly } from './components/common/Skeleton';
export { FileViewer } from './components/common/FileViewer';
export { MessageSearch } from './components/MessageList/MessageSearch';

// Hooks 导出
export { useAutoScroll } from './hooks/useAutoScroll';
export { useCopyToClipboard } from './hooks/useCopyToClipboard';
export { useVoiceInput } from './hooks/useVoiceInput';
export {
  fadeInVariants,
  fadeInUpVariants,
  slideInRightVariants,
  slideInLeftVariants,
  scaleVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from './hooks/useAnimation';

// 工具函数导出
export { applyTheme, removeTheme, PRESET_THEMES } from './theme';
export { createImageLazyLoader, compressImage, getImageDimensions } from './utils/imageOptimization';
export { getTranslations } from './utils/translations';

// 类型导出
export type { ChatWidgetProps } from './components/ChatWidget';
export type { ChatPanelProps } from './components/ChatPanel';
export type {
  UiMessage,
  MessageFile,
  PendingFile,
  ThemeMode,
  Language,
  Translations,
  ThemeConfig,
  FeatureFlags,
  UIConfig,
  CustomRenders,
  WidgetConfig,
} from './types';
