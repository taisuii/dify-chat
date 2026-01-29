/**
 * 思考中指示器组件
 */
import React from 'react';

export interface TypingIndicatorProps {
  text?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ text = '正在思考...' }) => {
  return (
    <div className="dify-typing-indicator">
      <div className="dify-typing-indicator__dots">
        <span className="dify-typing-indicator__dot" />
        <span className="dify-typing-indicator__dot" />
        <span className="dify-typing-indicator__dot" />
      </div>
      <span className="dify-typing-indicator__text">{text}</span>
    </div>
  );
};
