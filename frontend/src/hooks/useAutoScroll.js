import { useRef, useEffect, useCallback, useState } from 'react';

export function useAutoScroll({ itemCount, intervalMs = 4000, enabled = true }) {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pausedRef = useRef(false);
  const timerRef = useRef(null);

  const scrollToIndex = useCallback((index) => {
    if (!scrollRef.current || itemCount <= 1) return;
    const container = scrollRef.current;
    const child = container.children[index];
    if (!child) return;
    const offset = child.offsetLeft - container.offsetLeft - 16;
    container.scrollTo({ left: offset, behavior: 'smooth' });
    setCurrentIndex(index);
  }, [itemCount]);

  const scrollDir = useCallback((dir) => {
    const next = dir === 'left'
      ? Math.max(0, currentIndex - 1)
      : Math.min(itemCount - 1, currentIndex + 1);
    scrollToIndex(next);
    pausedRef.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { pausedRef.current = false; }, intervalMs * 2);
  }, [currentIndex, itemCount, scrollToIndex, intervalMs]);

  useEffect(() => {
    if (!enabled || itemCount <= 1) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setCurrentIndex(prev => {
        const next = prev >= itemCount - 1 ? 0 : prev + 1;
        scrollToIndex(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, itemCount, intervalMs, scrollToIndex]);

  const onTouchStart = useCallback(() => {
    pausedRef.current = true;
    clearTimeout(timerRef.current);
  }, []);

  const onTouchEnd = useCallback(() => {
    timerRef.current = setTimeout(() => { pausedRef.current = false; }, intervalMs * 2);
  }, [intervalMs]);

  return { scrollRef, currentIndex, scrollDir, onTouchStart, onTouchEnd };
}
