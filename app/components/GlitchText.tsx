'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#________';

export function GlitchText({
  text,
  className = '',
  glitchIntensity = 'medium',
  as: Component = 'span',
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchIntervals = {
      low: 5000,
      medium: 3000,
      high: 1500,
    };

    const glitchDuration = {
      low: 100,
      medium: 150,
      high: 200,
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsGlitching(true);

        // Randomly glitch characters
        const glitched = text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (Math.random() > 0.7) {
              return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            }
            return char;
          })
          .join('');

        setDisplayText(glitched);

        // Reset after glitch duration
        setTimeout(() => {
          setDisplayText(text);
          setIsGlitching(false);
        }, glitchDuration[glitchIntensity]);
      }
    }, glitchIntervals[glitchIntensity]);

    return () => clearInterval(interval);
  }, [text, glitchIntensity]);

  return (
    <Component
      className={clsx(
        'glitch relative',
        isGlitching && 'animate-glitch',
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
