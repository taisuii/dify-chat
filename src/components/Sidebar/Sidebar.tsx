/**
 * 侧边栏组件
 */
import React from 'react';
import { Plus } from 'lucide-react';
import { ConversationList } from './ConversationList';
import type { DifyConversation } from '../../api/dify';
import type { Language, Translations } from '../../types';

export interface SidebarProps {
  conversations: DifyConversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  language: Language;
  translations: Translations;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onNewConversation,
  language,
  translations,
}) => {
  return (
    <div className="dify-sidebar">
      <div className="dify-sidebar__header">
        <button
          className="dify-sidebar__new-chat"
          onClick={onNewConversation}
          aria-label={translations.newChat}
        >
          <Plus size={18} />
          <span>{translations.newChat}</span>
        </button>
      </div>
      <div className="dify-sidebar__body">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={onSelectConversation}
          onRename={onRenameConversation}
          onDelete={onDeleteConversation}
          language={language}
          translations={translations}
        />
      </div>
    </div>
  );
};
