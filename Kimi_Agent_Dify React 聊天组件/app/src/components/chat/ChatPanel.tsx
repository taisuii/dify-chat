import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MessageBubble } from './MessageBubble';
import { SuperInput } from './SuperInput';
import { WelcomeScreen } from './WelcomeScreen';
import { DifyService } from '@/services/dify';
import type { 
  ChatPanelProps, 
  Conversation, 
  Message, 
  MessageFile,
  WorkflowStep 
} from '@/types/chat';
import { generateId } from '@/lib/utils';

export const ChatPanel: React.FC<ChatPanelProps> = ({
  apiBase,
  apiKey,
  user,
  title,
  theme = 'light',
  language = 'zh',
  config = {},
  onMessageSend,
  onConversationChange,
  className = '',
}) => {
  // Services
  const difyService = useRef(new DifyService(apiBase, apiKey, user));

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Abort controller for streaming (reserved for future use)
  // const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<string>('');
  const workflowStepsRef = useRef<WorkflowStep[]>([]);

  const features = {
    sidebar: config.features?.sidebar !== false,
    fileUpload: config.features?.fileUpload !== false,
    feedback: config.features?.feedback !== false,
    suggestions: config.features?.suggestions !== false,
    workflow: config.features?.workflow !== false,
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom();
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      const convs = await difyService.current.getConversations();
      setConversations(convs.map(c => ({
        id: c.id,
        title: c.name || (language === 'zh' ? '新对话' : 'New Chat'),
        timestamp: c.updated_at * 1000,
        messages: [],
      })));
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const createNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setError(null);
    onConversationChange?.('');
  };

  const selectConversation = async (id: string) => {
    setCurrentConversationId(id);
    setError(null);
    onConversationChange?.(id);

    try {
      const history = await difyService.current.getConversationHistory(id);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load conversation history:', err);
      setMessages([]);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await difyService.current.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        createNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const renameConversation = async (id: string, name: string) => {
    try {
      await difyService.current.renameConversation(id, name);
      setConversations(prev => prev.map(c => 
        c.id === id ? { ...c, title: name } : c
      ));
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleSendMessage = async (content: string, files: MessageFile[]) => {
    if ((!content.trim() && files.length === 0) || isStreaming) return;

    setError(null);
    onMessageSend?.(content, files);

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      files: files.length > 0 ? files : undefined,
    };

    setMessages(prev => [...prev, userMessage]);

    // Add assistant placeholder
    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsStreaming(true);
    currentMessageRef.current = '';
    workflowStepsRef.current = [];

    // Send to Dify
    try {
      let newConversationId: string | null = null;

      await difyService.current.sendMessage(
        content,
        currentConversationId,
        files,
        (difyMsg) => {
          // Handle workflow steps
          if (difyMsg.workflow && features.workflow) {
            const step: WorkflowStep = {
              id: difyMsg.workflow.id,
              name: difyMsg.workflow.name,
              status: difyMsg.workflow.status as 'running' | 'completed' | 'failed',
              timestamp: difyMsg.workflow.created_at * 1000,
            };
            workflowStepsRef.current = [...workflowStepsRef.current, step];
          }

          // Handle message content
          if (difyMsg.answer !== undefined) {
            currentMessageRef.current += difyMsg.answer;
            
            setMessages(prev => prev.map(m => 
              m.id === assistantMessageId 
                ? { 
                    ...m, 
                    content: currentMessageRef.current,
                    workflowSteps: workflowStepsRef.current,
                  }
                : m
            ));
          }
        },
        (err) => {
          console.error('Stream error:', err);
          setError(
            language === 'zh' 
              ? '网络连接中断，请重试' 
              : 'Network connection interrupted, please retry'
          );
          setIsStreaming(false);
          
          // Update message to show error
          setMessages(prev => prev.map(m => 
            m.id === assistantMessageId 
              ? { ...m, isStreaming: false }
              : m
          ));
        },
        () => {
          // Stream complete
          setIsStreaming(false);
          
          // Generate suggestions if enabled
          let suggestions: string[] | undefined;
          if (features.suggestions) {
            suggestions = generateSuggestions();
          }

          setMessages(prev => prev.map(m => 
            m.id === assistantMessageId 
              ? { 
                  ...m, 
                  isStreaming: false,
                  suggestions,
                }
              : m
          ));

          // Update conversation list if new conversation
          if (newConversationId && !currentConversationId) {
            setCurrentConversationId(newConversationId);
            const newConv: Conversation = {
              id: newConversationId,
              title: content.slice(0, 50) || (language === 'zh' ? '新对话' : 'New Chat'),
              timestamp: Date.now(),
              messages: [],
            };
            setConversations(prev => [newConv, ...prev]);
          }
        }
      );
    } catch (err) {
      console.error('Send message error:', err);
      setError(
        language === 'zh' 
          ? '发送消息失败，请重试' 
          : 'Failed to send message, please retry'
      );
      setIsStreaming(false);
    }
  };

  const generateSuggestions = (): string[] => {
    // Simple suggestion generation based on context
    // In production, this could come from the API
    const defaultSuggestions = language === 'zh'
      ? ['能详细解释一下吗？', '还有其他的吗？', '具体怎么做？']
      : ['Can you explain in detail?', 'What else?', 'How to do it specifically?'];
    
    return defaultSuggestions;
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleFeedback = async (messageId: string, type: 'like' | 'dislike', content?: string) => {
    if (!features.feedback) return;

    try {
      await difyService.current.submitFeedback(messageId, type, content);
      
      // Update local state
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, feedback: type } : m
      ));
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleRegenerate = () => {
    // Remove last assistant message and resend
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove the last assistant message
      setMessages(prev => {
        const lastAssistantIndex = prev.map(m => m.id).lastIndexOf(
          prev.filter(m => m.role === 'assistant').slice(-1)[0]?.id
        );
        return prev.slice(0, lastAssistantIndex);
      });
      
      // Resend
      handleSendMessage(lastUserMessage.content, lastUserMessage.files || []);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion, []);
  };

  const handleUploadFile = async (file: File): Promise<MessageFile> => {
    return await difyService.current.uploadFile(file);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={`flex h-full bg-background ${className}`} data-theme={theme}>
      {/* Sidebar */}
      {features.sidebar && (
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={selectConversation}
          onNewConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
          onRenameConversation={renameConversation}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          language={language}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b flex items-center px-4 justify-between">
          <h2 className="font-semibold truncate">
            {title || (language === 'zh' ? '聊天界面' : 'Chat Panel')}
          </h2>
          {currentConversationId && (
            <span className="text-xs text-muted-foreground">
              {language === 'zh' ? '会话 ID: ' : 'Conversation: '}
              {currentConversationId.slice(0, 8)}...
            </span>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 relative overflow-hidden">
          <ScrollArea
            ref={scrollAreaRef}
            className="h-full"
            onScroll={handleScroll}
          >
            {!hasMessages ? (
              <WelcomeScreen
                config={config}
                language={language}
                onSuggestionClick={handleSuggestionClick}
                title={title}
              />
            ) : (
              <div className="pb-4">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isLastMessage={index === messages.length - 1 && message.role === 'assistant'}
                    onCopy={handleCopy}
                    onFeedback={handleFeedback}
                    onRegenerate={handleRegenerate}
                    onSuggestionClick={handleSuggestionClick}
                    language={language}
                    showActions={features.feedback}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-4 right-4 rounded-full shadow-lg"
              onClick={scrollToBottom}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 text-destructive hover:text-destructive"
                onClick={() => setError(null)}
              >
                {language === 'zh' ? '重试' : 'Retry'}
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <SuperInput
          onSend={handleSendMessage}
          onUploadFile={handleUploadFile}
          disabled={isStreaming}
          placeholder={config.i18n?.placeholder}
          language={language}
          showFileUpload={features.fileUpload}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
