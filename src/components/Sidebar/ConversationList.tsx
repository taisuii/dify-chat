/**
 * 对话列表组件
 */
import React, { useMemo } from 'react';
import { ConversationItem } from './ConversationItem';
import type { DifyConversation } from '../../api/dify';
import type { Language, Translations } from '../../types';
import { getTimeGroup, getGroupLabel, type TimeGroup } from '../../utils/time';

export interface ConversationListProps {
  conversations: DifyConversation[];
  activeConversationId?: string;
  onSelect: (conversationId: string) => void;
  onRename: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  language: Language;
  translations: Translations;
}

type GroupedConversations = {
  [key in TimeGroup]?: DifyConversation[];
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelect,
  onRename,
  onDelete,
  language,
  translations,
}) => {
  // 按时间分组
  const groupedConversations = useMemo(() => {
    const groups: GroupedConversations = {};
    
    conversations.forEach((conversation) => {
      const group = getTimeGroup(conversation.created_at);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group]!.push(conversation);
    });
    
    return groups;
  }, [conversations]);

  const groupOrder: TimeGroup[] = ['today', 'yesterday', 'lastWeek', 'older'];

  if (conversations.length === 0) {
    return (
      <div className="dify-conversation-list__empty">
        {translations.empty}
      </div>
    );
  }

  return (
    <div className="dify-conversation-list">
      {groupOrder.map((groupKey) => {
        const groupConversations = groupedConversations[groupKey];
        if (!groupConversations || groupConversations.length === 0) return null;

        return (
          <div key={groupKey} className="dify-conversation-group">
            <div className="dify-conversation-group__label">
              {getGroupLabel(groupKey, language)}
            </div>
            <div className="dify-conversation-group__items">
              {groupConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={activeConversationId === conversation.id}
                  onSelect={() => onSelect(conversation.id)}
                  onRename={() => onRename(conversation.id)}
                  onDelete={() => onDelete(conversation.id)}
                  translations={translations}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
