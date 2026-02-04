'use client';

import { memo } from 'react';

export const HeroBackground = memo(function HeroBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(180deg, #09090B 0%, #0f0f12 50%, #09090B 100%)',
      }}
      aria-hidden="true"
    />
  );
});
