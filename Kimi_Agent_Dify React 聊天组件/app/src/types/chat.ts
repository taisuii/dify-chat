// Chat Component Types

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnail?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  files?: MessageFile[];
  isStreaming?: boolean;
  workflowSteps?: WorkflowStep[];
  suggestions?: string[];
  feedback?: 'like' | 'dislike';
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  timestamp: number;
  details?: string;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
  isPinned?: boolean;
}

export interface ChatConfig {
  features?: {
    sidebar?: boolean;
    fileUpload?: boolean;
    feedback?: boolean;
    suggestions?: boolean;
    workflow?: boolean;
  };
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
  };
  i18n?: {
    welcomeMessage?: string;
    placeholder?: string;
    thinking?: string;
    send?: string;
    newChat?: string;
    copy?: string;
    copied?: string;
    like?: string;
    dislike?: string;
    regenerate?: string;
    uploadFile?: string;
    uploadImage?: string;
    dragDropHint?: string;
    aiDisclaimer?: string;
  };
}

export interface ChatPanelProps {
  apiBase: string;
  apiKey: string;
  user: string;
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: 'zh' | 'en';
  config?: ChatConfig;
  onMessageSend?: (message: string, files?: MessageFile[]) => void;
  onConversationChange?: (conversationId: string) => void;
  className?: string;
}

export interface DifyMessage {
  event: string;
  message_id?: string;
  conversation_id?: string;
  answer?: string;
  created_at?: number;
  file_id?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  workflow?: {
    id: string;
    name: string;
    status: string;
    created_at: number;
  };
}

export interface DifyConversation {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  status: string;
  introduction?: string;
  created_at: number;
  updated_at: number;
}
