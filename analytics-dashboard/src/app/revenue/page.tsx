'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { DataTable } from '@/components/DataTable';
import { formatDistanceToNow } from 'date-fns';

interface RevenueData {
  mrr: number;
  activeSubscriptions: number;
  totalRevenue30d: number;
  revenueThisMonth: number;
  planBreakdown: Record<string, number>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    status: string;
    created: number;
    email: string;
    description: string | null;
  }>;
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/revenue');
        if (!res.ok) throw new Error('Failed to fetch');
        const revenueData = await res.json();
        setData(revenueData);
      } catch (err) {
        console.error('Failed to fetch revenue:', err);
        setError('Failed to load revenue data. Check Stripe API key.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const columns = [
    {
      key: 'email',
      label: 'Customer',
      render: (value: unknown) => (
        <span className="font-medium text-white">{String(value)}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: unknown) => (
        <span className="font-bold text-terminal">
          ${(Number(value) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const colors: Record<string, string> = {
          succeeded: 'bg-terminal/20 text-terminal',
          pending: 'bg-neon-yellow/20 text-neon-yellow',
          failed: 'bg-danger/20 text-danger',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[String(value)] || 'bg-void-100 text-gray-400'}`}>
            {String(value).toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: unknown) => (
        <span className="text-gray-400 text-sm truncate max-w-[200px] block">
          {value ? String(value) : '-'}
        </span>
      ),
    },
    {
      key: 'created',
      label: 'Time',
      render: (value: unknown) => (
        <span className="text-gray-500">
          {formatDistanceToNow(new Date(Number(value) * 1000), { addSuffix: true })}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-terminal/30 border-t-terminal rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading revenue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <span className="text-4xl mb-4 block">💳</span>
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Revenue</h1>
        <p className="text-gray-500 mt-1">Stripe revenue and subscription metrics</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="MRR"
          value={`$${data?.mrr.toFixed(2) || '0'}`}
          icon="📈"
          color="green"
        />
        <MetricCard
          title="Active Subscriptions"
          value={data?.activeSubscriptions || 0}
          icon="🔄"
          color="cyan"
        />
        <MetricCard
          title="Revenue (30d)"
          value={`$${data?.totalRevenue30d.toFixed(2) || '0'}`}
          icon="💰"
          color="purple"
        />
        <MetricCard
          title="Revenue (This Month)"
          value={`$${data?.revenueThisMonth.toFixed(2) || '0'}`}
          icon="📅"
          color="yellow"
        />
      </div>

      {/* Plan Breakdown & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Breakdown */}
        <div className="bg-void-50 border border-void-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">Plan Breakdown</h3>
          {data?.planBreakdown && Object.keys(data.planBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(data.planBreakdown).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{plan}</span>
                  <span className="text-lg font-bold text-terminal">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active subscriptions</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <DataTable
            title="Recent Transactions"
            columns={columns}
            data={data?.recentTransactions || []}
          />
        </div>
      </div>
    </div>
  );
}
