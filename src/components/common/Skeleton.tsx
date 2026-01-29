/**
 * 骨架屏组件
 * 用于加载状态展示
 */
import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

/**
 * 基础骨架屏组件
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
}) => {
  return (
    <div
      className={`dify-skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
      }}
    />
  );
};

/**
 * 消息骨架屏
 */
export const MessageSkeleton: React.FC = () => {
  return (
    <div className="dify-message-skeleton">
      <div className="dify-message-skeleton__avatar dify-skeleton" />
      <div className="dify-message-skeleton__content">
        <div className="dify-message-skeleton__line dify-skeleton" />
        <div className="dify-message-skeleton__line dify-skeleton dify-message-skeleton__line--short" />
      </div>
    </div>
  );
};

/**
 * 对话项骨架屏
 */
export const ConversationSkeleton: React.FC = () => {
  return (
    <div className="dify-conversation-item" style={{ opacity: 0.6 }}>
      <Skeleton height="16px" width="80%" />
    </div>
  );
};

/**
 * 多个消息骨架屏
 */
export const MessageListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton key={index} />
      ))}
    </>
  );
};

/**
 * 屏幕阅读器专用组件
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="sr-only">{children}</div>
};
