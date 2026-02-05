'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { MonitoredSites } from '@/components/MonitoredSites';
import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Activity, Crown, TrendingUp, Plus, ArrowUpRight,
  ChevronRight, X, Loader2, ClipboardList,
} from 'lucide-react';

/* ═══════════════════════════════════════════
   Types & constants
   ═══════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

const getScoreColor = (score: number | null) => {
  if (score === null) return 'text-gray-500';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getGradeBg = (grade: string | null) => {
  if (!grade) return 'bg-gray-800';
  switch (grade[0]) {
    case 'A': return 'bg-emerald-500';
    case 'B': return 'bg-blue-500';
    case 'C': return 'bg-amber-500';
    case 'D': return 'bg-orange-500';
    default: return 'bg-red-500';
  }
};

const STATUS_STYLE: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400',
  processing: 'bg-amber-500/10 text-amber-400',
  failed: 'bg-red-500/10 text-red-400',
  pending: 'bg-gray-800 text-gray-400',
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */

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

  const { filteredScans, visibleScans, hasMore, completedCount, failedCount, avgScore } =
    useMemo(() => {
      const completed = scans.filter((s) => s.status === 'completed');
      const failed = scans.filter((s) => s.status === 'failed');
      const filtered =
        filter === 'all' ? scans : filter === 'completed' ? completed : failed;
      const avg =
        completed.length > 0
          ? Math.round(
              completed.reduce((sum, s) => sum + (s.score_overall || 0), 0) /
                completed.length
            )
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

  /* ——— Loading state ——— */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  /* ——— Stats data ——— */
  const stats = [
    {
      label: 'Scans Completed',
      value: completedCount,
      icon: Activity,
      accent: 'text-emerald-400',
    },
    {
      label: 'Current Plan',
      value: profile?.tier === 'pro' ? 'Pro' : 'Free',
      icon: Crown,
      accent: profile?.tier === 'pro' ? 'text-amber-400' : 'text-gray-400',
    },
    {
      label: 'Average Score',
      value: avgScore !== null ? avgScore : '—',
      icon: TrendingUp,
      accent: getScoreColor(avgScore),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div className="animate-fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New Scan
            </Link>
            {profile?.tier !== 'pro' && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-900 transition-colors text-sm"
              >
                Upgrade
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="animate-fade-up bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">
                    {s.label}
                  </span>
                  <Icon className={clsx('w-4 h-4', s.accent)} />
                </div>
                <div className="flex items-end justify-between">
                  <div className={clsx('text-3xl font-semibold', s.accent)}>
                    {s.value}
                  </div>
                  {s.label === 'Current Plan' && profile?.tier !== 'pro' && (
                    <Link
                      href="/pricing"
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Upgrade
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
        {/* Monitored Sites */}
        <ScrollReveal>
          <MonitoredSites />
        </ScrollReveal>

        {/* Scan History */}
        <ScrollReveal>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-base font-semibold text-white">
                  Scan History
                </h2>

                {/* Filter tabs */}
                <div className="flex gap-1 bg-gray-950 rounded-lg p-1 border border-gray-800">
                  {(['all', 'completed', 'failed'] as FilterType[]).map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setFilter(f);
                          setVisibleCount(SCANS_PER_PAGE);
                        }}
                        className={clsx(
                          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                          filter === f
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-500 hover:text-gray-300'
                        )}
                      >
                        {f} (
                        {f === 'all'
                          ? scans.length
                          : f === 'completed'
                            ? completedCount
                            : failedCount}
                        )
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            {loadingScans ? (
              <div className="p-16 text-center">
                <Loader2 className="w-6 h-6 text-gray-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading scans...</p>
              </div>
            ) : filteredScans.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-white font-medium mb-1">
                  {filter === 'all'
                    ? 'No scans yet'
                    : `No ${filter} scans`}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Start scanning websites to see them here
                </p>
                {filter === 'all' && (
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Run your first scan
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div>
                  {visibleScans.map((scan) => (
                    <Link
                      key={scan.id}
                      href={`/scan/${scan.id}`}
                      className="flex items-center px-5 sm:px-6 py-4 hover:bg-gray-800/50 transition-colors group border-b border-gray-800/50 last:border-0"
                    >
                      {/* Grade badge */}
                      <div
                        className={clsx(
                          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-4',
                          scan.status === 'completed' && scan.letter_grade
                            ? getGradeBg(scan.letter_grade)
                            : 'bg-gray-800'
                        )}
                      >
                        {scan.status === 'completed' && scan.letter_grade ? (
                          <span className="text-sm font-bold text-white">
                            {scan.letter_grade}
                          </span>
                        ) : scan.status === 'processing' ? (
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        ) : scan.status === 'failed' ? (
                          <X className="w-4 h-4 text-red-400" />
                        ) : (
                          <span className="text-gray-600 text-sm">—</span>
                        )}
                      </div>

                      {/* URL & meta */}
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-gray-100 font-medium truncate group-hover:text-emerald-400 transition-colors text-sm">
                          {scan.url
                            .replace(/^https?:\/\//, '')
                            .replace(/\/$/, '')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded-md text-xs font-medium capitalize',
                              STATUS_STYLE[scan.status] || STATUS_STYLE.pending
                            )}
                          >
                            {scan.status}
                          </span>
                          <span className="text-xs text-gray-600">
                            {formatDate(scan.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      {scan.status === 'completed' &&
                        scan.score_overall !== null && (
                          <div className="hidden sm:block text-right mr-4">
                            <span
                              className={clsx(
                                'text-xl font-semibold tabular-nums',
                                getScoreColor(scan.score_overall)
                              )}
                            >
                              {scan.score_overall}
                            </span>
                            <p className="text-xs text-gray-600">score</p>
                          </div>
                        )}

                      {/* Arrow */}
                      <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="px-6 py-4 border-t border-gray-800 text-center">
                    <button
                      onClick={() =>
                        setVisibleCount((prev) => prev + SCANS_PER_PAGE)
                      }
                      className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Load more ({filteredScans.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
