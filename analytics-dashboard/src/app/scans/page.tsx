'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { Chart } from '@/components/Chart';
import { DataTable } from '@/components/DataTable';
import { formatDistanceToNow } from 'date-fns';

interface Scan {
  id: string;
  url: string;
  status: string;
  score_overall: number | null;
  letter_grade: string | null;
  created_at: string;
  user_id: string | null;
}

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [volume, setVolume] = useState<Array<{ name: string; scans: number }>>([]);
  const [scoreDistribution, setScoreDistribution] = useState<Array<{ name: string; value: number }>>([]);
  const [topDomains, setTopDomains] = useState<Array<{ domain: string; count: number }>>([]);
  const [averageScore, setAverageScore] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/scans');
        const data = await res.json();

        setScans(data.recentScans || []);
        setVolume(data.volume || []);
        setScoreDistribution(data.scoreDistribution || []);
        setTopDomains(data.topDomains || []);
        setAverageScore(data.averageScore || '0');
      } catch (error) {
        console.error('Failed to fetch scans:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const columns = [
    {
      key: 'url',
      label: 'URL',
      render: (value: unknown) => {
        let domain = String(value);
        try {
          domain = new URL(String(value)).hostname;
        } catch {
          // Keep original
        }
        return (
          <span className="font-medium text-white truncate max-w-[200px] block">
            {domain}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const colors: Record<string, string> = {
          completed: 'bg-terminal/20 text-terminal',
          failed: 'bg-danger/20 text-danger',
          pending: 'bg-neon-yellow/20 text-neon-yellow',
          processing: 'bg-neon-cyan/20 text-neon-cyan',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[String(value)] || 'bg-void-100 text-gray-400'}`}>
            {String(value).toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'score_overall',
      label: 'Score',
      render: (value: unknown) => {
        if (!value) return <span className="text-gray-600">-</span>;
        const score = Number(value);
        const color = score >= 80 ? 'text-terminal' : score >= 60 ? 'text-neon-yellow' : 'text-danger';
        return <span className={`font-bold ${color}`}>{score}</span>;
      },
    },
    {
      key: 'letter_grade',
      label: 'Grade',
      render: (value: unknown) => {
        if (!value) return <span className="text-gray-600">-</span>;
        const grade = String(value);
        const color = grade.startsWith('A') ? 'text-terminal' :
          grade.startsWith('B') ? 'text-neon-cyan' :
          grade.startsWith('C') ? 'text-neon-yellow' : 'text-danger';
        return <span className={`font-bold ${color}`}>{grade}</span>;
      },
    },
    {
      key: 'user_id',
      label: 'User',
      render: (value: unknown) => (
        <span className={value ? 'text-neon-cyan' : 'text-gray-600'}>
          {value ? 'Registered' : 'Anonymous'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Time',
      render: (value: unknown) => (
        <span className="text-gray-500">
          {formatDistanceToNow(new Date(String(value)), { addSuffix: true })}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-terminal/30 border-t-terminal rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading scans...</p>
        </div>
      </div>
    );
  }

  const completedScans = scans.filter((s) => s.status === 'completed').length;
  const failedScans = scans.filter((s) => s.status === 'failed').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Scans</h1>
        <p className="text-gray-500 mt-1">Scan analytics and history</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Scans"
          value={scans.length}
          icon="🔍"
          color="green"
        />
        <MetricCard
          title="Average Score"
          value={averageScore}
          icon="📊"
          color="cyan"
        />
        <MetricCard
          title="Completed"
          value={completedScans}
          icon="✓"
          color="green"
        />
        <MetricCard
          title="Failed"
          value={failedScans}
          icon="✕"
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Chart
            title="Scan Volume (30 days)"
            data={volume}
            type="area"
            dataKey="scans"
            xAxisKey="name"
            color="#00ff41"
            height={300}
          />
        </div>
        <Chart
          title="Score Distribution"
          data={scoreDistribution}
          type="bar"
          dataKey="value"
          xAxisKey="name"
          color="#22d3ee"
          height={300}
        />
      </div>

      {/* Top Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-void-50 border border-void-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Top Scanned Domains</h3>
          <div className="space-y-3">
            {topDomains.map((item, i) => (
              <div key={item.domain} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-void-100 flex items-center justify-center text-xs text-gray-500">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300 truncate max-w-[150px]">{item.domain}</span>
                </div>
                <span className="text-sm font-bold text-terminal">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <DataTable
            title="Recent Scans"
            columns={columns}
            data={scans.slice(0, 10)}
          />
        </div>
      </div>
    </div>
  );
}
