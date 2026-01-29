/**
 * 聊天面板主组件
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteConversation,
  getAppParameters,
  listConversations,
  listMessages,
  renameConversation,
  stopChatTask,
  streamChatMessage,
  submitFeedback,
  uploadFile,
  type DifyConversation,
  type DifyFileInput,
} from '../api/dify';
import { Sidebar } from './Sidebar/Sidebar';
import { MessageList } from './MessageList/MessageList';
import { WelcomeScreen } from './WelcomeScreen/WelcomeScreen';
import { InputComposer } from './InputComposer/InputComposer';
import type { UiMessage, PendingFile, Language, ThemeMode, WidgetConfig } from '../types';
import { getTranslations } from '../utils/translations';
import { applyTheme, removeTheme } from '../theme';

export interface ChatPanelProps {
  apiBase: string;
  apiKey: string;
  user?: string;
  title?: string;
  theme?: ThemeMode;
  language?: Language;
  initialMessage?: string;
  initialConversationId?: string;
  
  // 新增配置
  config?: WidgetConfig;
  
  // 新增回调
  onMessageSend?: (message: string) => void;
  onMessageReceive?: (message: UiMessage) => void;
  onConversationChange?: (conversationId: string) => void;
  onFileUpload?: (file: File) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  apiBase,
  apiKey,
  user,
  title = 'Dify Chat',
  theme = 'light',
  language = 'zh',
  initialMessage,
  initialConversationId,
  config,
  onMessageSend,
  onMessageReceive,
  onConversationChange,
  onFileUpload,
  onError,
  onClose,
  className = '',
}) => {
  const t = getTranslations(language);
  
  // 功能开关（从配置中读取，默认全部开启）
  const features = config?.features ?? {
    sidebar: true,
    fileUpload: true,
    voiceInput: false,
    messageSearch: false,
    feedback: true,
    codeHighlight: true,
    filePreview: true,
  };

  // 避免未使用的变量警告
  void onMessageReceive;
  void onConversationChange;
  void onFileUpload;
  void onClose;
  void features;
  
  const generatedUserRef = useRef(
    user ?? `user-${Math.random().toString(36).slice(2, 10)}`,
  );
  const resolvedUser = user ?? generatedUserRef.current;
  const panelRef = useRef<HTMLDivElement>(null);
  const clientConfig = useMemo(
    () => ({
      apiBase,
      apiKey,
    }),
    [apiBase, apiKey],
  );

  const [conversations, setConversations] = useState<DifyConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(
    initialConversationId,
  );
  const [openingStatement, setOpeningStatement] = useState<string>('');
  const [openingSuggestions, setOpeningSuggestions] = useState<string[]>([]);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const handleError = (error: Error) => {
    setErrorMessage(error.message || t.failed);
    onError?.(error);
  };

  const resetToGreeting = () => {
    const fallback =
      initialMessage ||
      (language === 'zh'
        ? '你好!我是 Dify 聊天助手,有什么可以帮你?'
        : 'Hello! I am Dify assistant. How can I help?');
    const greeting = openingStatement || fallback;
    setMessages([
      {
        role: 'assistant',
        content: greeting,
        suggestions: openingSuggestions,
      },
    ]);
  };

  const refreshConversations = async () => {
    try {
      const data = await listConversations(clientConfig, resolvedUser);
      setConversations(data);
    } catch (error) {
      handleError(error as Error);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const history = await listMessages(clientConfig, conversationId, resolvedUser);
      const mapped: UiMessage[] = [];
      history.forEach((item) => {
        if (item.query) {
          mapped.push({
            role: 'user',
            content: item.query,
            createdAt: item.created_at,
          });
        }
        if (item.answer) {
          mapped.push({
            id: item.id,
            role: 'assistant',
            content: item.answer,
            createdAt: item.created_at,
            suggestions: (item.metadata?.suggested_questions as string[]) ?? [],
          });
        }
      });
      setMessages(mapped.length ? mapped : []);
    } catch (error) {
      handleError(error as Error);
    }
  };

  useEffect(() => {
    if (!apiBase || !apiKey) return;
    getAppParameters(clientConfig, resolvedUser)
      .then((data) => {
        if (typeof data.opening_statement === 'string') {
          setOpeningStatement(data.opening_statement);
        }
        if (Array.isArray(data.suggested_questions)) {
          setOpeningSuggestions(data.suggested_questions.filter(Boolean));
        }
      })
      .catch((error) => handleError(error as Error));
    refreshConversations();
  }, [apiBase, apiKey, resolvedUser]);

  // 应用主题配置
  useEffect(() => {
    if (config?.theme && panelRef.current) {
      applyTheme(config.theme, panelRef.current);
      return () => {
        if (config?.theme && panelRef.current) {
          removeTheme(config.theme, panelRef.current);
        }
      };
    }
  }, [config?.theme]);

  useEffect(() => {
    if (!activeConversationId) {
      resetToGreeting();
      return;
    }
    loadConversationMessages(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId) return;
    const hasUserMessage = messages.some((msg) => msg.role === 'user');
    if (!hasUserMessage && !isSending) {
      resetToGreeting();
    }
  }, [activeConversationId, openingStatement, openingSuggestions, messages, isSending]);

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
    resetToGreeting();
    setPendingFiles([]);
    setInputMessage('');
  };

  const handleRenameConversation = async (conversationId: string) => {
    const name = window.prompt(t.renamePrompt);
    if (!name) return;
    try {
      await renameConversation(clientConfig, conversationId, name);
      await refreshConversations();
    } catch (error) {
      handleError(error as Error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await deleteConversation(clientConfig, conversationId);
      if (activeConversationId === conversationId) {
        handleNewConversation();
      }
      await refreshConversations();
    } catch (error) {
      handleError(error as Error);
    }
  };

  const handleFilesAdd = (files: File[]) => {
    const newFiles: PendingFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isUploading: false,
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index: number) => {
    setPendingFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUploadFiles = async () => {
    if (pendingFiles.length === 0) return [];
    
    // 标记为上传中
    setPendingFiles((prev) =>
      prev.map((f) => ({ ...f, isUploading: true }))
    );

    try {
      const uploaded = await Promise.all(
        pendingFiles.map(async (item) => {
          const fileId = await uploadFile(clientConfig, item.file, resolvedUser);
          const fileType = item.file.type.startsWith('image/')
            ? 'image'
            : item.file.type.startsWith('audio/')
              ? 'audio'
              : item.file.type.startsWith('video/')
                ? 'video'
                : 'document';
          return {
            type: fileType,
            transfer_method: 'local_file',
            upload_file_id: fileId,
          } as DifyFileInput;
        }),
      );
      
      // 清空文件列表
      pendingFiles.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
      setPendingFiles([]);
      
      return uploaded;
    } catch (error) {
      // 标记错误
      setPendingFiles((prev) =>
        prev.map((f) => ({ ...f, isUploading: false, error: '上传失败' }))
      );
      throw error;
    }
  };

  const handleSendMessage = async (overrideMessage?: string) => {
    const nextMessage = (overrideMessage ?? inputMessage).trim();
    if (!nextMessage && pendingFiles.length === 0) return;
    if (isSending) return;
    
    setErrorMessage(null);
    setInputMessage('');
    setIsSending(true);
    setIsTyping(true);

    if (onMessageSend && nextMessage) {
      onMessageSend(nextMessage);
    }

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      ...(nextMessage ? [{ role: 'user' as const, content: nextMessage }] : []),
      { id: assistantId, role: 'assistant' as const, content: '', isStreaming: true },
    ]);

    try {
      const files = await handleUploadFiles();
      const streamResult = await streamChatMessage(
        clientConfig,
        {
          query: nextMessage || ' ',
          user: resolvedUser,
          conversation_id: activeConversationId,
          files: files.length ? files : undefined,
        },
        {
          onMessageChunk: (chunk) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      content: `${msg.content}${chunk}`,
                    }
                  : msg,
              ),
            );
          },
          onMessageEnd: (data) => {
            const metadata = (data.metadata as Record<string, unknown>) ?? {};
            const suggestions = (metadata?.suggested_questions as string[]) ?? [];
            const messageId = data.message_id as string | undefined;
            const conversationId = data.conversation_id as string | undefined;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      id: messageId ?? msg.id,
                      isStreaming: false,
                      suggestions,
                    }
                  : msg,
              ),
            );
            if (conversationId) {
              setActiveConversationId(conversationId);
            }
          },
          onEvent: (data) => {
            if (typeof data.task_id === 'string') {
              setCurrentTaskId(data.task_id);
              setIsStreaming(true);
            }
          },
          onError: (error) => {
            handleError(error);
          },
        },
      );
      if (streamResult.conversationId) {
        setActiveConversationId(streamResult.conversationId);
      }
      setCurrentTaskId(streamResult.taskId ?? null);
      await refreshConversations();
    } catch (error) {
      handleError(error as Error);
      // 移除失败的 assistant 消息
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
    } finally {
      setIsSending(false);
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user');
    if (!lastUserMessage) return;
    setMessages((prev) => {
      const lastAssistantIndex = [...prev]
        .map((item, idx) => ({ item, idx }))
        .reverse()
        .find((entry) => entry.item.role === 'assistant')?.idx;
      if (lastAssistantIndex === undefined) return prev;
      return prev.filter((_, index) => index !== lastAssistantIndex);
    });
    handleSendMessage(lastUserMessage.content);
  };

  const handleStop = async () => {
    if (!currentTaskId) return;
    try {
      await stopChatTask(clientConfig, currentTaskId);
      setIsStreaming(false);
      setIsTyping(false);
    } catch (error) {
      handleError(error as Error);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'like' | 'dislike') => {
    try {
      await submitFeedback(clientConfig, messageId, rating);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                feedback: rating,
              }
            : msg,
        ),
      );
    } catch (error) {
      handleError(error as Error);
    }
  };

  const showWelcome = messages.length === 0 || (messages.length === 1 && messages[0].role === 'assistant' && !messages[0].id);

  return (
    <div ref={panelRef} className={`dify-chat-panel ${className}`} data-theme={theme}>
      <div className="dify-chat-panel__layout">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewConversation={handleNewConversation}
          language={language}
          translations={t}
        />

        <div className="dify-chat-panel__content">
          {errorMessage && (
            <div className="dify-chat-panel__error">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)}>×</button>
            </div>
          )}
          
          {showWelcome ? (
            <WelcomeScreen
              title={title}
              message={openingStatement || t.welcome}
              suggestions={openingSuggestions}
              onSuggestionClick={handleSendMessage}
            />
          ) : (
            <MessageList
              messages={messages}
              isTyping={isTyping}
              onFeedback={handleFeedback}
              onRegenerate={handleRegenerate}
              onSuggestionClick={handleSendMessage}
              translations={t}
            />
          )}

          <InputComposer
            value={inputMessage}
            pendingFiles={pendingFiles}
            disabled={isSending}
            isStreaming={isStreaming}
            placeholder={t.inputPlaceholder}
            onValueChange={setInputMessage}
            onSend={() => handleSendMessage()}
            onStop={handleStop}
            onFilesAdd={handleFilesAdd}
            onFileRemove={handleFileRemove}
            translations={t}
          />
        </div>
      </div>
    </div>
  );
};
