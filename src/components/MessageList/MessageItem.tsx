/**
 * 消息项组件
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { ActionBar } from './ActionBar';
import { fadeInUpVariants } from '../../hooks/useAnimation';
import type { UiMessage, Translations } from '../../types';

export interface MessageItemProps {
  message: UiMessage;
  isLastMessage: boolean;
  onFeedback?: (messageId: string, rating: 'like' | 'dislike') => void;
  onRegenerate?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  translations: Translations;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLastMessage,
  onFeedback,
  onRegenerate,
  onSuggestionClick,
  translations,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const showActions = message.role === 'assistant' && !message.isStreaming;

  return (
    <motion.div
      className={`dify-message-row dify-message-row--${message.role}`}
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`dify-message-row__inner ${message.role === 'user' ? 'dify-message-row__inner--user' : ''}`}>
        <div
          className={`dify-message-avatar ${message.role === 'user' ? 'dify-message-avatar--user' : 'dify-message-avatar--assistant'}`}
          aria-hidden="true"
        >
          {message.role === 'user' ? 'U' : '🤖'}
        </div>

        <div className={`dify-message-main ${message.role === 'user' ? 'dify-message-main--user' : ''}`}>
          <MessageBubble
            role={message.role}
            content={message.content}
            isStreaming={message.isStreaming}
          />

          <div className={`dify-message-timestamp ${message.role === 'user' ? 'dify-message-timestamp--user' : ''}`}>
            {message.createdAt ? new Date(message.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>

          {showActions && isHovered && (
            <ActionBar
              messageId={message.id}
              content={message.content}
              feedback={message.feedback}
              isLastMessage={isLastMessage}
              onFeedback={onFeedback}
              onRegenerate={onRegenerate}
              translations={translations}
            />
          )}

          {message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
            <div className="dify-message-item__suggestions">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="dify-message-item__suggestion-btn"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
