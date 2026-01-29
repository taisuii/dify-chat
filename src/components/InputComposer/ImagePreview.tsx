/**
 * 图片预览组件
 */
import React from 'react';
import type { PendingFile } from '../../types';

export interface ImagePreviewProps {
  files: PendingFile[];
  onRemove: (index: number) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="dify-image-preview">
      {files.map((item, index) => (
        <div key={index} className="dify-image-preview__item">
          <div className="dify-image-preview__thumbnail">
            {item.preview && (
              <img src={item.preview} alt={item.file.name} />
            )}
            {item.isUploading && (
              <div className="dify-image-preview__loading">
                <svg
                  className="dify-image-preview__spinner"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
          <button
            className="dify-image-preview__remove"
            onClick={() => onRemove(index)}
            aria-label="Remove image"
            disabled={item.isUploading}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {item.error && (
            <div className="dify-image-preview__error">{item.error}</div>
          )}
        </div>
      ))}
    </div>
  );
};
