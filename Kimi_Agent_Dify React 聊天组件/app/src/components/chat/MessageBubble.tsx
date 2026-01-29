import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Message, WorkflowStep } from '@/types/chat';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isLastMessage: boolean;
  onCopy: (content: string) => void;
  onFeedback: (messageId: string, type: 'like' | 'dislike', content?: string) => void;
  onRegenerate?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  language?: 'zh' | 'en';
  showActions?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLastMessage,
  onCopy,
  onFeedback,
  onRegenerate,
  onSuggestionClick,
  language = 'zh',
  showActions = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [pendingFeedback, setPendingFeedback] = useState<'like' | 'dislike' | null>(null);
  const [workflowExpanded, setWorkflowExpanded] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const locale = language === 'zh' ? zhCN : enUS;
  const isUser = message.role === 'user';

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    if (type === 'dislike') {
      setPendingFeedback(type);
      setFeedbackDialogOpen(true);
    } else {
      onFeedback(message.id, type);
    }
  };

  const submitFeedback = () => {
    if (pendingFeedback) {
      onFeedback(message.id, pendingFeedback, feedbackContent);
      setFeedbackDialogOpen(false);
      setFeedbackContent('');
      setPendingFeedback(null);
    }
  };

  const renderWorkflowSteps = (steps: WorkflowStep[]) => {
    if (!steps || steps.length === 0) return null;

    return (
      <div className="mb-3">
        <button
          onClick={() => setWorkflowExpanded(!workflowExpanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {workflowExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>{language === 'zh' ? '工作流' : 'Workflow'}</span>
          <span className="text-xs text-muted-foreground">({steps.length})</span>
        </button>
        
        {workflowExpanded && (
          <div className="mt-2 pl-4 border-l-2 border-muted space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-2">
                <div className={`
                  w-2 h-2 rounded-full mt-1.5
                  ${step.status === 'completed' ? 'bg-green-500' : 
                    step.status === 'failed' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}
                `} />
                <div className="flex-1">
                  <p className="text-sm">{step.name}</p>
                  {step.details && (
                    <p className="text-xs text-muted-foreground">{step.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFiles = () => {
    if (!message.files || message.files.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-3">
        {message.files.map((file) => (
          <div
            key={file.id}
            className="relative group"
          >
            {file.type.startsWith('image/') ? (
              <div
                className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer border hover:border-primary transition-colors"
                onClick={() => file.url && setImagePreview(file.url)}
              >
                <img
                  src={file.url || file.thumbnail}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSuggestions = () => {
    if (!message.suggestions || message.suggestions.length === 0) return null;

    return (
      <div className="mt-4">
        <p className="text-sm text-muted-foreground mb-2">
          {language === 'zh' ? '你可能还想问:' : 'You may also ask:'}
        </p>
        <div className="flex flex-wrap gap-2">
          {message.suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="px-4 py-2 rounded-full text-sm bg-muted hover:bg-muted/80 transition-colors text-left"
            >
              {suggestion}
              <span className="ml-1 text-muted-foreground">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        ref={bubbleRef}
        className={`
          group py-4 px-4 md:px-6
          ${isUser ? 'bg-muted/30' : 'bg-background'}
        `}
      >
        <div className={`max-w-4xl mx-auto ${isUser ? 'ml-auto' : ''}`}>
          {/* Avatar and Content */}
          <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`
              w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
              ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}
            `}>
              {isUser ? (
                <span className="text-sm font-medium">U</span>
              ) : (
                <span className="text-lg">🤖</span>
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
              {/* Workflow Steps */}
              {!isUser && message.workflowSteps && renderWorkflowSteps(message.workflowSteps)}

              {/* Files */}
              {message.files && message.files.length > 0 && renderFiles()}

              {/* Message Content */}
              <div
                className={`
                  inline-block text-left
                  ${isUser 
                    ? 'bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm' 
                    : 'text-foreground'
                  }
                `}
              >
                {message.isStreaming && !message.content ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {language === 'zh' ? '正在思考...' : 'Thinking...'}
                    </span>
                  </div>
                ) : isUser ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match;
                          return isInline ? (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          ) : (
                            <div className="relative group/code">
                              <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => onCopy(String(children))}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className={`
                mt-1 text-xs text-muted-foreground
                ${isUser ? 'text-right' : ''}
              `}>
                {format(message.timestamp, 'HH:mm', { locale })}
              </div>

              {/* Suggestions */}
              {!isUser && renderSuggestions()}

              {/* Action Bar */}
              {showActions && !isUser && !message.isStreaming && (
                <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleCopy}
                    title={language === 'zh' ? '复制' : 'Copy'}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${message.feedback === 'like' ? 'text-primary' : ''}`}
                    onClick={() => handleFeedback('like')}
                    title={language === 'zh' ? '点赞' : 'Like'}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${message.feedback === 'dislike' ? 'text-destructive' : ''}`}
                    onClick={() => handleFeedback('dislike')}
                    title={language === 'zh' ? '点踩' : 'Dislike'}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>

                  {isLastMessage && onRegenerate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={onRegenerate}
                      title={language === 'zh' ? '重新生成' : 'Regenerate'}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}

                  <span className="text-xs text-muted-foreground ml-2">
                    {language === 'zh' ? '回复时间: ' : 'Response time: '}
                    {format(message.timestamp, 'yyyy-MM-dd HH:mm:ss', { locale })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'zh' ? '感谢反馈' : 'Thank you for your feedback'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">
              {language === 'zh' 
                ? '请告知我们此回复有何不妥之处。' 
                : 'Please let us know what was wrong with this response.'
              }
            </p>
            <Textarea
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder={language === 'zh' ? '请输入...' : 'Please enter...'}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              {language === 'zh' ? '取消' : 'Cancel'}
            </Button>
            <Button onClick={submitFeedback}>
              {language === 'zh' ? '确定' : 'Submit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageBubble;
