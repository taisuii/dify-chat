import React, { useState, useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { MessageCircle } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { applyTheme } from '../theme';
import type { ThemeMode, Language, WidgetConfig, UiMessage } from '../types';

export interface ChatWidgetProps {
  apiBase: string;
  apiKey: string;
  user?: string;
  title?: string;
  theme?: ThemeMode;
  language?: Language;
  initialMessage?: string;
  initialConversationId?: string;
  
  // 新增配置
  config?: WidgetConfig;
  
  // 新增回调
  onMessageSend?: (message: string) => void;
  onMessageReceive?: (message: UiMessage) => void;
  onConversationChange?: (conversationId: string) => void;
  onFileUpload?: (file: File) => void;
  onError?: (error: Error) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiBase,
  apiKey,
  user,
  title = 'Dify Chat',
  theme = 'light',
  language = 'zh',
  initialMessage,
  initialConversationId,
  config,
  onMessageSend,
  onMessageReceive,
  onConversationChange,
  onFileUpload,
  onError,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 获取悬浮窗尺寸配置，支持多种格式
  const getWidgetSize = () => {
    const defaultWidth = 384;
    const defaultHeight = 560;
    
    const width = config?.ui?.widgetWidth ?? defaultWidth;
    const height = config?.ui?.widgetHeight ?? defaultHeight;
    
    // 如果是数字，添加 px 单位；如果是字符串，直接使用
    return {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };
  };

  // 应用主题配置
  useEffect(() => {
    if (config?.theme) {
      applyTheme(config.theme);
    }
  }, [config?.theme]);

  // 键盘导航支持 - ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        // 使用内联样式保证在未接入 Tailwind 等工具时也能正常悬浮显示
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 50,
          borderRadius: 9999,
          padding: 16,
          border: 'none',
          backgroundColor: '#111827',
          color: '#ffffff',
          cursor: 'pointer',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.35)',
        }}
        className="dify-chat-widget-trigger"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  const widgetSize = getWidgetSize();

  return (
    <FocusTrap active={isOpen}>
      <div
        // 同样用内联样式保证悬浮窗在未引入 Tailwind 时也能按预期展示
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: widgetSize.width,
          height: widgetSize.height,
          borderRadius: 16,
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.3)',
          zIndex: 50,
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
        className="dify-chat-widget-container"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <ChatPanel
          apiBase={apiBase}
          apiKey={apiKey}
          user={user}
          title={title}
          theme={theme}
          language={language}
          initialMessage={initialMessage}
          initialConversationId={initialConversationId}
          config={config}
          onMessageSend={onMessageSend}
          onMessageReceive={onMessageReceive}
          onConversationChange={onConversationChange}
          onFileUpload={onFileUpload}
          onError={onError}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </FocusTrap>
  );
};