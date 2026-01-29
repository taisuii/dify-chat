/**
 * 消息气泡组件
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// 使用 React.memo 优化性能
const MemoizedSyntaxHighlighter = React.memo(SyntaxHighlighter);

// 使用 React.memo 优化渲染性能
export const MessageBubble = React.memo<MessageBubbleProps>(({
  role,
  content,
  isStreaming = false,
}) => {
  const isUser = role === 'user';
  // 检测当前主题（从 data-theme 属性）
  const isDarkTheme = typeof document !== 'undefined' && 
    document.querySelector('[data-theme="dark"]') !== null;

  return (
    <div className={`dify-message-bubble dify-message-bubble--${role}`}>
      {isUser ? (
        <div className="dify-message-bubble__content">{content}</div>
      ) : (
        <div className="dify-message-bubble__content dify-message-bubble__content--markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const isInline = !match;
                
                return !isInline ? (
                  <MemoizedSyntaxHighlighter
                    style={isDarkTheme ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: '0.75em 0',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '0.9em',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </MemoizedSyntaxHighlighter>
                ) : (
                  <code className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && <span className="dify-message-bubble__cursor">|</span>}
        </div>
      )}
    </div>
  );
});
