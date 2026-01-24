'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';

interface Scan {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  score_overall: number | null;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Fetch user's scans
      supabase
        .from('scans')
        .select('id, url, status, score_overall, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
        .then(({ data, error }) => {
          if (!error && data) {
            setScans(data);
          }
          setLoadingScans(false);
        });
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-terminal">Loading...</div>
      </div>
    );
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 80) return 'text-terminal';
    if (score >= 60) return 'text-neon-yellow';
    if (score >= 40) return 'text-neon-orange';
    return 'text-danger';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-gray-500/20 text-gray-400',
      processing: 'bg-neon-yellow/20 text-neon-yellow',
      completed: 'bg-terminal/20 text-terminal',
      failed: 'bg-danger/20 text-danger',
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Welcome back, {user?.email}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-void-50 rounded-lg border border-void-100 p-6">
              <div className="text-3xl font-bold text-terminal">
                {scans.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-400">Completed Scans</div>
            </div>

            <div className="bg-void-50 rounded-lg border border-void-100 p-6">
              <div className="text-3xl font-bold text-neon-cyan">
                {profile?.tier === 'pro' ? 'Pro' : profile?.tier === 'free' ? 'Free' : 'Anonymous'}
              </div>
              <div className="text-sm text-gray-400">Current Plan</div>
            </div>

            <div className="bg-void-50 rounded-lg border border-void-100 p-6">
              <div className="text-3xl font-bold text-gray-100">
                {scans.length > 0 && scans[0].score_overall !== null
                  ? `${scans[0].score_overall}/100`
                  : '-'}
              </div>
              <div className="text-sm text-gray-400">Last Scan Score</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link
              href="/"
              className="px-6 py-3 bg-terminal text-void font-bold rounded-lg hover:bg-terminal-bright transition-colors"
            >
              New Scan
            </Link>

            {profile?.tier !== 'pro' && (
              <Link
                href="/pricing"
                className="px-6 py-3 border border-neon-cyan text-neon-cyan font-bold rounded-lg hover:bg-neon-cyan/10 transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>

          {/* Recent Scans */}
          <div className="bg-void-50 rounded-lg border border-void-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-void-100">
              <h2 className="text-xl font-bold text-gray-100">Recent Scans</h2>
            </div>

            {loadingScans ? (
              <div className="p-8 text-center text-gray-500">Loading scans...</div>
            ) : scans.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No scans yet</p>
                <Link
                  href="/"
                  className="text-terminal hover:text-terminal-bright transition-colors"
                >
                  Run your first scan
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-void-100">
                {scans.map((scan) => (
                  <Link
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-void-100/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 truncate">{scan.url}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(scan.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(scan.status)}`}>
                        {scan.status}
                      </span>

                      {scan.status === 'completed' && scan.score_overall !== null && (
                        <span className={`text-2xl font-bold ${getScoreColor(scan.score_overall)}`}>
                          {scan.score_overall}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
