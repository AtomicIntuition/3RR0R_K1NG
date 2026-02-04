'use client';

import { memo } from 'react';
import clsx from 'clsx';

interface BrandTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

// Simple clean text component - replaces GlitchText
// Keeping the name GlitchText for backwards compatibility
export const GlitchText = memo(function GlitchText({
  text,
  className = '',
  as: Component = 'span',
}: BrandTextProps) {
  return (
    <Component className={clsx(className)}>
      {text}
    </Component>
  );
});

// Alias for clarity
export const BrandText = GlitchText;

// Static version - same as GlitchText now
export function StaticGlitchText({
  text,
  className = '',
  as: Component = 'span',
}: BrandTextProps) {
  return (
    <Component className={clsx(className)}>
      {text}
    </Component>
  );
}
