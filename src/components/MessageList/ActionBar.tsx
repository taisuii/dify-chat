/**
 * 消息操作栏组件
 */
import React from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check, RefreshCw } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import type { Translations } from '../../types';

export interface ActionBarProps {
  messageId?: string;
  content: string;
  feedback?: 'like' | 'dislike' | null;
  isLastMessage: boolean;
  onFeedback?: (messageId: string, rating: 'like' | 'dislike') => void;
  onRegenerate?: () => void;
  translations: Translations;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  messageId,
  content,
  feedback,
  isLastMessage,
  onFeedback,
  onRegenerate,
  translations,
}) => {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="dify-action-bar">
      {messageId && onFeedback && (
        <>
          <button
            className={`dify-action-bar__btn ${feedback === 'like' ? 'dify-action-bar__btn--active' : ''}`}
            onClick={() => onFeedback(messageId, 'like')}
            aria-label={translations.like}
            title={translations.like}
          >
            <ThumbsUp size={14} />
          </button>
          <button
            className={`dify-action-bar__btn ${feedback === 'dislike' ? 'dify-action-bar__btn--active' : ''}`}
            onClick={() => onFeedback(messageId, 'dislike')}
            aria-label={translations.dislike}
            title={translations.dislike}
          >
            <ThumbsDown size={14} />
          </button>
        </>
      )}
      <button
        className="dify-action-bar__btn"
        onClick={() => copy(content)}
        aria-label={copied ? translations.copied : translations.copy}
        title={copied ? translations.copied : translations.copy}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        <span>{copied ? translations.copied : translations.copy}</span>
      </button>
      {isLastMessage && onRegenerate && (
        <button
          className="dify-action-bar__btn"
          onClick={onRegenerate}
          aria-label={translations.regenerate}
          title={translations.regenerate}
        >
          <RefreshCw size={14} />
          <span>{translations.regenerate}</span>
        </button>
      )}
    </div>
  );
};
