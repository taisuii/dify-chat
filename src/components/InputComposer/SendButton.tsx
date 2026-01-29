/**
 * 发送按钮组件
 */
import React from 'react';
import { Send, Square } from 'lucide-react';

export interface SendButtonProps {
  disabled: boolean;
  isStreaming: boolean;
  onClick: () => void;
  onStop: () => void;
}

export const SendButton: React.FC<SendButtonProps> = ({
  disabled,
  isStreaming,
  onClick,
  onStop,
}) => {
  if (isStreaming) {
    return (
      <button
        className="dify-send-button dify-send-button--stop"
        onClick={onStop}
        aria-label="Stop generating"
      >
        <Square size={18} />
      </button>
    );
  }

  return (
    <button
      className="dify-send-button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Send message"
    >
      <Send size={18} />
    </button>
  );
};
