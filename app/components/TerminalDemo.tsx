'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TerminalLine {
  text: string;
  type: 'command' | 'info' | 'warning' | 'error' | 'success' | 'result';
  delay: number;
}

const demoLines: TerminalLine[] = [
  { text: '$ error-king scan https://example.com', type: 'command', delay: 0 },
  { text: '[*] Initializing scan...', type: 'info', delay: 800 },
  { text: '[*] Running security audit...', type: 'info', delay: 1400 },
  { text: '[!] Missing Content-Security-Policy header', type: 'warning', delay: 2000 },
  { text: '[!] Missing X-Frame-Options header', type: 'warning', delay: 2300 },
  { text: '[*] Running performance audit...', type: 'info', delay: 2800 },
  { text: '[X] LCP: 4.2s (poor - should be < 2.5s)', type: 'error', delay: 3400 },
  { text: '[*] Running SEO audit...', type: 'info', delay: 4000 },
  { text: '[+] Meta description found', type: 'success', delay: 4400 },
  { text: '[!] Missing Open Graph tags', type: 'warning', delay: 4700 },
  { text: '[*] Running accessibility audit...', type: 'info', delay: 5200 },
  { text: '[X] 12 images missing alt text', type: 'error', delay: 5800 },
  { text: '[*] Generating roast...', type: 'info', delay: 6400 },
  { text: '', type: 'info', delay: 7000 },
  { text: '═══════════════════════════════════════════', type: 'result', delay: 7200 },
  { text: '  SCORE: 54/100 (Grade: D)', type: 'result', delay: 7400 },
  { text: '═══════════════════════════════════════════', type: 'result', delay: 7600 },
  { text: '', type: 'info', delay: 7800 },
  { text: '[+] Report ready. 23 issues found.', type: 'success', delay: 8000 },
];

const typeColors: Record<string, string> = {
  command: 'text-gray-200',
  info: 'text-gray-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  success: 'text-terminal',
  result: 'text-neon-cyan font-bold',
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

    // Reset and loop
    const resetTimeout = setTimeout(() => {
      setVisibleLines(0);
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 500);
    }, 12000);
    timeouts.push(resetTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, [isVisible]);

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-void border border-void-100 rounded-lg overflow-hidden shadow-2xl shadow-terminal/5"
      >
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-void-50 border-b border-void-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-500 ml-2 font-mono">3rror_k1ng — zsh</span>
        </div>

        {/* Terminal content */}
        <div className="p-4 font-mono text-sm h-[320px] overflow-hidden">
          <div className="space-y-1">
            {demoLines.slice(0, visibleLines).map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={typeColors[line.type]}
              >
                {line.text}
              </motion.div>
            ))}
            {visibleLines > 0 && visibleLines < demoLines.length && (
              <span className="inline-block w-2 h-4 bg-terminal animate-pulse" />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
