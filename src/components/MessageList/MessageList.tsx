/**
 * 消息列表组件
 */
import React from 'react';
import { ArrowDown } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import type { UiMessage, Translations } from '../../types';

export interface MessageListProps {
  messages: UiMessage[];
  isTyping: boolean;
  onFeedback?: (messageId: string, rating: 'like' | 'dislike') => void;
  onRegenerate?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  translations: Translations;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  onFeedback,
  onRegenerate,
  onSuggestionClick,
  translations,
}) => {
  const { containerRef, showScrollButton, scrollToBottom } = useAutoScroll<HTMLDivElement>([
    messages,
    isTyping,
  ]);

  return (
    <div className="dify-message-list">
      <div 
        className="dify-message-list__container" 
        ref={containerRef}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="聊天消息列表"
      >
        {messages.map((message, index) => (
          <MessageItem
            key={message.id || index}
            message={message}
            isLastMessage={index === messages.length - 1}
            onFeedback={onFeedback}
            onRegenerate={onRegenerate}
            onSuggestionClick={onSuggestionClick}
            translations={translations}
          />
        ))}
        {isTyping && <TypingIndicator text={translations.thinking} />}
      </div>
      {showScrollButton && (
        <button
          className="dify-message-list__scroll-btn"
          onClick={() => scrollToBottom(true)}
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={20} />
          <span>有新消息</span>
        </button>
      )}
    </div>
  );
};
