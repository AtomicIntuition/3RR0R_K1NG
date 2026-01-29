'use client';

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import clsx from 'clsx';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#';

export const GlitchText = memo(function GlitchText({
  text,
  className = '',
  glitchIntensity = 'medium',
  as: Component = 'span',
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const isGlitchingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized glitch using requestAnimationFrame
  const triggerGlitch = useCallback(() => {
    if (isGlitchingRef.current) return;
    isGlitchingRef.current = true;

    const iterations = glitchIntensity === 'high' ? 4 : glitchIntensity === 'medium' ? 3 : 2;
    const frameDuration = 50;
    let frame = 0;
    let lastFrameTime = 0;

    const animate = (currentTime: number) => {
      if (frame >= iterations) {
        setDisplayText(text);
        isGlitchingRef.current = false;
        return;
      }

      // Throttle to ~20fps for glitch effect (50ms between frames)
      if (currentTime - lastFrameTime < frameDuration) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime;

      // Pre-compute glitch probability
      const glitchProbability = 0.2 + (frame / iterations) * 0.2;

      // Build glitched string more efficiently
      let glitched = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === ' ') {
          glitched += ' ';
        } else if (Math.random() < glitchProbability) {
          glitched += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        } else {
          glitched += char;
        }
      }

      setDisplayText(glitched);
      frame++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [text, glitchIntensity]);

  useEffect(() => {
    // Intervals between glitches - less frequent for smoother experience
    const intervals = {
      low: 15000,   // Every 15 seconds
      medium: 10000, // Every 10 seconds
      high: 6000,   // Every 6 seconds
    };

    const scheduleGlitch = () => {
      timeoutRef.current = setTimeout(() => {
        // 25% chance to actually glitch when interval fires
        if (Math.random() < 0.25) {
          triggerGlitch();
        }
        scheduleGlitch();
      }, intervals[glitchIntensity]);
    };

    scheduleGlitch();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [glitchIntensity, triggerGlitch]);

  // Update display text when prop changes
  useEffect(() => {
    if (!isGlitchingRef.current) {
      setDisplayText(text);
    }
  }, [text]);

  return (
    <Component
      className={clsx(
        'glitch',
        glitchIntensity === 'high' && 'glitch-high',
        className
      )}
      data-text={text}
    >
      {displayText}
    </Component>
  );
});

// Static version without animation for SSR
export function StaticGlitchText({
  text,
  className = '',
  as: Component = 'span',
}: Omit<GlitchTextProps, 'glitchIntensity'>) {
  return (
    <Component className={clsx('glitch', className)} data-text={text}>
      {text}
    </Component>
  );
}
