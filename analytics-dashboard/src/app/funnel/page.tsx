'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { FunnelChart } from '@/components/FunnelChart';
import { DataTable } from '@/components/DataTable';

interface FunnelData {
  funnel: Array<{
    name: string;
    value: number;
    conversionRate: number;
  }>;
  cohorts: Array<{
    week: string;
    signups: number;
    conversions: number;
    rate: string;
  }>;
  metrics: {
    anonScans: number;
    registeredScans: number;
    scanToSignupRate: string;
    signupToProRate: string;
  };
}

export default function FunnelPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/funnel');
        const funnelData = await res.json();
        setData(funnelData);
      } catch (error) {
        console.error('Failed to fetch funnel:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const cohortColumns = [
    {
      key: 'week',
      label: 'Week',
      render: (value: unknown) => (
        <span className="font-medium text-white">{String(value)}</span>
      ),
    },
    {
      key: 'signups',
      label: 'Signups',
      render: (value: unknown) => (
        <span className="text-neon-cyan font-bold">{String(value)}</span>
      ),
    },
    {
      key: 'conversions',
      label: 'Pro Conversions',
      render: (value: unknown) => (
        <span className="text-neon-purple font-bold">{String(value)}</span>
      ),
    },
    {
      key: 'rate',
      label: 'Conversion Rate',
      render: (value: unknown) => (
        <span className="text-terminal font-bold">{String(value)}%</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-terminal/30 border-t-terminal rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading funnel...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Conversion Funnel</h1>
        <p className="text-gray-500 mt-1">Track user journey from scan to paid</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Anonymous Scans"
          value={data?.metrics.anonScans || 0}
          icon="👻"
          color="cyan"
        />
        <MetricCard
          title="Registered Scans"
          value={data?.metrics.registeredScans || 0}
          icon="👤"
          color="green"
        />
        <MetricCard
          title="Scan → Signup Rate"
          value={`${data?.metrics.scanToSignupRate || 0}%`}
          icon="📈"
          color="purple"
        />
        <MetricCard
          title="Signup → Pro Rate"
          value={`${data?.metrics.signupToProRate || 0}%`}
          icon="⭐"
          color="yellow"
        />
      </div>

      {/* Funnel Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FunnelChart
          title="Conversion Funnel"
          steps={data?.funnel || []}
        />

        {/* Insights */}
        <div className="bg-void-50 border border-void-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-void-100 rounded-lg border-l-4 border-terminal">
              <p className="text-sm font-medium text-white mb-1">Anonymous to Registered</p>
              <p className="text-xs text-gray-400">
                {data?.metrics.scanToSignupRate}% of scanners create an account.
                {Number(data?.metrics.scanToSignupRate || 0) < 10
                  ? ' Consider adding more signup incentives.'
                  : ' Good conversion rate!'}
              </p>
            </div>

            <div className="p-4 bg-void-100 rounded-lg border-l-4 border-neon-purple">
              <p className="text-sm font-medium text-white mb-1">Registered to Pro</p>
              <p className="text-xs text-gray-400">
                {data?.metrics.signupToProRate}% of users upgrade to Pro.
                {Number(data?.metrics.signupToProRate || 0) < 5
                  ? ' Consider improving your paywall or pricing.'
                  : ' Healthy conversion rate!'}
              </p>
            </div>

            <div className="p-4 bg-void-100 rounded-lg border-l-4 border-neon-cyan">
              <p className="text-sm font-medium text-white mb-1">Anonymous Scans</p>
              <p className="text-xs text-gray-400">
                {data?.metrics.anonScans} anonymous scans represent potential users.
                These are your growth opportunity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Analysis */}
      <DataTable
        title="Weekly Cohort Analysis"
        columns={cohortColumns}
        data={data?.cohorts || []}
      />
    </div>
  );
}
