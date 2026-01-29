/**
 * 统一图标组件
 * 封装 Lucide React 图标库
 */
import React from 'react';
import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  color?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  strokeWidth = 2,
  color,
  onClick,
  'aria-label': ariaLabel,
}) => {
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideIcons.LucideProps>;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
    />
  );
};

/**
 * 常用图标名称映射（方便使用）
 */
export const IconNames = {
  // 聊天相关
  MessageCircle: 'MessageCircle' as IconName,
  Send: 'Send' as IconName,
  Mic: 'Mic' as IconName,
  MicOff: 'MicOff' as IconName,
  
  // 操作相关
  Plus: 'Plus' as IconName,
  X: 'X' as IconName,
  MoreVertical: 'MoreVertical' as IconName,
  ChevronDown: 'ChevronDown' as IconName,
  ChevronUp: 'ChevronUp' as IconName,
  ArrowDown: 'ArrowDown' as IconName,
  
  // 文件相关
  Paperclip: 'Paperclip' as IconName,
  Image: 'Image' as IconName,
  File: 'File' as IconName,
  Download: 'Download' as IconName,
  
  // 反馈相关
  ThumbsUp: 'ThumbsUp' as IconName,
  ThumbsDown: 'ThumbsDown' as IconName,
  Copy: 'Copy' as IconName,
  Check: 'Check' as IconName,
  RefreshCw: 'RefreshCw' as IconName,
  
  // 编辑相关
  Edit: 'Edit' as IconName,
  Trash2: 'Trash2' as IconName,
  
  // 搜索相关
  Search: 'Search' as IconName,
  
  // 状态相关
  Loader2: 'Loader2' as IconName,
  AlertCircle: 'AlertCircle' as IconName,
  Info: 'Info' as IconName,
  
  // 导航相关
  Menu: 'Menu' as IconName,
  Settings: 'Settings' as IconName,
} as const;
