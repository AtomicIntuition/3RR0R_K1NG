'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { Chart } from '@/components/Chart';
import { DataTable } from '@/components/DataTable';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  tier: string;
  scan_credits: number;
  created_at: string;
  scanCount: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [growth, setGrowth] = useState<Array<{ name: string; users: number }>>([]);
  const [tierBreakdown, setTierBreakdown] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, statsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/stats'),
        ]);

        const [usersData, statsData] = await Promise.all([
          usersRes.json(),
          statsRes.json(),
        ]);

        setUsers(usersData.users || []);
        setGrowth(usersData.growth || []);
        setTierBreakdown(usersData.tierBreakdown || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (value: unknown) => (
        <span className="font-medium text-white">{String(value)}</span>
      ),
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (value: unknown) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value === 'pro'
              ? 'bg-neon-purple/20 text-neon-purple'
              : 'bg-void-100 text-gray-400'
          }`}
        >
          {String(value).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'scanCount',
      label: 'Scans',
      render: (value: unknown) => (
        <span className="text-terminal font-bold">{String(value)}</span>
      ),
    },
    {
      key: 'scan_credits',
      label: 'Credits',
    },
    {
      key: 'created_at',
      label: 'Joined',
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
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  const proUsers = users.filter((u) => u.tier === 'pro').length;
  const freeUsers = users.filter((u) => u.tier === 'free').length;
  const avgScansPerUser = users.length > 0
    ? (users.reduce((sum, u) => sum + u.scanCount, 0) / users.length).toFixed(1)
    : '0';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="text-gray-500 mt-1">User analytics and breakdown</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={users.length}
          icon="👥"
          color="cyan"
        />
        <MetricCard
          title="Pro Users"
          value={proUsers}
          icon="⭐"
          color="purple"
        />
        <MetricCard
          title="Free Users"
          value={freeUsers}
          icon="👤"
          color="green"
        />
        <MetricCard
          title="Avg Scans/User"
          value={avgScansPerUser}
          icon="📊"
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Chart
            title="User Growth (30 days)"
            data={growth}
            type="area"
            dataKey="users"
            xAxisKey="name"
            color="#22d3ee"
            height={300}
          />
        </div>
        <Chart
          title="Tier Breakdown"
          data={tierBreakdown}
          type="pie"
          dataKey="value"
          xAxisKey="name"
          height={300}
        />
      </div>

      {/* User Table */}
      <DataTable
        title="Recent Users"
        columns={columns}
        data={users}
      />
    </div>
  );
}
