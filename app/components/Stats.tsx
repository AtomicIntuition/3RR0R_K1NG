'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  totalScans: number;
  checksPerScan: number;
  brutality: number;
}

export function Stats() {
  const [stats, setStats] = useState<StatsData>({
    totalScans: 0,
    checksPerScan: 50,
    brutality: 100,
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
            brutality: 100,
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

  return (
    <div className="flex flex-wrap justify-center gap-8 text-center">
      <div>
        <div className="text-3xl font-bold text-terminal">
          {isLoading ? (
            <span className="animate-pulse">---</span>
          ) : (
            formatNumber(stats.totalScans)
          )}
        </div>
        <div className="text-xs text-gray-500">Sites Roasted</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-neon-cyan">{stats.checksPerScan}+</div>
        <div className="text-xs text-gray-500">Security Checks</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-neon-purple">{stats.brutality}%</div>
        <div className="text-xs text-gray-500">Brutal Honesty</div>
      </div>
    </div>
  );
}
