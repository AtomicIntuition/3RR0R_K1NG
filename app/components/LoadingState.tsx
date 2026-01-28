'use client';

import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { GlitchText } from './GlitchText';

interface LoadingStateProps {
  phase?: string;
  percentage?: number;
  completedAudits?: string[];
  currentPhase?: string;
  className?: string;
}

interface TerminalLine {
  text: string;
  type: 'command' | 'info' | 'success' | 'warning' | 'error' | 'progress';
  timestamp?: string;
}

// Map phase names to CLI-style descriptions
const PHASE_CLI_INFO: Record<string, { start: string; detail: string }> = {
  security: {
    start: 'Running security audit...',
    detail: 'Checking headers, HTTPS, CSP, HSTS, XSS protection',
  },
  seo: {
    start: 'Running SEO audit...',
    detail: 'Analyzing meta tags, OpenGraph, structured data',
  },
  accessibility: {
    start: 'Running accessibility audit...',
    detail: 'Testing WCAG 2.1 compliance with axe-core',
  },
  code_quality: {
    start: 'Running code quality audit...',
    detail: 'Checking console errors, deprecated APIs, bundle size',
  },
  tech_stack: {
    start: 'Detecting tech stack...',
    detail: 'Identifying frameworks, libraries, CDNs',
  },
  resources: {
    start: 'Analyzing resources...',
    detail: 'Auditing network waterfall, asset optimization',
  },
  extended_audits: {
    start: 'Running deep scan...',
    detail: 'Extended security and performance checks',
  },
  performance: {
    start: 'Running Lighthouse audit...',
    detail: 'Measuring Core Web Vitals, LCP, FID, CLS',
  },
  roast: {
    start: 'Generating AI roast...',
    detail: 'Claude is judging your website...',
  },
};

const AUDIT_ICONS: Record<string, string> = {
  'Security': '🛡️',
  'SEO': '🔍',
  'Accessibility': '♿',
  'Code Quality': '🧹',
  'Tech Stack': '⚙️',
  'Resources': '📊',
  'Deep Scan': '🔬',
  'Performance': '⚡',
};

const ALL_AUDITS = ['Security', 'SEO', 'Accessibility', 'Code Quality', 'Tech Stack', 'Resources', 'Deep Scan', 'Performance'];

const DISPLAY_TO_PHASE: Record<string, string> = {
  'Security': 'security',
  'SEO': 'seo',
  'Accessibility': 'accessibility',
  'Code Quality': 'code_quality',
  'Tech Stack': 'tech_stack',
  'Resources': 'resources',
  'Deep Scan': 'extended_audits',
  'Performance': 'performance',
};

function getTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function LoadingState({ phase, percentage = 0, completedAudits = [], currentPhase = '', className }: LoadingStateProps) {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [lastPhase, setLastPhase] = useState<string>('');
  const [lastCompleted, setLastCompleted] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Initialize terminal
  useEffect(() => {
    setTerminalLines([
      { text: '$ 3rror scan --verbose', type: 'command', timestamp: getTimestamp() },
      { text: 'Initializing scan engine...', type: 'info', timestamp: getTimestamp() },
    ]);
  }, []);

  // Track phase changes and add real terminal output
  useEffect(() => {
    if (currentPhase && currentPhase !== lastPhase && currentPhase !== 'pending') {
      const phaseInfo = PHASE_CLI_INFO[currentPhase];
      if (phaseInfo) {
        setTerminalLines(prev => [
          ...prev,
          { text: '', type: 'info' },
          { text: phaseInfo.start, type: 'progress', timestamp: getTimestamp() },
          { text: `  └─ ${phaseInfo.detail}`, type: 'info' },
        ]);
      }
      setLastPhase(currentPhase);
    }
  }, [currentPhase, lastPhase]);

  // Track completed audits
  useEffect(() => {
    const newCompleted = completedAudits.filter(a => !lastCompleted.includes(a));
    if (newCompleted.length > 0) {
      const newLines: TerminalLine[] = newCompleted.map(audit => ({
        text: `✓ ${audit} audit complete`,
        type: 'success' as const,
        timestamp: getTimestamp(),
      }));
      setTerminalLines(prev => [...prev, ...newLines]);
      setLastCompleted(completedAudits);
    }
  }, [completedAudits, lastCompleted]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Calculate ring properties
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const isCurrentAudit = (auditName: string): boolean => {
    const phaseKey = DISPLAY_TO_PHASE[auditName];
    return phaseKey === currentPhase;
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center py-6 sm:py-10 w-full max-w-2xl mx-auto', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-1">
          <GlitchText text="SCANNING" glitchIntensity="low" />
        </h2>
        <p className="text-terminal font-mono text-xs sm:text-sm">{phase}</p>
      </motion.div>

      {/* Main Terminal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full mb-6"
      >
        <div className="bg-[#0a0a0a] rounded-xl border border-void-100 overflow-hidden shadow-2xl">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#151515] border-b border-void-100">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs text-gray-500 font-mono">3rror_k1ng — scan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-terminal">{percentage}%</span>
              <div className="w-20 h-1.5 bg-void-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-terminal"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Terminal content */}
          <div
            ref={terminalRef}
            className="p-4 font-mono text-xs sm:text-sm h-48 sm:h-56 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-void-100"
          >
            <div className="space-y-0.5">
              {terminalLines.map((line, i) => (
                <div
                  key={i}
                  className={clsx(
                    'flex gap-2',
                    line.type === 'command' && 'text-gray-300',
                    line.type === 'info' && 'text-gray-500',
                    line.type === 'success' && 'text-terminal',
                    line.type === 'warning' && 'text-neon-yellow',
                    line.type === 'error' && 'text-danger',
                    line.type === 'progress' && 'text-neon-cyan',
                  )}
                >
                  {line.timestamp && (
                    <span className="text-gray-600 flex-shrink-0">[{line.timestamp}]</span>
                  )}
                  <span className="whitespace-pre-wrap">{line.text}</span>
                </div>
              ))}

              {/* Current activity indicator */}
              {currentPhase && currentPhase !== 'complete' && (
                <div className="flex gap-2 text-neon-cyan">
                  <span className="text-gray-600">[{getTimestamp()}]</span>
                  <span className="flex items-center gap-1">
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ●
                    </motion.span>
                    <span>Processing...</span>
                  </span>
                </div>
              )}

              {/* Cursor */}
              <div className="flex items-center gap-1 text-gray-400 mt-1">
                <span className="text-terminal">$</span>
                <motion.span
                  className="w-2 h-4 bg-terminal"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compact Audit Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
          {ALL_AUDITS.map((audit) => {
            const isComplete = completedAudits.includes(audit);
            const isCurrent = isCurrentAudit(audit);

            return (
              <div
                key={audit}
                className={clsx(
                  'flex flex-col items-center p-2 rounded-lg border transition-all duration-300',
                  isComplete && 'bg-terminal/10 border-terminal/40',
                  isCurrent && 'bg-neon-cyan/10 border-neon-cyan/40',
                  !isComplete && !isCurrent && 'bg-void-50/30 border-void-100/50 opacity-40'
                )}
              >
                <span className="text-lg sm:text-xl">{AUDIT_ICONS[audit]}</span>
                <span className={clsx(
                  'text-[8px] sm:text-[10px] font-medium text-center leading-tight mt-0.5',
                  isComplete && 'text-terminal',
                  isCurrent && 'text-neon-cyan',
                  !isComplete && !isCurrent && 'text-gray-600'
                )}>
                  {audit.split(' ')[0]}
                </span>
                {isComplete && <span className="text-terminal text-[10px]">✓</span>}
                {isCurrent && (
                  <motion.span
                    className="text-neon-cyan text-[10px]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    ●
                  </motion.span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Circular Progress - Compact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex items-center justify-center gap-4"
      >
        <div className="relative">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-void-100"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="url(#scanGradient)"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00FF41" />
                <stop offset="100%" stopColor="#00E5FF" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-terminal font-mono text-sm font-bold">{percentage}%</span>
          </div>
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="text-sm font-bold text-gray-200">{completedAudits.length} / 8 audits</p>
        </div>
      </motion.div>
    </div>
  );
}
