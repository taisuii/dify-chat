/**
 * 输入区组件
 */
import React, { useRef, useEffect } from 'react';
import { Paperclip } from 'lucide-react';
import { ImagePreview } from './ImagePreview';
import { SendButton } from './SendButton';
import type { PendingFile, Translations } from '../../types';

export interface InputComposerProps {
  value: string;
  pendingFiles: PendingFile[];
  disabled: boolean;
  isStreaming: boolean;
  placeholder: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  translations: Translations;
}

export const InputComposer: React.FC<InputComposerProps> = ({
  value,
  pendingFiles,
  disabled,
  isStreaming,
  placeholder,
  onValueChange,
  onSend,
  onStop,
  onFilesAdd,
  onFileRemove,
  translations,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 36), 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  // 处理粘贴事件 (图片)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      onFilesAdd(imageFiles);
    }
  };

  // 处理拖拽上传
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      onFilesAdd(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesAdd(files);
    }
    e.target.value = '';
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  const canSend = !disabled && (value.trim() || pendingFiles.length > 0);
  const hasUploadingFiles = pendingFiles.some((f) => f.isUploading);

  return (
    <div className="dify-input-composer">
      <ImagePreview files={pendingFiles} onRemove={onFileRemove} />
      <div
        className="dify-input-composer__row"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <button
          className="dify-input-composer__attach"
          onClick={() => fileInputRef.current?.click()}
          aria-label={translations.upload}
          title={translations.upload}
        >
          <Paperclip size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <textarea
          ref={textareaRef}
          className="dify-input-composer__textarea"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{ fontSize: 16 }}
          enterKeyHint="send"
          inputMode="text"
        />
        <SendButton
          disabled={!canSend || hasUploadingFiles}
          isStreaming={isStreaming}
          onClick={onSend}
          onStop={onStop}
        />
      </div>
      <div className="dify-input-composer__footer">
        内容由 AI 生成,仅供参考
      </div>
    </div>
  );
};
