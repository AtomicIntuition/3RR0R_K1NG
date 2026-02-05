'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ScoreRing } from '@/components/ScoreRing';
import { getGrade, getScoreColor, getCategoryDisplayName } from '@/lib/scoring';
import type { Scan } from '@/types/scan';

interface TVDashboardProps {
  scans: Scan[];
  currentIndex: number;
  onSelectScan: () => void;
}

const CATEGORIES = ['performance', 'security', 'seo', 'accessibility', 'codeQuality'] as const;

function getCategoryScore(scan: Scan, cat: typeof CATEGORIES[number]): number | undefined {
  switch (cat) {
    case 'performance': return scan.scorePerformance;
    case 'security': return scan.scoreSecurity;
    case 'seo': return scan.scoreSeo;
    case 'accessibility': return scan.scoreAccessibility;
    case 'codeQuality': return scan.scoreCodeQuality;
  }
}

function stripUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function formatClock(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function parseSummary(body?: string): string {
  if (!body) return 'Audit complete';
  try {
    const parsed = JSON.parse(body);
    if (parsed.keyStrength) return parsed.keyStrength;
  } catch {
    // Not JSON — use as plain text
  }
  return body.split('\n')[0]?.slice(0, 120) ?? 'Audit complete';
}

// Slide component for a single scan
function ScanSlide({ scan }: { scan: Scan }) {
  const grade = getGrade(scan.scoreOverall ?? 0);
  const gradeColor = getScoreColor(scan.scoreOverall ?? 0);
  const summary = parseSummary(scan.analysisBody);

  return (
    <div className="flex flex-col items-center justify-center px-16 h-full">
      <h1 className="text-4xl font-bold font-display mb-2 text-gray-50 truncate max-w-[80vw]">
        {stripUrl(scan.url)}
      </h1>

      <div className={`text-xl font-bold px-4 py-1 rounded-full mb-8 ${gradeColor} bg-gray-900 border border-gray-800`}>
        {grade}
      </div>

      <ScoreRing score={scan.scoreOverall ?? 0} size="tv" animate={false} />

      <p className="text-xl text-gray-400 mt-8 max-w-2xl text-center leading-relaxed">
        {summary}
      </p>

      <div className="flex gap-8 mt-10">
        {CATEGORIES.map((cat) => {
          const score = getCategoryScore(scan, cat) ?? 0;
          const color = getScoreColor(score);
          return (
            <div key={cat} className="flex flex-col items-center gap-2 min-w-[120px]">
              <span className="text-sm text-gray-500 uppercase tracking-wider">
                {getCategoryDisplayName(cat)}
              </span>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-lg font-bold ${color}`}>{score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TVDashboard({ scans, currentIndex, onSelectScan }: TVDashboardProps) {
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [phase, setPhase] = useState<'visible' | 'fading-out' | 'fading-in'>('visible');
  const [clock, setClock] = useState(formatClock);
  const prevIndex = useRef(currentIndex);

  const scanCount = scans.length;

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => setClock(formatClock()), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Handle index change with crossfade
  useEffect(() => {
    if (currentIndex === prevIndex.current) return;
    prevIndex.current = currentIndex;

    // Start fade out
    setPhase('fading-out');

    const fadeOutTimer = setTimeout(() => {
      // Swap content while invisible
      setDisplayIndex(currentIndex);
      setPhase('fading-in');

      const fadeInTimer = setTimeout(() => {
        setPhase('visible');
      }, 600);

      return () => clearTimeout(fadeInTimer);
    }, 500);

    return () => clearTimeout(fadeOutTimer);
  }, [currentIndex]);

  // Listen for Enter key to open focus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSelectScan();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onSelectScan]);

  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-50">
        <h2 className="text-4xl font-bold font-display mb-4">No Scans Yet</h2>
        <p className="text-2xl text-gray-400">
          Run your first scan at <span className="text-primary">3rrork1ng.com</span>
        </p>
      </div>
    );
  }

  const scan = scans[displayIndex];
  if (!scan) return null;

  const opacity = phase === 'fading-out' ? 'opacity-0 scale-[0.97]'
    : phase === 'fading-in' ? 'opacity-0 scale-[1.03]'
    : 'opacity-100 scale-100';

  return (
    <div className="relative h-screen bg-gray-950 text-gray-50 overflow-hidden flex flex-col">
      {/* Main content with crossfade */}
      <div
        className={`flex-1 transition-all duration-500 ease-premium ${opacity}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <ScanSlide scan={scan} />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-display text-primary">Crisp</span>
        </div>

        {scanCount > 1 && (
          <div className="flex gap-2">
            {scans.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-gray-700 w-2'
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 text-gray-500">
          <span className="text-sm">{scanCount} site{scanCount !== 1 ? 's' : ''}</span>
          <span className="text-sm font-mono">{clock}</span>
        </div>
      </div>
    </div>
  );
}
