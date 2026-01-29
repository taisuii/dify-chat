import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  Pin,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Conversation } from '@/types/chat';
import { isToday, isYesterday, subDays, isAfter } from 'date-fns';
// Date locale imports (reserved for future use)
// import { zhCN, enUS } from 'date-fns/locale';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, name: string) => void;
  onPinConversation?: (id: string, pinned: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
  language?: 'zh' | 'en';
  className?: string;
}

interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  last7Days: Conversation[];
  older: Conversation[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onPinConversation,
  isOpen,
  onToggle,
  language = 'zh',
  className = '',
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Locale for date formatting (reserved for future use)
  // const locale = language === 'zh' ? zhCN : enUS;

  const groupedConversations = useMemo(() => {
    const groups: GroupedConversations = {
      today: [],
      yesterday: [],
      last7Days: [],
      older: [],
    };

    const sorted = [...conversations].sort((a, b) => b.timestamp - a.timestamp);
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    sorted.forEach((conv) => {
      const date = new Date(conv.timestamp);
      if (isToday(date)) {
        groups.today.push(conv);
      } else if (isYesterday(date)) {
        groups.yesterday.push(conv);
      } else if (isAfter(date, sevenDaysAgo)) {
        groups.last7Days.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [conversations]);

  const handleDelete = (id: string) => {
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveRename = () => {
    if (editingId && editName.trim()) {
      onRenameConversation(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const renderGroup = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((conv) => (
            <div
              key={conv.id}
              className={`
                group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                transition-colors duration-200
                ${currentConversationId === conv.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-muted'
                }
              `}
              onClick={() => onSelectConversation(conv.id)}
            >
              {editingId === conv.id ? (
                <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename();
                      if (e.key === 'Escape') cancelRename();
                    }}
                    onBlur={saveRename}
                    autoFocus
                    className="h-7 text-sm"
                  />
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate text-sm">
                    {conv.title || (language === 'zh' ? '新对话' : 'New Chat')}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleRename(conv.id, conv.title)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        {language === 'zh' ? '重命名' : 'Rename'}
                      </DropdownMenuItem>
                      {onPinConversation && (
                        <DropdownMenuItem onClick={() => onPinConversation(conv.id, !conv.isPinned)}>
                          <Pin className="h-4 w-4 mr-2" />
                          {conv.isPinned 
                            ? (language === 'zh' ? '取消置顶' : 'Unpin') 
                            : (language === 'zh' ? '置顶' : 'Pin')
                          }
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(conv.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {language === 'zh' ? '删除' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={onToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 bg-background border-r
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
          w-72 flex flex-col
          ${className}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <Button
            onClick={onNewConversation}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {language === 'zh' ? '新增对话' : 'New Chat'}
          </Button>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1 p-2">
          {renderGroup(language === 'zh' ? '今天' : 'Today', groupedConversations.today)}
          {renderGroup(language === 'zh' ? '昨天' : 'Yesterday', groupedConversations.yesterday)}
          {renderGroup(language === 'zh' ? '过去7天' : 'Last 7 Days', groupedConversations.last7Days)}
          {renderGroup(language === 'zh' ? '更早' : 'Older', groupedConversations.older)}
        </ScrollArea>

        {/* Desktop Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-10 top-1/2 -translate-y-1/2 hidden md:flex"
          onClick={onToggle}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'zh' ? '删除对话' : 'Delete Conversation'}
            </DialogTitle>
            <DialogDescription>
              {language === 'zh' 
                ? '确定要删除这个对话吗？此操作无法撤销。' 
                : 'Are you sure you want to delete this conversation? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {language === 'zh' ? '取消' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {language === 'zh' ? '删除' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
