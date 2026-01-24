'use client';

import { useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#';

export function GlitchText({
  text,
  className = '',
  glitchIntensity = 'medium',
  as: Component = 'span',
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  // Smooth text scramble effect
  const triggerGlitch = useCallback(() => {
    if (isGlitching) return;
    setIsGlitching(true);

    const iterations = glitchIntensity === 'high' ? 4 : glitchIntensity === 'medium' ? 3 : 2;
    const frameTime = 50;
    let frame = 0;

    const animate = () => {
      if (frame >= iterations) {
        setDisplayText(text);
        setIsGlitching(false);
        return;
      }

      // Only glitch 20-40% of characters for subtle effect
      const glitchProbability = 0.2 + (frame / iterations) * 0.2;
      const glitched = text
        .split('')
        .map((char) => {
          if (char === ' ') return ' ';
          if (Math.random() < glitchProbability) {
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }
          return char;
        })
        .join('');

      setDisplayText(glitched);
      frame++;
      setTimeout(animate, frameTime);
    };

    animate();
  }, [text, glitchIntensity, isGlitching]);

  useEffect(() => {
    // Intervals between glitches - less frequent for smoother experience
    const intervals = {
      low: 12000,    // Every 12 seconds
      medium: 8000,  // Every 8 seconds
      high: 5000,    // Every 5 seconds
    };

    const interval = setInterval(() => {
      // Only 30% chance to actually glitch when interval fires
      if (Math.random() < 0.3) {
        triggerGlitch();
      }
    }, intervals[glitchIntensity]);

    return () => clearInterval(interval);
  }, [glitchIntensity, triggerGlitch]);

  // Update display text when prop changes
  useEffect(() => {
    if (!isGlitching) {
      setDisplayText(text);
    }
  }, [text, isGlitching]);

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
}

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
