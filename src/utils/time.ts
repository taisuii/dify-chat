/**
 * 时间工具函数
 */
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export type TimeGroup = 'today' | 'yesterday' | 'lastWeek' | 'older';

/**
 * 根据时间戳判断属于哪个分组
 */
export function getTimeGroup(timestamp?: number): TimeGroup {
  if (!timestamp) return 'older';
  
  const date = new Date(timestamp * 1000);
  
  if (isToday(date)) return 'today';
  if (isYesterday(date)) return 'yesterday';
  if (isThisWeek(date, { weekStartsOn: 1 })) return 'lastWeek';
  
  return 'older';
}

/**
 * 格式化时间戳为可读字符串
 */
export function formatTimestamp(timestamp: number, language: 'zh' | 'en' = 'zh'): string {
  const date = new Date(timestamp * 1000);
  
  if (language === 'zh') {
    return format(date, 'MM月dd日 HH:mm', { locale: zhCN });
  }
  
  return format(date, 'MMM dd, HH:mm');
}

/**
 * 获取分组标题
 */
export function getGroupLabel(group: TimeGroup, language: 'zh' | 'en'): string {
  const labels = {
    zh: {
      today: '今天',
      yesterday: '昨天',
      lastWeek: '过去 7 天',
      older: '更早',
    },
    en: {
      today: 'Today',
      yesterday: 'Yesterday',
      lastWeek: 'Last 7 days',
      older: 'Older',
    },
  };
  
  return labels[language][group];
}
