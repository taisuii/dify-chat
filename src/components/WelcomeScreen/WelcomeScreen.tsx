/**
 * 欢迎页组件
 */
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { PromptStarter } from './PromptStarter';

export interface WelcomeScreenProps {
  title?: string;
  message: string;
  suggestions?: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  title,
  message,
  suggestions = [],
  onSuggestionClick,
}) => {
  return (
    <div className="dify-welcome-screen">
      <div className="dify-welcome-screen__content">
        <div className="dify-welcome-screen__logo">
          <MessageCircle size={48} strokeWidth={1.5} />
        </div>
        {title && <h2 className="dify-welcome-screen__title">{title}</h2>}
        <p className="dify-welcome-screen__message">{message}</p>
        {suggestions.length > 0 && (
          <div className="dify-welcome-screen__suggestions">
            {suggestions.map((suggestion, index) => (
              <PromptStarter
                key={index}
                text={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
