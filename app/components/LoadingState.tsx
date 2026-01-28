'use client';

import { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { GlitchText } from './GlitchText';

interface LoadingStateProps {
  phase?: string;
  percentage?: number;
  completedAudits?: string[];
  currentPhase?: string;
  className?: string;
}

const AUDIT_CONFIG: Record<string, { icon: string; color: string }> = {
  'Security': { icon: '🛡️', color: 'terminal' },
  'SEO': { icon: '🔍', color: 'neon-cyan' },
  'Accessibility': { icon: '♿', color: 'neon-purple' },
  'Code Quality': { icon: '🧹', color: 'neon-yellow' },
  'Tech Stack': { icon: '⚙️', color: 'gray-400' },
  'Resources': { icon: '📊', color: 'neon-orange' },
  'Deep Scan': { icon: '🔬', color: 'neon-cyan' },
  'Performance': { icon: '⚡', color: 'terminal' },
};

// Ordered list for display - matches backend PHASE_ORDER
const ALL_AUDITS = ['Security', 'SEO', 'Accessibility', 'Code Quality', 'Tech Stack', 'Resources', 'Deep Scan', 'Performance'];

// Map display names back to internal phase names for current detection
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

// Terminal messages that cycle through
const TERMINAL_MESSAGES = [
  'Initializing scan engine...',
  'Establishing secure connection...',
  'Analyzing response headers...',
  'Checking SSL certificate...',
  'Parsing DOM structure...',
  'Evaluating JavaScript bundles...',
  'Running lighthouse audits...',
  'Checking WCAG compliance...',
  'Analyzing meta tags...',
  'Inspecting network requests...',
  'Calculating performance metrics...',
  'Generating AI insights...',
];

export function LoadingState({ phase, percentage = 0, completedAudits = [], currentPhase = '', className }: LoadingStateProps) {
  const [dots, setDots] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>(['$ 3rror scan --verbose']);
  const [messageIndex, setMessageIndex] = useState(0);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Add terminal lines progressively
  useEffect(() => {
    if (messageIndex >= TERMINAL_MESSAGES.length) return;

    const timeout = setTimeout(() => {
      setTerminalLines(prev => [...prev.slice(-8), `[+] ${TERMINAL_MESSAGES[messageIndex]}`]);
      setMessageIndex(prev => prev + 1);
    }, 1500 + Math.random() * 1000);

    return () => clearTimeout(timeout);
  }, [messageIndex]);

  // Add completed audit messages
  useEffect(() => {
    if (completedAudits.length > 0) {
      const latestAudit = completedAudits[completedAudits.length - 1];
      setTerminalLines(prev => {
        if (prev.some(line => line.includes(`${latestAudit} audit`))) return prev;
        return [...prev.slice(-8), `[✓] ${latestAudit} audit complete`];
      });
    }
  }, [completedAudits]);

  // Helper to check if an audit is the current one
  const isCurrentAudit = (auditName: string): boolean => {
    const phaseKey = DISPLAY_TO_PHASE[auditName];
    return phaseKey === currentPhase;
  };

  // Calculate ring properties
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Memoize audit items to prevent unnecessary re-renders
  const auditItems = useMemo(() => ALL_AUDITS.map((audit) => ({
    name: audit,
    config: AUDIT_CONFIG[audit],
    isComplete: completedAudits.includes(audit),
    isCurrent: isCurrentAudit(audit),
  })), [completedAudits, currentPhase]);

  return (
    <div className={clsx('flex flex-col items-center justify-center py-8 sm:py-12', className)}>
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-terminal/5 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8 relative z-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
          <GlitchText text="SCANNING TARGET" glitchIntensity="low" />
        </h2>
        <p className="text-terminal font-mono text-sm sm:text-base">
          {phase}
          <span className="inline-block w-8 text-left">{dots}</span>
        </p>
      </motion.div>

      {/* Premium Circular Progress */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative mb-6 sm:mb-8"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-terminal/20 blur-xl animate-pulse"
             style={{ transform: 'scale(1.3)' }} />

        {/* Background ring with gradient */}
        <svg className="w-36 h-36 sm:w-44 sm:h-44 transform -rotate-90" viewBox="0 0 140 140">
          {/* Track */}
          <circle
            cx="70"
            cy="70"
            r="60"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-void-100"
          />

          {/* Animated gradient ring */}
          <circle
            cx="70"
            cy="70"
            r="60"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            strokeLinecap="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FF41" />
              <stop offset="50%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#00FF41" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={percentage}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-terminal font-mono text-3xl sm:text-4xl font-bold"
            style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
          >
            {percentage}%
          </motion.span>
          <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Complete</span>
        </div>
      </motion.div>

      {/* Audit Progress Grid - Premium Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-lg px-3 sm:px-4"
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <AnimatePresence>
            {auditItems.map((audit, index) => (
              <motion.div
                key={audit.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className={clsx(
                  'relative flex flex-col items-center p-2 sm:p-3 rounded-xl border transition-all duration-500 overflow-hidden group',
                  audit.isComplete && 'bg-terminal/10 border-terminal/50 shadow-lg shadow-terminal/10',
                  audit.isCurrent && 'bg-neon-cyan/10 border-neon-cyan/50',
                  !audit.isComplete && !audit.isCurrent && 'bg-void-50/50 border-void-100 opacity-40'
                )}
              >
                {/* Glow effect for current/complete */}
                {(audit.isComplete || audit.isCurrent) && (
                  <div className={clsx(
                    'absolute inset-0 opacity-20 blur-xl',
                    audit.isComplete && 'bg-terminal',
                    audit.isCurrent && 'bg-neon-cyan animate-pulse'
                  )} />
                )}

                <span className="text-xl sm:text-2xl mb-1 relative z-10 group-hover:scale-110 transition-transform">
                  {audit.config.icon}
                </span>
                <span className={clsx(
                  'text-[10px] sm:text-xs font-medium text-center relative z-10 leading-tight',
                  audit.isComplete && 'text-terminal',
                  audit.isCurrent && 'text-neon-cyan',
                  !audit.isComplete && !audit.isCurrent && 'text-gray-500'
                )}>
                  {audit.name}
                </span>

                {/* Status indicator */}
                <div className="h-4 mt-1 relative z-10">
                  {audit.isComplete && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-terminal text-xs"
                    >
                      ✓
                    </motion.span>
                  )}
                  {audit.isCurrent && (
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-neon-cyan"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Premium Terminal Output */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 sm:mt-8 w-full max-w-lg px-3 sm:px-4"
      >
        <div className="bg-[#0d0d0d] rounded-xl border border-void-100 overflow-hidden shadow-2xl shadow-terminal/5">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border-b border-void-100">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs text-gray-500 ml-2 font-mono">3rror_scan.log</span>
          </div>

          {/* Terminal content */}
          <div className="p-4 font-mono text-xs sm:text-sm h-36 overflow-hidden">
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {terminalLines.map((line, i) => (
                  <motion.p
                    key={`${line}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={clsx(
                      line.includes('[✓]') && 'text-terminal',
                      line.includes('[+]') && 'text-gray-400',
                      line.startsWith('$') && 'text-gray-300'
                    )}
                  >
                    {line}
                  </motion.p>
                ))}
              </AnimatePresence>
              <p className="text-neon-cyan animate-pulse">
                <span>[*]</span> {phase}
              </p>
              <p className="text-gray-500">
                <span className="text-terminal">$</span>
                <motion.span
                  className="inline-block w-2 h-4 bg-terminal ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tip/Info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-xs text-gray-500 text-center max-w-sm px-4"
      >
        Running 50+ checks across security, performance, SEO, and accessibility
      </motion.p>
    </div>
  );
}
