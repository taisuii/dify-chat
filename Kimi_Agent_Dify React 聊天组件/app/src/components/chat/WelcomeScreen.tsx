import React from 'react';
import { Sparkles, MessageSquare, Zap, Shield } from 'lucide-react';
import type { ChatConfig } from '@/types/chat';

interface WelcomeScreenProps {
  config?: ChatConfig;
  language?: 'zh' | 'en';
  onSuggestionClick?: (suggestion: string) => void;
  title?: string;
}

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  config,
  language = 'zh',
  onSuggestionClick,
  title,
}) => {
  const i18n = config?.i18n;

  const welcomeMessage = i18n?.welcomeMessage || 
    (language === 'zh' ? '你好！很高兴见到你~' : 'Hello! Nice to meet you~');

  const subtitle = language === 'zh' 
    ? '我是你的 AI 助手，有什么问题可以问我呢！' 
    : 'I\'m your AI assistant. What can I help you with?';

  const defaultSuggestions = language === 'zh' 
    ? [
        '介绍一下你自己',
        '你能帮我做什么？',
        '今天天气怎么样？',
        '写一段 Python 代码',
      ]
    : [
        'Introduce yourself',
        'What can you help me with?',
        'What\'s the weather like today?',
        'Write some Python code',
      ];

  const suggestions = defaultSuggestions;

  const features: FeatureCard[] = language === 'zh' 
    ? [
        {
          icon: <MessageSquare className="h-5 w-5" />,
          title: '智能对话',
          description: '自然语言理解，流畅交流',
        },
        {
          icon: <Zap className="h-5 w-5" />,
          title: '即时响应',
          description: '快速生成回复，高效沟通',
        },
        {
          icon: <Shield className="h-5 w-5" />,
          title: '安全可靠',
          description: '保护隐私，数据安全',
        },
      ]
    : [
        {
          icon: <MessageSquare className="h-5 w-5" />,
          title: 'Smart Chat',
          description: 'Natural language understanding',
        },
        {
          icon: <Zap className="h-5 w-5" />,
          title: 'Instant Response',
          description: 'Fast and efficient communication',
        },
        {
          icon: <Shield className="h-5 w-5" />,
          title: 'Secure & Reliable',
          description: 'Privacy protection, data security',
        },
      ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {title || welcomeMessage}
        </h1>
        <p className="text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <div className="text-primary">{feature.icon}</div>
            </div>
            <h3 className="font-medium mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Suggestion Chips */}
      <div className="w-full max-w-2xl">
        <p className="text-sm text-muted-foreground mb-3 text-center">
          {language === 'zh' ? '试试这些问题：' : 'Try asking:'}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 
                       transition-colors text-sm border hover:border-primary/50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
