'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TerminalLine {
  text: string;
  type: 'command' | 'info' | 'warning' | 'error' | 'success' | 'header' | 'score' | 'bar' | 'roast' | 'fix';
  delay: number;
}

const demoLines: TerminalLine[] = [
  { text: '$ npx error-king https://example.com', type: 'command', delay: 0 },
  { text: '', type: 'info', delay: 600 },
  { text: '  Scanning: https://example.com', type: 'info', delay: 800 },
  { text: '', type: 'info', delay: 1200 },
  { text: '  [■□□□□] Security audit...', type: 'info', delay: 1400 },
  { text: '  [■■□□□] Performance audit...', type: 'info', delay: 2000 },
  { text: '  [■■■□□] SEO audit...', type: 'info', delay: 2600 },
  { text: '  [■■■■□] Accessibility audit...', type: 'info', delay: 3200 },
  { text: '  [■■■■■] Generating roast...', type: 'info', delay: 3800 },
  { text: '', type: 'info', delay: 4400 },
  { text: '  ┌─────────────────────────────────────────┐', type: 'score', delay: 4600 },
  { text: '  │  SCORE:  54  │  GRADE: D         │', type: 'score', delay: 4800 },
  { text: '  └─────────────────────────────────────────┘', type: 'score', delay: 5000 },
  { text: '', type: 'info', delay: 5200 },
  { text: '  BREAKDOWN', type: 'header', delay: 5400 },
  { text: '', type: 'info', delay: 5500 },
  { text: '  Security       ██████████░░░░░░░░░░  52', type: 'error', delay: 5600 },
  { text: '  Performance    ████████░░░░░░░░░░░░  41', type: 'error', delay: 5800 },
  { text: '  SEO            ██████████████░░░░░░  72', type: 'warning', delay: 6000 },
  { text: '  Accessibility  ████████████░░░░░░░░  58', type: 'warning', delay: 6200 },
  { text: '  Code Quality   ██████████████████░░  89', type: 'success', delay: 6400 },
  { text: '', type: 'info', delay: 6600 },
  { text: '  THE ROAST', type: 'header', delay: 6800 },
  { text: '', type: 'info', delay: 6900 },
  { text: '  💀 Another day, another site begging to be hacked', type: 'roast', delay: 7000 },
  { text: '', type: 'info', delay: 7400 },
  { text: '  TOP FIXES', type: 'header', delay: 7600 },
  { text: '', type: 'info', delay: 7700 },
  { text: '  1. [HIGH] Add Content-Security-Policy header', type: 'fix', delay: 7800 },
  { text: '  2. [HIGH] Optimize Largest Contentful Paint', type: 'fix', delay: 8000 },
  { text: '  3. [MEDIUM] Add missing alt text to 8 images', type: 'fix', delay: 8200 },
  { text: '', type: 'info', delay: 8400 },
  { text: '  ─────────────────────────────────────────────', type: 'info', delay: 8600 },
  { text: '  Full report: https://3rrork1ng.com/scan/abc123', type: 'success', delay: 8800 },
];

const typeColors: Record<string, string> = {
  command: 'text-gray-200',
  info: 'text-gray-500',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  success: 'text-terminal',
  header: 'text-gray-300 font-semibold',
  score: 'text-neon-cyan font-bold',
  roast: 'text-gray-300 italic',
  fix: 'text-gray-400',
};

export function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const timeouts: NodeJS.Timeout[] = [];

    demoLines.forEach((line, index) => {
      const timeout = setTimeout(() => {
        setVisibleLines(index + 1);
      }, line.delay);
      timeouts.push(timeout);
    });

    // Reset and loop after showing complete
    const resetTimeout = setTimeout(() => {
      setVisibleLines(0);
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 1000);
    }, 14000);
    timeouts.push(resetTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, [isVisible]);

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-[#0d0d0d] border border-void-100 rounded-xl overflow-hidden shadow-2xl shadow-terminal/10"
      >
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-void-100">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-gray-500 ml-3 font-mono">terminal — 3rror_k1ng</span>
        </div>

        {/* Terminal content */}
        <div className="p-5 font-mono text-[13px] h-[420px] overflow-hidden leading-relaxed">
          <div className="space-y-0.5">
            {demoLines.slice(0, visibleLines).map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className={`${typeColors[line.type]} whitespace-pre`}
              >
                {line.text}
              </motion.div>
            ))}
            {visibleLines > 0 && visibleLines < demoLines.length && (
              <span className="inline-block w-2 h-4 bg-terminal animate-pulse ml-1" />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
