'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  totalScans: number;
  checksPerScan: number;
  accuracy: number;
}

interface StatsProps {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export function Stats({ variant = 'default', className = '' }: StatsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalScans: 0,
    checksPerScan: 50,
    accuracy: 99,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalScans: data.totalScans || 0,
            checksPerScan: data.checksPerScan || 50,
            accuracy: 99,
          });
        }
      } catch {
        // Keep defaults
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Format number with K suffix
  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${Math.floor(num / 1000)}K+`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Inline variant - single line of text
  if (variant === 'inline') {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        <span className="text-primary font-semibold">
          {isLoading ? '...' : formatNumber(stats.totalScans)}
        </span>
        {' '}sites audited with{' '}
        <span className="text-primary font-semibold">{stats.checksPerScan}+</span>
        {' '}checks each
      </div>
    );
  }

  // Compact variant - smaller, horizontal
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-6 text-center ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            {isLoading ? '...' : formatNumber(stats.totalScans)}
          </span>
          <span className="text-xs text-gray-400">audited</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">{stats.checksPerScan}+</span>
          <span className="text-xs text-gray-400">checks</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-success">{stats.accuracy}%</span>
          <span className="text-xs text-gray-400">accuracy</span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-wrap justify-center gap-8 text-center ${className}`}>
      <div>
        <div className="text-3xl font-bold text-primary">
          {isLoading ? (
            <span className="animate-pulse">---</span>
          ) : (
            formatNumber(stats.totalScans)
          )}
        </div>
        <div className="text-xs text-gray-400">Sites Audited</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-primary">{stats.checksPerScan}+</div>
        <div className="text-xs text-gray-400">Security Checks</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-success">{stats.accuracy}%</div>
        <div className="text-xs text-gray-400">Accuracy Rate</div>
      </div>
    </div>
  );
}
