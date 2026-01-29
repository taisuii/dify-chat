/**
 * 自动滚动 Hook
 */
import { useEffect, useRef, useState } from 'react';

export function useAutoScroll<T extends HTMLElement>(dependencies: any[]) {
  const containerRef = useRef<T>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 检查是否在底部
  const checkIfAtBottom = () => {
    if (!containerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 100;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // 滚动到底部
  const scrollToBottom = (smooth = false) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom = checkIfAtBottom();
      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 当消息更新时自动滚动
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(true);
    }
  }, dependencies);

  return {
    containerRef,
    isAtBottom,
    showScrollButton,
    scrollToBottom,
  };
}
