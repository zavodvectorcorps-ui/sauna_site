import { useRef, useEffect, useCallback, useState } from 'react';

export function useAutoScroll({ itemCount, intervalMs = 4000, enabled = true }) {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const timerRef = useRef(null);

  const updateIndex = useCallback((idx) => {
    indexRef.current = idx;
    setCurrentIndex(idx);
  }, []);

  const scrollToIndex = useCallback((index) => {
    const container = scrollRef.current;
    if (!container || itemCount <= 1) return;
    const cards = container.querySelectorAll('[data-testid]');
    if (cards.length === 0) return;
    const card = cards[index];
    if (!card) return;
    const containerLeft = container.getBoundingClientRect().left;
    const cardLeft = card.getBoundingClientRect().left;
    const newScroll = container.scrollLeft + (cardLeft - containerLeft);
    container.scrollTo({ left: newScroll, behavior: 'smooth' });
  }, [itemCount]);

  const scrollDir = useCallback((dir) => {
    const curr = indexRef.current;
    const next = dir === 'left'
      ? (curr <= 0 ? itemCount - 1 : curr - 1)
      : (curr >= itemCount - 1 ? 0 : curr + 1);
    scrollToIndex(next);
    updateIndex(next);
    pausedRef.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { pausedRef.current = false; }, intervalMs * 2);
  }, [itemCount, scrollToIndex, updateIndex, intervalMs]);

  useEffect(() => {
    if (!enabled || itemCount <= 1) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const curr = indexRef.current;
      const next = curr >= itemCount - 1 ? 0 : curr + 1;
      scrollToIndex(next);
      updateIndex(next);
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, itemCount, intervalMs, scrollToIndex, updateIndex]);

  const onTouchStart = useCallback(() => {
    pausedRef.current = true;
    clearTimeout(timerRef.current);
  }, []);

  const onTouchEnd = useCallback(() => {
    timerRef.current = setTimeout(() => { pausedRef.current = false; }, intervalMs * 2);
  }, [intervalMs]);

  return { scrollRef, currentIndex, scrollDir, onTouchStart, onTouchEnd };
}
