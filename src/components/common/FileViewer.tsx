/**
 * 文件预览组件
 * 支持图片、文档预览
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import type { MessageFile } from '../../types';

export interface FileViewerProps {
  file: MessageFile;
  isOpen: boolean;
  onClose: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({ file, isOpen, onClose }) => {
  const [zoom, setZoom] = React.useState(1);

  const handleDownload = () => {
    if (!file.url) return;
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  // 重置缩放当文件改变时
  React.useEffect(() => {
    setZoom(1);
  }, [file.url]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="dify-file-viewer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="dify-file-viewer__backdrop" />
        
        <div className="dify-file-viewer__content" onClick={(e) => e.stopPropagation()}>
          <div className="dify-file-viewer__header">
            <div className="dify-file-viewer__title">
              {file.name || '文件预览'}
            </div>
            <div className="dify-file-viewer__actions">
              {file.type === 'image' && (
                <>
                  <button
                    className="dify-file-viewer__action-btn"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    aria-label="Zoom out"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <span className="dify-file-viewer__zoom-level">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    className="dify-file-viewer__action-btn"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    aria-label="Zoom in"
                  >
                    <ZoomIn size={20} />
                  </button>
                </>
              )}
              {file.url && (
                <button
                  className="dify-file-viewer__action-btn"
                  onClick={handleDownload}
                  aria-label="Download"
                >
                  <Download size={20} />
                </button>
              )}
              <button
                className="dify-file-viewer__action-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="dify-file-viewer__body">
            {file.type === 'image' && file.url && (
              <motion.img
                src={file.url}
                alt={file.name || 'Preview'}
                className="dify-file-viewer__image"
                style={{ transform: `scale(${zoom})` }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: zoom, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
            {file.type === 'document' && file.url && (
              <iframe
                src={file.url}
                className="dify-file-viewer__iframe"
                title={file.name || 'Document'}
              />
            )}
            {!file.url && (
              <div className="dify-file-viewer__empty">
                无法预览此文件
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
