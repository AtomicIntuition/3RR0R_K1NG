'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * IntersectionObserver-based scrollspy hook.
 * Returns the ID of the currently active section.
 */
export function useScrollSpy(sectionIds: string[], offset = 120) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    // Track which sections are visible
    const visibleSections = new Map<string, IntersectionObserverEntry>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry);
          } else {
            visibleSections.delete(entry.target.id);
          }
        }

        // Pick the topmost visible section
        if (visibleSections.size > 0) {
          let topId = '';
          let topY = Infinity;
          visibleSections.forEach((entry, id) => {
            const rect = entry.boundingClientRect;
            if (rect.top < topY) {
              topY = rect.top;
              topId = id;
            }
          });
          if (topId) setActiveId(topId);
        }
      },
      {
        rootMargin: `-${offset}px 0px -40% 0px`,
        threshold: [0, 0.1],
      }
    );

    const elements: Element[] = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        observerRef.current.observe(el);
        elements.push(el);
      }
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sectionIds, offset]);

  return activeId;
}
