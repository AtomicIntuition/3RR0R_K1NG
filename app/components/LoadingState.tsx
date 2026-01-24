'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { GlitchText } from './GlitchText';

interface LoadingStateProps {
  phase?: string;
  percentage?: number;
  completedAudits?: string[];
  className?: string;
}

const AUDIT_ICONS: Record<string, string> = {
  'Security': '🛡️',
  'SEO': '🔍',
  'Accessibility': '♿',
  'Code Quality': '🧹',
  'Tech Stack': '⚙️',
  'Performance': '⚡',
  'AI Roast': '🔥',
};

const ALL_AUDITS = ['Security', 'SEO', 'Accessibility', 'Code Quality', 'Tech Stack', 'Performance', 'AI Roast'];

export function LoadingState({ phase, percentage = 0, completedAudits = [], className }: LoadingStateProps) {
  const [dots, setDots] = useState('');
  const [pulseIndex, setPulseIndex] = useState(0);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation for current audit
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 3);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={clsx('flex flex-col items-center justify-center py-12', className)}>
      {/* Main Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          <GlitchText text="SCANNING TARGET" glitchIntensity="low" />
        </h2>
        <p className="text-terminal font-mono text-sm">
          {phase}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>
      </div>

      {/* Circular Progress */}
      <div className="relative mb-8">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-void-100"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={351.86}
            strokeDashoffset={351.86 - (351.86 * percentage) / 100}
            className="text-terminal transition-all duration-500 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-terminal font-mono text-2xl font-bold">{percentage}%</span>
        </div>
      </div>

      {/* Audit Progress Grid */}
      <div className="w-full max-w-md px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {ALL_AUDITS.slice(0, 4).map((audit) => {
            const isComplete = completedAudits.includes(audit);
            const isCurrent = !isComplete && completedAudits.length < ALL_AUDITS.indexOf(audit) + 1 &&
              completedAudits.length >= ALL_AUDITS.indexOf(audit);

            return (
              <div
                key={audit}
                className={clsx(
                  'flex flex-col items-center p-3 rounded-lg border transition-all duration-300',
                  isComplete && 'bg-terminal/10 border-terminal/50',
                  isCurrent && 'bg-neon-yellow/10 border-neon-yellow/50 animate-pulse',
                  !isComplete && !isCurrent && 'bg-void-50 border-void-100 opacity-50'
                )}
              >
                <span className="text-xl mb-1">{AUDIT_ICONS[audit]}</span>
                <span className={clsx(
                  'text-xs font-medium',
                  isComplete && 'text-terminal',
                  isCurrent && 'text-neon-yellow',
                  !isComplete && !isCurrent && 'text-gray-500'
                )}>
                  {audit}
                </span>
                {isComplete && <span className="text-terminal text-xs mt-1">✓</span>}
                {isCurrent && <span className="text-neon-yellow text-xs mt-1">{'•'.repeat(pulseIndex + 1)}</span>}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {ALL_AUDITS.slice(4).map((audit) => {
            const isComplete = completedAudits.includes(audit);
            const isCurrent = !isComplete && completedAudits.length < ALL_AUDITS.indexOf(audit) + 1 &&
              completedAudits.length >= ALL_AUDITS.indexOf(audit);

            return (
              <div
                key={audit}
                className={clsx(
                  'flex flex-col items-center p-3 rounded-lg border transition-all duration-300',
                  isComplete && 'bg-terminal/10 border-terminal/50',
                  isCurrent && 'bg-neon-yellow/10 border-neon-yellow/50 animate-pulse',
                  !isComplete && !isCurrent && 'bg-void-50 border-void-100 opacity-50'
                )}
              >
                <span className="text-xl mb-1">{AUDIT_ICONS[audit]}</span>
                <span className={clsx(
                  'text-xs font-medium',
                  isComplete && 'text-terminal',
                  isCurrent && 'text-neon-yellow',
                  !isComplete && !isCurrent && 'text-gray-500'
                )}>
                  {audit}
                </span>
                {isComplete && <span className="text-terminal text-xs mt-1">✓</span>}
                {isCurrent && <span className="text-neon-yellow text-xs mt-1">{'•'.repeat(pulseIndex + 1)}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Terminal Output */}
      <div className="mt-8 w-full max-w-md px-4">
        <div className="bg-void-50 rounded-lg border border-void-100 p-4 font-mono text-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-void-100">
            <span className="w-3 h-3 rounded-full bg-danger/80" />
            <span className="w-3 h-3 rounded-full bg-neon-yellow/80" />
            <span className="w-3 h-3 rounded-full bg-terminal/80" />
            <span className="text-gray-500 ml-2">3rror_scan.log</span>
          </div>
          <div className="space-y-1 text-gray-400 max-h-32 overflow-y-auto">
            <p><span className="text-terminal">[+]</span> Connection established</p>
            <p><span className="text-terminal">[+]</span> Target responded: 200 OK</p>
            {completedAudits.map((audit, i) => (
              <p key={i}>
                <span className="text-terminal">[✓]</span> {audit} audit complete
              </p>
            ))}
            <p className="text-neon-yellow animate-pulse">
              <span>[*]</span> {phase}
            </p>
            <p>
              <span className="text-terminal">$</span>
              <span className="cursor-blink ml-1">_</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
