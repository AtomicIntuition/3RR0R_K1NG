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

  // Total checks = scans * checks per scan
  const totalChecks = stats.totalScans * stats.checksPerScan;

  // Inline variant - single line of text
  if (variant === 'inline') {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
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
          <span className="text-xl font-bold font-mono text-primary">
            {isLoading ? '...' : formatNumber(stats.totalScans)}
          </span>
          <span className="text-xs text-gray-500">audited</span>
        </div>
        <div className="w-px h-4 bg-gray-700" />
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-mono text-primary">{stats.checksPerScan}+</span>
          <span className="text-xs text-gray-500">checks/scan</span>
        </div>
        <div className="w-px h-4 bg-gray-700" />
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-mono text-success">{stats.accuracy}%</span>
          <span className="text-xs text-gray-500">accuracy</span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`grid grid-cols-3 gap-4 sm:gap-8 text-center ${className}`}>
      <div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-primary">
          {isLoading ? (
            <span className="animate-pulse">---</span>
          ) : (
            formatNumber(stats.totalScans)
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">Sites Audited</div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-primary">
          {isLoading ? (
            <span className="animate-pulse">---</span>
          ) : (
            formatNumber(totalChecks)
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">Checks Run</div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-success">{stats.checksPerScan}+</div>
        <div className="text-xs text-gray-500 mt-1">Checks Per Scan</div>
      </div>
    </div>
  );
}
