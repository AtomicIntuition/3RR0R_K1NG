'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { MonitoredSites } from '@/components/MonitoredSites';

interface Scan {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  score_overall: number | null;
  letter_grade: string | null;
  created_at: string;
}

type FilterType = 'all' | 'completed' | 'failed';
const SCANS_PER_PAGE = 10;

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [visibleCount, setVisibleCount] = useState(SCANS_PER_PAGE);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Fetch user's scans
      supabase
        .from('scans')
        .select('id, url, status, score_overall, letter_grade, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
        .then(({ data, error }) => {
          if (!error && data) {
            startTransition(() => {
              setScans(data);
            });
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

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-gray-500';
    switch (grade[0]) {
      case 'A': return 'text-terminal';
      case 'B': return 'text-neon-cyan';
      case 'C': return 'text-yellow-400';
      case 'D': return 'text-orange-400';
      default: return 'text-danger';
    }
  };

  // Filter scans based on selected filter
  const filteredScans = scans.filter(scan => {
    if (filter === 'all') return true;
    if (filter === 'completed') return scan.status === 'completed';
    if (filter === 'failed') return scan.status === 'failed';
    return true;
  });

  const visibleScans = filteredScans.slice(0, visibleCount);
  const hasMore = filteredScans.length > visibleCount;

  // Stats
  const completedScans = scans.filter(s => s.status === 'completed');
  const avgScore = completedScans.length > 0
    ? Math.round(completedScans.reduce((sum, s) => sum + (s.score_overall || 0), 0) / completedScans.length)
    : null;

  return (
    <div className="min-h-screen">
      <div className="pt-4 pb-12 px-3 sm:px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-400 mt-1 sm:mt-2 truncate">
              Welcome back, {user?.email}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-void-50 rounded-lg border border-void-100 p-3 sm:p-6">
              <div className="text-xl sm:text-3xl font-bold text-terminal">
                {scans.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-[10px] sm:text-sm text-gray-400">Completed</div>
            </div>

            <div className="bg-void-50 rounded-lg border border-void-100 p-3 sm:p-6">
              <div className="text-xl sm:text-3xl font-bold text-neon-cyan">
                {profile?.tier === 'pro' ? 'Pro' : profile?.tier === 'free' ? 'Free' : 'Anon'}
              </div>
              <div className="text-[10px] sm:text-sm text-gray-400">Plan</div>
            </div>

            <div className="bg-void-50 rounded-lg border border-void-100 p-3 sm:p-6">
              <div className="text-xl sm:text-3xl font-bold text-gray-100">
                {avgScore !== null ? avgScore : '-'}
              </div>
              <div className="text-[10px] sm:text-sm text-gray-400">Avg Score</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
            <Link
              href="/"
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-terminal text-void font-bold rounded-lg hover:bg-terminal-bright transition-colors"
            >
              New Scan
            </Link>

            {profile?.tier !== 'pro' && (
              <Link
                href="/pricing"
                className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-neon-cyan text-neon-cyan font-bold rounded-lg hover:bg-neon-cyan/10 transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>

          {/* Monitored Sites */}
          <div className="mb-6 sm:mb-8">
            <MonitoredSites />
          </div>

          {/* Scan History */}
          <div className="bg-void-50 rounded-lg border border-void-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-void-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-100">Scan History</h2>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-void rounded-lg p-1">
                  {(['all', 'completed', 'failed'] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => { setFilter(f); setVisibleCount(SCANS_PER_PAGE); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                        filter === f
                          ? 'bg-void-100 text-gray-100'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {f} {f === 'all' ? `(${scans.length})` : f === 'completed' ? `(${scans.filter(s => s.status === 'completed').length})` : `(${scans.filter(s => s.status === 'failed').length})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loadingScans ? (
              <div className="p-6 sm:p-8 text-center text-gray-500">Loading scans...</div>
            ) : filteredScans.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {filter === 'all' ? 'No scans yet' : `No ${filter} scans`}
                </p>
                {filter === 'all' && (
                  <Link
                    href="/"
                    className="text-terminal hover:text-terminal-bright transition-colors"
                  >
                    Run your first scan
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-void-100">
                  {visibleScans.map((scan) => (
                    <Link
                      key={scan.id}
                      href={`/scan/${scan.id}`}
                      className="flex items-center px-4 sm:px-6 py-3 sm:py-4 hover:bg-void-100/50 transition-colors gap-4"
                    >
                      {/* Grade Badge */}
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-void flex items-center justify-center">
                        {scan.status === 'completed' && scan.letter_grade ? (
                          <span className={`text-lg sm:text-xl font-bold ${getGradeColor(scan.letter_grade)}`}>
                            {scan.letter_grade}
                          </span>
                        ) : scan.status === 'processing' ? (
                          <span className="text-neon-yellow text-sm">...</span>
                        ) : scan.status === 'failed' ? (
                          <span className="text-danger text-lg">!</span>
                        ) : (
                          <span className="text-gray-500 text-sm">--</span>
                        )}
                      </div>

                      {/* URL & Meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-gray-200 truncate">{scan.url}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusBadge(scan.status)}`}>
                            {scan.status}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {new Date(scan.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      {scan.status === 'completed' && scan.score_overall !== null && (
                        <div className="text-right hidden sm:block">
                          <span className={`text-xl font-bold ${getScoreColor(scan.score_overall)}`}>
                            {scan.score_overall}
                          </span>
                          <p className="text-[10px] text-gray-500">score</p>
                        </div>
                      )}

                      {/* Arrow */}
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="px-4 sm:px-6 py-4 border-t border-void-100 text-center">
                    <button
                      onClick={() => setVisibleCount(prev => prev + SCANS_PER_PAGE)}
                      className="text-sm text-terminal hover:text-terminal-bright transition-colors"
                    >
                      Load more ({filteredScans.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
