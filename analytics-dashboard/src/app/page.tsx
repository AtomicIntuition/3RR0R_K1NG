'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { Chart } from '@/components/Chart';
import { ActivityFeed } from '@/components/ActivityFeed';

interface Stats {
  users: {
    total: number;
    today: number;
    week: number;
    pro: number;
  };
  scans: {
    total: number;
    today: number;
    week: number;
    completed: number;
    failed: number;
    successRate: string;
    perUser: string;
  };
}

interface Activity {
  id: string;
  type: 'scan' | 'signup' | 'payment' | 'upgrade';
  title: string;
  description?: string;
  timestamp: string;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [scanVolume, setScanVolume] = useState<Array<{ name: string; scans: number }>>([]);
  const [userGrowth, setUserGrowth] = useState<Array<{ name: string; users: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes, scansRes, usersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/activity'),
        fetch('/api/scans'),
        fetch('/api/users'),
      ]);

      const [statsData, activityData, scansData, usersData] = await Promise.all([
        statsRes.json(),
        activityRes.json(),
        scansRes.json(),
        usersRes.json(),
      ]);

      setStats(statsData);
      setActivities(activityData.activities || []);
      setScanVolume(scansData.volume || []);
      setUserGrowth(usersData.growth || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-terminal/30 border-t-terminal rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Overview</h1>
          <p className="text-gray-500 mt-1">Real-time metrics for 3RROR_K1NG</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-xs text-gray-600">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-void-100 border border-void-200 rounded-lg text-sm text-gray-400 hover:text-white hover:border-terminal/50 transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={stats?.users.total.toLocaleString() || '0'}
          change={stats?.users.today ? Math.round((stats.users.today / (stats.users.total || 1)) * 100) : 0}
          changeLabel="new today"
          icon="👥"
          color="cyan"
        />
        <MetricCard
          title="Total Scans"
          value={stats?.scans.total.toLocaleString() || '0'}
          change={stats?.scans.today ? Math.round((stats.scans.today / (stats.scans.total || 1)) * 100) : 0}
          changeLabel="today"
          icon="🔍"
          color="green"
        />
        <MetricCard
          title="Pro Users"
          value={stats?.users.pro.toLocaleString() || '0'}
          icon="⭐"
          color="purple"
        />
        <MetricCard
          title="Success Rate"
          value={`${stats?.scans.successRate || 0}%`}
          icon="✓"
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Chart
          title="Scan Volume (30 days)"
          data={scanVolume}
          type="area"
          dataKey="scans"
          xAxisKey="name"
          color="#00ff41"
          height={250}
        />
        <Chart
          title="User Growth (30 days)"
          data={userGrowth}
          type="bar"
          dataKey="users"
          xAxisKey="name"
          color="#22d3ee"
          height={250}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities} />
        </div>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-void-50 border border-void-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Scans Today</span>
                <span className="text-lg font-bold text-terminal">{stats?.scans.today || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Scans This Week</span>
                <span className="text-lg font-bold text-neon-cyan">{stats?.scans.week || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Users This Week</span>
                <span className="text-lg font-bold text-neon-purple">{stats?.users.week || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Scans/User Avg</span>
                <span className="text-lg font-bold text-neon-yellow">{stats?.scans.perUser || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Failed Scans</span>
                <span className="text-lg font-bold text-danger">{stats?.scans.failed || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
