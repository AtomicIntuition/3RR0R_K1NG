'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { PRICING } from '@/lib/constants';
import { MonitoredSites } from '@/components/MonitoredSites';
import { Plus, ChevronRight, X, Loader2 } from 'lucide-react';

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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

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

  const { filteredScans, visibleScans, hasMore, completedCount, avgScore } =
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
        avgScore: avg,
      };
    }, [scans, filter, visibleCount]);

  const scansRemaining = useMemo(() => {
    if (!profile) return null;
    if (profile.tier === 'pro') {
      return PRICING.PRO_SCANS_PER_MONTH - profile.scans_this_month;
    }
    if (profile.scan_credits > 0) {
      return profile.scan_credits;
    }
    return PRICING.FREE_SCANS_PER_DAY - profile.scans_today;
  }, [profile]);

  /* ——— Loading state ——— */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const planLabel = profile?.tier === 'pro' ? 'Pro' : 'Free';

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 space-y-8">

        {/* ——— Page header ——— */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Scan
          </Link>
        </div>

        {/* ——— Overview strip ——— */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-gray-800 rounded-lg divide-x divide-y sm:divide-y-0 divide-gray-800">
          {/* Total scans */}
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">Total scans</p>
            <p className="text-lg font-semibold text-white tabular-nums">{completedCount}</p>
          </div>

          {/* Avg score */}
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">Avg. score</p>
            <p className={clsx('text-lg font-semibold tabular-nums', getScoreColor(avgScore))}>
              {avgScore !== null ? avgScore : '—'}
            </p>
          </div>

          {/* Plan */}
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">Plan</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-white">{planLabel}</p>
              {profile?.tier !== 'pro' && (
                <Link href="/pricing" className="text-xs text-gray-500 hover:text-white transition-colors">
                  Upgrade
                </Link>
              )}
            </div>
          </div>

          {/* Remaining */}
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">Remaining</p>
            <p className="text-lg font-semibold text-white tabular-nums">
              {scansRemaining !== null ? scansRemaining : '—'}
            </p>
          </div>
        </div>

        {/* ——— Scan history ——— */}
        <div>
          {/* Section header + filter tabs */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-400">Scan history</h2>
            <div className="flex gap-1">
              {(['all', 'completed', 'failed'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setVisibleCount(SCANS_PER_PAGE);
                  }}
                  className={clsx(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize',
                    filter === f
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table container */}
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            {/* Column headers (desktop) */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_100px] px-5 py-2 border-b border-gray-800 text-xs text-gray-500">
              <span>URL</span>
              <span>Status</span>
              <span className="text-right">Score</span>
              <span className="text-right">Time</span>
            </div>

            {loadingScans ? (
              <div className="p-16 text-center">
                <Loader2 className="w-5 h-5 text-gray-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading scans...</p>
              </div>
            ) : filteredScans.length === 0 ? (
              <div className="p-16 text-center">
                {filter === 'all' ? (
                  <>
                    <p className="text-white font-medium mb-1">No scans yet</p>
                    <p className="text-gray-500 text-sm mb-6">
                      Scan a URL to get your first audit report.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      New Scan
                    </Link>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">No {filter} scans</p>
                )}
              </div>
            ) : (
              <>
                <div>
                  {visibleScans.map((scan) => (
                    <Link
                      key={scan.id}
                      href={`/scan/${scan.id}`}
                      className="grid sm:grid-cols-[1fr_100px_80px_100px] items-center px-5 py-3 hover:bg-gray-900/80 transition-colors group border-b border-gray-800/50 last:border-0"
                    >
                      {/* Col 1: grade badge + URL */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={clsx(
                            'flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white',
                            scan.status === 'completed' && scan.letter_grade
                              ? getGradeBg(scan.letter_grade)
                              : 'bg-gray-800'
                          )}
                        >
                          {scan.status === 'completed' && scan.letter_grade ? (
                            scan.letter_grade
                          ) : scan.status === 'processing' ? (
                            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                          ) : scan.status === 'failed' ? (
                            <X className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-200 truncate group-hover:text-white transition-colors">
                          {scan.url.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
                        </span>
                      </div>

                      {/* Col 2: status pill */}
                      <div className="hidden sm:block">
                        <span
                          className={clsx(
                            'px-2 py-0.5 rounded-md text-xs font-medium capitalize',
                            STATUS_STYLE[scan.status] || STATUS_STYLE.pending
                          )}
                        >
                          {scan.status}
                        </span>
                      </div>

                      {/* Col 3: score (right-aligned) */}
                      <div className="hidden sm:block text-right">
                        {scan.status === 'completed' && scan.score_overall !== null ? (
                          <span className={clsx('text-sm font-semibold tabular-nums', getScoreColor(scan.score_overall))}>
                            {scan.score_overall}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">—</span>
                        )}
                      </div>

                      {/* Col 4: relative time + chevron */}
                      <div className="hidden sm:flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-500">{timeAgo(scan.created_at)}</span>
                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                      </div>

                      {/* Mobile meta row */}
                      <div className="flex items-center gap-2 mt-1 sm:hidden col-span-full">
                        <span
                          className={clsx(
                            'px-2 py-0.5 rounded-md text-xs font-medium capitalize',
                            STATUS_STYLE[scan.status] || STATUS_STYLE.pending
                          )}
                        >
                          {scan.status}
                        </span>
                        {scan.status === 'completed' && scan.score_overall !== null && (
                          <span className={clsx('text-xs font-semibold tabular-nums', getScoreColor(scan.score_overall))}>
                            {scan.score_overall}
                          </span>
                        )}
                        <span className="text-xs text-gray-600">{timeAgo(scan.created_at)}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="px-5 py-3 border-t border-gray-800 text-center">
                    <button
                      onClick={() =>
                        setVisibleCount((prev) => prev + SCANS_PER_PAGE)
                      }
                      className="text-sm text-gray-400 hover:text-white font-medium transition-colors"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ——— Monitored Sites ——— */}
        <MonitoredSites />
      </div>
    </div>
  );
}
