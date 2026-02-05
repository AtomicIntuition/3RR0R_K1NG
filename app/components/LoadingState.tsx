'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingStateProps {
  phase?: string;
  percentage?: number;
  completedAudits?: string[];
  currentPhase?: string;
  url?: string;
  startedAt?: number;
  className?: string;
}

// Phase config mapping internal keys to display info + icons
const PHASE_CONFIG: Record<string, { displayName: string; icon: string }> = {
  security: { displayName: 'Security', icon: 'shield' },
  seo: { displayName: 'SEO', icon: 'search' },
  accessibility: { displayName: 'Accessibility', icon: 'users' },
  code_quality: { displayName: 'Code Quality', icon: 'code' },
  tech_stack: { displayName: 'Tech Stack', icon: 'cog' },
  resources: { displayName: 'Resources', icon: 'chart' },
  extended_audits: { displayName: 'Deep Scan', icon: 'flask' },
  performance: { displayName: 'Performance', icon: 'bolt' },
  roast: { displayName: 'AI Analysis', icon: 'sparkle' },
};

const PHASE_ORDER = [
  'security',
  'seo',
  'accessibility',
  'code_quality',
  'tech_stack',
  'resources',
  'extended_audits',
  'performance',
  'roast',
];

const DISPLAY_TO_PHASE: Record<string, string> = {
  'Security': 'security',
  'SEO': 'seo',
  'Accessibility': 'accessibility',
  'Code Quality': 'code_quality',
  'Tech Stack': 'tech_stack',
  'Resources': 'resources',
  'Deep Scan': 'extended_audits',
  'Performance': 'performance',
  'AI Analysis': 'roast',
};

// Pre-written terminal log lines per phase
const PHASE_LOGS: Record<string, string[]> = {
  security: [
    'Checking HTTP security headers...',
    'Analyzing CORS configuration...',
    'Testing Content-Security-Policy...',
    'Validating SSL/TLS certificate...',
    'Scanning for common vulnerabilities...',
  ],
  seo: [
    'Parsing meta tags and Open Graph data...',
    'Checking robots.txt and sitemap...',
    'Analyzing heading structure...',
    'Validating structured data (JSON-LD)...',
  ],
  accessibility: [
    'Running axe-core accessibility engine...',
    'Testing WCAG 2.1 AA compliance...',
    'Checking color contrast ratios...',
    'Validating ARIA attributes...',
    'Testing keyboard navigation...',
  ],
  code_quality: [
    'Analyzing HTML validation...',
    'Checking for deprecated APIs...',
    'Reviewing resource optimization...',
    'Scanning console errors...',
  ],
  tech_stack: [
    'Detecting frameworks and libraries...',
    'Identifying CMS and hosting...',
    'Analyzing JavaScript bundles...',
  ],
  resources: [
    'Mapping resource waterfall...',
    'Analyzing render-blocking resources...',
    'Checking image optimization...',
    'Measuring total page weight...',
  ],
  extended_audits: [
    'Running deep protocol analysis...',
    'Testing HTTP/2 and HTTP/3 support...',
    'Checking PWA compliance...',
    'Validating link integrity...',
    'Analyzing structured data schema...',
  ],
  performance: [
    'Launching Lighthouse audit...',
    'Measuring First Contentful Paint...',
    'Analyzing Largest Contentful Paint...',
    'Calculating Total Blocking Time...',
    'Measuring Cumulative Layout Shift...',
    'Computing Speed Index...',
  ],
  roast: [
    'Compiling audit results...',
    'Generating AI-powered analysis...',
    'Writing actionable recommendations...',
  ],
};

// Phase-aware fun facts
const PHASE_FACTS: Record<string, string[]> = {
  security: [
    'HTTPS adoption has grown from 40% to over 95% of web traffic since 2015.',
    'The average cost of a data breach is $4.45 million globally.',
    'Security headers like CSP can prevent 90% of XSS attacks.',
  ],
  seo: [
    'Pages in the top 3 Google results get 75% of all clicks.',
    '68% of all online experiences begin with a search engine.',
    'Title tags between 50-60 characters get the highest click-through rates.',
  ],
  accessibility: [
    'Over 1 billion people worldwide experience some form of disability.',
    'Accessible websites see 20% more engagement on average.',
    'WCAG compliance can reduce legal risk and improve SEO simultaneously.',
  ],
  performance: [
    'A 1-second delay in page load can reduce conversions by 7%.',
    '53% of mobile users leave a site that takes over 3 seconds to load.',
    'Google uses Core Web Vitals as a ranking signal for search results.',
  ],
  general: [
    'The average website loads 2.5MB of data \u2014 twice what it was 5 years ago.',
    'The first website ever created is still online at info.cern.ch.',
    'There are over 1.9 billion websites on the internet today.',
    'The average user forms an opinion about a website in just 0.05 seconds.',
  ],
};

// SVG icon components for phases
function PhaseIcon({ type, className }: { type: string; className?: string }) {
  const c = clsx('w-4 h-4', className);
  switch (type) {
    case 'shield':
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
    case 'search':
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
    case 'users':
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
    case 'code':
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>);
    case 'cog':
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
    case 'chart':
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>);
    case 'flask':
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>);
    case 'bolt':
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
    case 'sparkle':
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>);
    default:
      return (<svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
  }
}

// Animated checkmark SVG
function AnimatedCheck({ className }: { className?: string }) {
  return (
    <motion.svg
      className={clsx('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.path
        d="M5 13l4 4L19 7"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

export function LoadingState({
  phase,
  percentage = 0,
  completedAudits = [],
  currentPhase = '',
  url,
  startedAt,
  className,
}: LoadingStateProps) {
  // --- Elapsed timer ---
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // --- Smart progress interpolation ---
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const targetRef = useRef(percentage);
  const displayRef = useRef(0);

  useEffect(() => {
    targetRef.current = percentage;
  }, [percentage]);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      const target = targetRef.current;
      const current = displayRef.current;
      if (current < target) {
        displayRef.current = Math.min(current + Math.max((target - current) * 0.1, 0.1), target);
      } else if (target > 0 && current < target - 0.5) {
        displayRef.current = Math.min(current + 0.02, target);
      }
      setDisplayPercentage(Math.round(displayRef.current));
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // --- ETA calculation ---
  const eta = displayPercentage > 5 && elapsed > 3
    ? Math.max(0, Math.round((elapsed / (displayPercentage / 100)) - elapsed))
    : null;

  // --- Terminal log drip effect ---
  const [visibleLogs, setVisibleLogs] = useState<{ time: string; message: string }[]>([]);
  const shownPhasesRef = useRef<Set<string>>(new Set());
  const logContainerRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentPhase && currentPhase !== 'pending' && currentPhase !== 'complete' && !shownPhasesRef.current.has(currentPhase)) {
      shownPhasesRef.current.add(currentPhase);
      const logs = PHASE_LOGS[currentPhase] || [];
      const timeouts: ReturnType<typeof setTimeout>[] = [];
      logs.forEach((msg, i) => {
        const t = setTimeout(() => {
          setVisibleLogs(prev => [...prev, {
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            message: msg,
          }]);
        }, i * 1500);
        timeouts.push(t);
      });
      return () => timeouts.forEach(clearTimeout);
    }
  }, [currentPhase]);

  // Auto-scroll terminal (only within the terminal container, not the page)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  // --- Fun facts carousel ---
  const [factIndex, setFactIndex] = useState(0);
  const getFacts = useCallback(() => {
    const phaseFacts = currentPhase && PHASE_FACTS[currentPhase];
    if (phaseFacts) return phaseFacts;
    // combine general + all phase facts
    return [...PHASE_FACTS.general, ...PHASE_FACTS.security, ...PHASE_FACTS.performance, ...PHASE_FACTS.seo];
  }, [currentPhase]);

  const facts = getFacts();

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % facts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [facts.length]);

  // --- Phase state helpers ---
  const completedPhaseKeys = completedAudits.map(name => DISPLAY_TO_PHASE[name]).filter(Boolean);

  const getPhaseState = (phaseKey: string): 'completed' | 'active' | 'pending' => {
    if (completedPhaseKeys.includes(phaseKey)) return 'completed';
    if (phaseKey === currentPhase) return 'active';
    return 'pending';
  };

  // --- Parse URL ---
  let hostname = '';
  let protocol = 'HTTPS';
  if (url) {
    try {
      const u = new URL(url);
      hostname = u.hostname;
      protocol = u.protocol === 'https:' ? 'HTTPS' : 'HTTP';
    } catch {
      hostname = url;
    }
  }

  return (
    <div className={clsx('flex flex-col w-full max-w-5xl mx-auto gap-4', className)}>
      {/* === Target Card === */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          {/* Favicon */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
              {hostname ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                  alt=""
                  className="w-5 h-5"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : null}
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            {/* Live dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          {/* Domain + label */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Scanning Target</span>
            <span className="text-sm font-mono font-medium text-zinc-200 truncate">
              {hostname || 'Loading...'}
            </span>
          </div>

          {/* Protocol badge */}
          <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 rounded-lg border border-zinc-700">
            <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">{protocol}</span>
          </div>

          {/* Elapsed timer */}
          <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 rounded-lg border border-zinc-700">
            <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-mono font-semibold text-zinc-300">{formatTime(elapsed)}</span>
          </div>
        </div>
      </motion.div>

      {/* === Two-Panel Layout (Desktop) / Stacked (Mobile) === */}
      <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] gap-4">
        {/* --- Phase Timeline (left on desktop, horizontal scroll on mobile) --- */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Desktop: vertical list */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-2 mb-3">Audit Phases</div>
            <div className="flex flex-col gap-0.5">
              {PHASE_ORDER.map((phaseKey) => {
                const config = PHASE_CONFIG[phaseKey];
                const state = getPhaseState(phaseKey);
                return (
                  <div
                    key={phaseKey}
                    className={clsx(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-300',
                      state === 'active' && 'bg-zinc-800',
                      state === 'completed' && 'opacity-80',
                      state === 'pending' && 'opacity-40',
                    )}
                  >
                    {/* Status indicator */}
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {state === 'completed' ? (
                        <AnimatedCheck className="text-emerald-500" />
                      ) : state === 'active' ? (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                      ) : (
                        <PhaseIcon type={config.icon} className="text-zinc-600" />
                      )}
                    </div>
                    {/* Phase name */}
                    <span className={clsx(
                      'text-sm font-medium transition-colors duration-300',
                      state === 'completed' && 'text-emerald-500',
                      state === 'active' && 'text-zinc-50 font-semibold',
                      state === 'pending' && 'text-zinc-600',
                    )}>
                      {config.displayName}
                    </span>
                    {/* Active phase icon */}
                    {state === 'active' && (
                      <PhaseIcon type={config.icon} className="text-emerald-500 ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: horizontal scrolling pills */}
          <div className="md:hidden overflow-x-auto pb-1 -mx-1 px-1">
            <div className="flex gap-2 min-w-max">
              {PHASE_ORDER.map((phaseKey) => {
                const config = PHASE_CONFIG[phaseKey];
                const state = getPhaseState(phaseKey);
                return (
                  <div
                    key={phaseKey}
                    className={clsx(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-300 text-xs font-medium',
                      state === 'completed' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
                      state === 'active' && 'bg-zinc-800 border-emerald-500/40 text-zinc-50',
                      state === 'pending' && 'bg-zinc-900 border-zinc-800 text-zinc-600',
                    )}
                  >
                    {state === 'completed' ? (
                      <AnimatedCheck className="text-emerald-500 !w-3 !h-3" />
                    ) : state === 'active' ? (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    ) : (
                      <PhaseIcon type={config.icon} className="text-zinc-600 !w-3 !h-3" />
                    )}
                    <span>{config.displayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* --- Terminal Log Feed (right panel) --- */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col"
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-zinc-500 font-medium ml-2">Audit Log</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Live</span>
            </div>
          </div>

          {/* Log content */}
          <div ref={logContainerRef} className="p-4 font-mono text-sm min-h-[200px] max-h-[400px] overflow-y-auto flex flex-col gap-1">
            {visibleLogs.length === 0 && (
              <div className="text-zinc-600 text-xs">Waiting for audit to begin...</div>
            )}
            <AnimatePresence mode="popLayout">
              {visibleLogs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-2"
                >
                  <span className="text-zinc-600 flex-shrink-0">[{log.time}]</span>
                  <span className="text-emerald-500 flex-shrink-0">&gt;</span>
                  <span className="text-zinc-400">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={logEndRef} />
          </div>
        </motion.div>
      </div>

      {/* === Progress Bar === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-200">Progress</span>
            <span className="text-xs text-zinc-500">{phase}</span>
          </div>
          <div className="flex items-center gap-3">
            {eta !== null && eta > 0 && (
              <span className="text-xs text-zinc-500">~{eta}s remaining</span>
            )}
            <span className="text-sm font-bold text-emerald-500 tabular-nums">{displayPercentage}%</span>
          </div>
        </div>
        {/* Bar track */}
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${displayPercentage}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        {/* Completed count */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-zinc-500">{completedAudits.length} / {PHASE_ORDER.length} audits complete</span>
        </div>
      </motion.div>

      {/* === Fun Facts Carousel === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-start gap-2 px-4 py-2"
      >
        <svg className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-zinc-500 leading-relaxed"
          >
            {facts[factIndex % facts.length]}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
