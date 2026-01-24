'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { GlitchText } from './GlitchText';

interface LoadingStateProps {
  phase?: string;
  percentage?: number;
  className?: string;
}

const LOADING_MESSAGES = [
  'Initializing scan protocols...',
  'Probing security headers...',
  'Analyzing performance metrics...',
  'Checking SEO configuration...',
  'Testing accessibility compliance...',
  'Detecting technology stack...',
  'Compiling vulnerability report...',
  'Generating roast...',
];

const ASCII_FRAMES = [
  `
   ╭─────────────────╮
   │  SCANNING...    │
   │  ░░░░░░░░░░░░░░ │
   ╰─────────────────╯
  `,
  `
   ╭─────────────────╮
   │  SCANNING...    │
   │  ▓░░░░░░░░░░░░░ │
   ╰─────────────────╯
  `,
  `
   ╭─────────────────╮
   │  SCANNING...    │
   │  ▓▓▓░░░░░░░░░░░ │
   ╰─────────────────╯
  `,
  `
   ╭─────────────────╮
   │  SCANNING...    │
   │  ▓▓▓▓▓░░░░░░░░░ │
   ╰─────────────────╯
  `,
  `
   ╭─────────────────╮
   │  SCANNING...    │
   │  ▓▓▓▓▓▓▓░░░░░░░ │
   ╰─────────────────╯
  `,
  `
   ╭─────────────────╮
   │  SCANNING...    │
   │  ▓▓▓▓▓▓▓▓▓░░░░░ │
   ╰─────────────────╯
  `,
  `
   ╭─────────────────╮
   │  SCANNING...    │
   │  ▓▓▓▓▓▓▓▓▓▓▓░░░ │
   ╰─────────────────╯
  `,
  `
   ╭─────────────────╮
   │  SCANNING...    │
   │  ▓▓▓▓▓▓▓▓▓▓▓▓▓░ │
   ╰─────────────────╯
  `,
];

export function LoadingState({ phase, percentage = 0, className }: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [dots, setDots] = useState('');

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animate ASCII frame based on percentage
  useEffect(() => {
    const targetFrame = Math.floor((percentage / 100) * (ASCII_FRAMES.length - 1));
    setFrameIndex(targetFrame);
  }, [percentage]);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={clsx('flex flex-col items-center justify-center py-16', className)}>
      {/* ASCII Art Animation */}
      <pre className="text-terminal font-mono text-xs sm:text-sm leading-tight mb-8 select-none">
        {ASCII_FRAMES[frameIndex]}
      </pre>

      {/* Main loading indicator */}
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-void-100 rounded-full animate-pulse" />
        <div
          className="absolute inset-0 w-20 h-20 border-4 border-terminal rounded-full animate-spin"
          style={{
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-terminal font-mono text-lg font-bold">{percentage}%</span>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-gray-100 mb-2">
          <GlitchText text="ANALYZING TARGET" glitchIntensity="low" />
        </h2>
        <p className="text-terminal font-mono text-sm mb-4">
          {phase || LOADING_MESSAGES[messageIndex]}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-void-100 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-gradient-to-r from-terminal to-neon-cyan transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Terminal output simulation */}
        <div className="mt-8 text-left bg-void-50 rounded-lg border border-void-100 p-4 max-w-sm mx-auto">
          <div className="font-mono text-xs text-gray-500 space-y-1">
            <p><span className="text-terminal">[+]</span> Connection established</p>
            <p><span className="text-terminal">[+]</span> SSL/TLS verified</p>
            {percentage > 10 && <p><span className="text-neon-yellow">[*]</span> Scanning headers...</p>}
            {percentage > 30 && <p><span className="text-neon-yellow">[*]</span> Performance analysis...</p>}
            {percentage > 50 && <p><span className="text-neon-yellow">[*]</span> SEO evaluation...</p>}
            {percentage > 70 && <p><span className="text-neon-yellow">[*]</span> Accessibility check...</p>}
            {percentage > 85 && <p><span className="text-neon-cyan">[*]</span> Generating roast...</p>}
            <p className="animate-pulse">
              <span className="text-terminal">$</span>
              <span className="cursor-blink"> </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
