/**
 * 翻译工具
 */
import type { Language, Translations } from '../types';

export const translations: Record<Language, Translations> = {
  zh: {
    conversations: '对话列表',
    empty: '暂无对话',
    rename: '重命名',
    renamePrompt: '请输入新的对话名称',
    remove: '删除',
    deleteConfirm: '确认删除该对话吗?',
    newChat: '新建对话',
    inputPlaceholder: '输入消息…',
    like: '赞',
    dislike: '踩',
    copy: '复制',
    copied: '已复制',
    regenerate: '重新生成',
    upload: '上传',
    stop: '停止',
    failed: '请求失败,请稍后重试',
    networkError: '网络连接中断',
    retry: '重试',
    thinking: '正在思考...',
    welcome: '你好!很高兴见到你~',
    today: '今天',
    yesterday: '昨天',
    lastWeek: '过去 7 天',
    older: '更早',
  },
  en: {
    conversations: 'Conversations',
    empty: 'No conversations',
    rename: 'Rename',
    renamePrompt: 'Enter a new conversation name',
    remove: 'Delete',
    deleteConfirm: 'Delete this conversation?',
    newChat: 'New chat',
    inputPlaceholder: 'Type a message…',
    like: 'Like',
    dislike: 'Dislike',
    copy: 'Copy',
    copied: 'Copied',
    regenerate: 'Regenerate',
    upload: 'Upload',
    stop: 'Stop',
    failed: 'Request failed. Please try again.',
    networkError: 'Network connection interrupted',
    retry: 'Retry',
    thinking: 'Thinking...',
    welcome: 'Hello! Nice to meet you~',
    today: 'Today',
    yesterday: 'Yesterday',
    lastWeek: 'Last 7 days',
    older: 'Older',
  },
};

export function getTranslations(language: Language): Translations {
  return translations[language];
}
