import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Paperclip, 
  Send, 
  X, 
  Loader2,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { MessageFile } from '@/types/chat';

interface SuperInputProps {
  onSend: (message: string, files: MessageFile[]) => void;
  onUploadFile: (file: File) => Promise<MessageFile>;
  disabled?: boolean;
  placeholder?: string;
  language?: 'zh' | 'en';
  showFileUpload?: boolean;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string;
}

export const SuperInput: React.FC<SuperInputProps> = ({
  onSend,
  onUploadFile,
  disabled = false,
  placeholder,
  language = 'zh',
  showFileUpload = true,
  maxFileSize = 10,
  acceptedFileTypes = 'image/*,.pdf,.doc,.docx,.txt',
}) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<MessageFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultPlaceholder = language === 'zh' ? '输入消息...' : 'Type a message...';

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if ((!message.trim() && files.length === 0) || disabled || uploadingFiles.size > 0) return;
    
    onSend(message.trim(), files);
    setMessage('');
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    for (const file of Array.from(selectedFiles)) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(
          language === 'zh' 
            ? `文件大小不能超过 ${maxFileSize}MB` 
            : `File size cannot exceed ${maxFileSize}MB`
        );
        continue;
      }

      // Create temporary ID for tracking upload
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add to uploading set
      setUploadingFiles(prev => new Set(prev).add(tempId));

      try {
        // Create local preview for images
        let thumbnail: string | undefined;
        if (file.type.startsWith('image/')) {
          thumbnail = URL.createObjectURL(file);
        }

        // Add to files with temp ID
        const tempFile: MessageFile = {
          id: tempId,
          name: file.name,
          size: file.size,
          type: file.type,
          thumbnail,
        };
        setFiles(prev => [...prev, tempFile]);

        // Upload file
        const uploadedFile = await onUploadFile(file);
        
        // Replace temp file with uploaded file
        setFiles(prev => prev.map(f => f.id === tempId ? uploadedFile : f));
      } catch (error) {
        console.error('Upload failed:', error);
        alert(
          language === 'zh' 
            ? `上传失败: ${file.name}` 
            : `Upload failed: ${file.name}`
        );
        // Remove temp file on error
        setFiles(prev => prev.filter(f => f.id !== tempId));
      } finally {
        setUploadingFiles(prev => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });
      }
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];

    for (const item of Array.from(items)) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach(f => dataTransfer.items.add(f));
      handleFileSelect(dataTransfer.files);
    }
  }, []);

  const isUploading = uploadingFiles.size > 0;
  const canSend = (message.trim() || files.length > 0) && !disabled && !isUploading;

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* File Preview Area */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative group flex items-center gap-2 px-3 py-2 rounded-lg bg-muted"
              >
                {file.type.startsWith('image/') && file.thumbnail ? (
                  <div className="w-10 h-10 rounded overflow-hidden">
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>
                )}
                
                <div className="flex-1 min-w-0 max-w-[150px]">
                  <p className="text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                {uploadingFiles.has(file.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground 
                             flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div
          className={`
            relative rounded-2xl border bg-background transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : ''}
            ${disabled ? 'opacity-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder || defaultPlaceholder}
            disabled={disabled}
            className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent 
                     focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 pr-24"
            rows={1}
          />

          {/* Action Buttons */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {showFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={acceptedFileTypes}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  title={language === 'zh' ? '上传文件' : 'Upload file'}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              size="icon"
              className={`
                h-8 w-8 rounded-full transition-colors
                ${canSend 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'bg-muted text-muted-foreground'
                }
              `}
              onClick={handleSend}
              disabled={!canSend}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-2">
          {language === 'zh' 
            ? '内容由 AI 生成，仅供参考' 
            : 'Content generated by AI, for reference only'
          }
        </p>

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary 
                        rounded-lg flex items-center justify-center pointer-events-none">
            <p className="text-primary font-medium">
              {language === 'zh' ? '拖放文件到此处' : 'Drop files here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperInput;
