'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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

const getScoreColor = (score: number | null) => {
  if (score === null) return 'text-gray-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
};

const getGradeBg = (grade: string | null) => {
  if (!grade) return 'bg-gray-100';
  switch (grade[0]) {
    case 'A': return 'bg-gradient-to-br from-emerald-500 to-teal-600';
    case 'B': return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    case 'C': return 'bg-gradient-to-br from-amber-400 to-orange-500';
    case 'D': return 'bg-gradient-to-br from-orange-500 to-red-500';
    default: return 'bg-gradient-to-br from-red-500 to-rose-600';
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [visibleCount, setVisibleCount] = useState(SCANS_PER_PAGE);

  const fetchScans = useCallback(async (userId: string) => {
    setLoadingScans(true);
    const { data, error } = await supabase
      .from('scans')
      .select('id, url, status, score_overall, letter_grade, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setScans(data);
    }
    setLoadingScans(false);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchScans(user.id);
    }
  }, [user, fetchScans]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchScans(user.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, fetchScans]);

  const { filteredScans, visibleScans, hasMore, completedCount, failedCount, avgScore } = useMemo(() => {
    const completed = scans.filter(s => s.status === 'completed');
    const failed = scans.filter(s => s.status === 'failed');

    const filtered = filter === 'all' ? scans :
      filter === 'completed' ? completed :
        failed;

    const avg = completed.length > 0
      ? Math.round(completed.reduce((sum, s) => sum + (s.score_overall || 0), 0) / completed.length)
      : null;

    return {
      filteredScans: filtered,
      visibleScans: filtered.slice(0, visibleCount),
      hasMore: filtered.length > visibleCount,
      completedCount: completed.length,
      failedCount: failed.length,
      avgScore: avg,
    };
  }, [scans, filter, visibleCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Dashboard</h1>
              <p className="text-white/70">Welcome back, {user?.email?.split('@')[0]}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                New Scan
              </Link>
              {profile?.tier !== 'pro' && (
                <Link
                  href="/pricing"
                  className="px-6 py-3 bg-white/20 backdrop-blur text-white font-bold rounded-xl hover:bg-white/30 transition-all"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="text-3xl sm:text-4xl font-black text-white mb-1">{completedCount}</div>
              <div className="text-white/70 text-sm font-medium">Scans Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className={`text-3xl sm:text-4xl font-black mb-1 ${
                profile?.tier === 'pro' ? 'text-amber-300' : 'text-white'
              }`}>
                {profile?.tier === 'pro' ? 'Pro' : 'Free'}
              </div>
              <div className="text-white/70 text-sm font-medium">Current Plan</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className={`text-3xl sm:text-4xl font-black mb-1 ${
                avgScore !== null && avgScore >= 80 ? 'text-emerald-300' :
                avgScore !== null && avgScore >= 60 ? 'text-amber-300' :
                avgScore !== null ? 'text-red-300' : 'text-white/50'
              }`}>
                {avgScore !== null ? avgScore : '—'}
              </div>
              <div className="text-white/70 text-sm font-medium">Average Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Monitored Sites */}
        <div className="mb-8">
          <MonitoredSites />
        </div>

        {/* Scan History */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-black text-gray-900">Scan History</h2>

              {/* Filter Tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {(['all', 'completed', 'failed'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setVisibleCount(SCANS_PER_PAGE);
                    }}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                      filter === f
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {f} ({f === 'all' ? scans.length : f === 'completed' ? completedCount : failedCount})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          {loadingScans ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Loading scans...</p>
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-900 font-bold text-lg mb-2">
                {filter === 'all' ? 'No scans yet' : `No ${filter} scans`}
              </p>
              <p className="text-gray-500 mb-6">Start scanning websites to see them here</p>
              {filter === 'all' && (
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Run your first scan
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {visibleScans.map((scan) => (
                  <Link
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="flex items-center px-6 py-4 hover:bg-gray-50 transition-all group"
                  >
                    {/* Grade Badge */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                      scan.status === 'completed' && scan.letter_grade
                        ? getGradeBg(scan.letter_grade)
                        : 'bg-gray-100'
                    }`}>
                      {scan.status === 'completed' && scan.letter_grade ? (
                        <span className="text-lg font-black text-white">{scan.letter_grade}</span>
                      ) : scan.status === 'processing' ? (
                        <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      ) : scan.status === 'failed' ? (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <span className="text-gray-400 text-sm font-bold">—</span>
                      )}
                    </div>

                    {/* URL & Meta */}
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-gray-900 font-bold truncate group-hover:text-indigo-600 transition-colors">
                        {scan.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                          scan.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          scan.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                          scan.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {scan.status}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(scan.created_at)}</span>
                      </div>
                    </div>

                    {/* Score */}
                    {scan.status === 'completed' && scan.score_overall !== null && (
                      <div className="hidden sm:block text-right mr-4">
                        <span className={`text-2xl font-black ${getScoreColor(scan.score_overall)}`}>
                          {scan.score_overall}
                        </span>
                        <p className="text-xs text-gray-400">score</p>
                      </div>
                    )}

                    {/* Arrow */}
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="px-6 py-4 border-t border-gray-100 text-center bg-gray-50">
                  <button
                    onClick={() => setVisibleCount(prev => prev + SCANS_PER_PAGE)}
                    className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
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
  );
}
