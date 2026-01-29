/**
 * 快捷引导按钮组件
 */
import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface PromptStarterProps {
  text: string;
  onClick: () => void;
}

export const PromptStarter: React.FC<PromptStarterProps> = ({ text, onClick }) => {
  return (
    <button className="dify-prompt-starter" onClick={onClick}>
      <ChevronRight size={16} />
      <span>{text}</span>
    </button>
  );
};
