/**
 * 对话项组件
 */
import React, { useState } from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { Popover, type PopoverItem } from '../common/Popover';
import type { DifyConversation } from '../../api/dify';
import type { Translations } from '../../types';

export interface ConversationItemProps {
  conversation: DifyConversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  translations: Translations;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
  translations,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const popoverItems: PopoverItem[] = [
    {
      key: 'rename',
      label: translations.rename,
      icon: <Edit size={14} />,
      onClick: onRename,
    },
    {
      key: 'delete',
      label: translations.remove,
      icon: <Trash2 size={14} />,
      onClick: onDelete,
      danger: true,
    },
  ];

  return (
    <div
      className={`dify-conversation-item ${isActive ? 'dify-conversation-item--active' : ''}`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="dify-conversation-item__name">
        {conversation.name || '未命名对话'}
      </div>
      {isHovered && (
        <div className="dify-conversation-item__actions">
          <Popover
            trigger={
              <button className="dify-conversation-item__more" aria-label="More actions">
                <MoreVertical size={16} />
              </button>
            }
            items={popoverItems}
            placement="bottom-end"
          />
        </div>
      )}
    </div>
  );
};
