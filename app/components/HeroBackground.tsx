'use client';

import { memo } from 'react';

export const HeroBackground = memo(function HeroBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 50%, #FFFFFF 100%)',
      }}
      aria-hidden="true"
    />
  );
});
