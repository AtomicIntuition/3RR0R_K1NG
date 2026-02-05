'use client';

import { useEffect, useState, useCallback } from 'react';

interface UseDpadNavigationOptions {
  items: number;
  columns?: number;
  onSelect?: (index: number) => void;
  onBack?: () => void;
  enabled?: boolean;
}

export function useDpadNavigation({
  items,
  columns = 1,
  onSelect,
  onBack,
  enabled = true,
}: UseDpadNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Reset focus when items change
  useEffect(() => {
    if (focusedIndex >= items) {
      setFocusedIndex(Math.max(0, items - 1));
    }
  }, [items, focusedIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || items === 0) return;

      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, items - 1));
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + columns;
            return next < items ? next : prev;
          });
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - columns;
            return next >= 0 ? next : prev;
          });
          break;
        }
        case 'Enter': {
          e.preventDefault();
          onSelect?.(focusedIndex);
          break;
        }
        case 'Escape':
        case 'Backspace': {
          e.preventDefault();
          onBack?.();
          break;
        }
      }
    },
    [enabled, items, columns, focusedIndex, onSelect, onBack]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return { focusedIndex, setFocusedIndex };
}
