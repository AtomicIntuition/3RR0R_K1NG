'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { MonitoredSites } from '@/components/MonitoredSites';
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

const ease = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

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
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading...</p>
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
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      label: 'Current Plan',
      value: profile?.tier === 'pro' ? 'Pro' : 'Free',
      icon: Crown,
      iconColor:
        profile?.tier === 'pro' ? 'text-amber-400' : 'text-gray-400',
      iconBg:
        profile?.tier === 'pro' ? 'bg-amber-500/10' : 'bg-gray-800',
      valueColor:
        profile?.tier === 'pro' ? 'text-amber-400' : 'text-gray-50',
    },
    {
      label: 'Average Score',
      value: avgScore !== null ? avgScore : '—',
      icon: TrendingUp,
      iconColor:
        avgScore !== null && avgScore >= 80
          ? 'text-emerald-400'
          : avgScore !== null && avgScore >= 60
            ? 'text-amber-400'
            : avgScore !== null
              ? 'text-red-400'
              : 'text-gray-500',
      iconBg:
        avgScore !== null && avgScore >= 80
          ? 'bg-emerald-500/10'
          : avgScore !== null && avgScore >= 60
            ? 'bg-amber-500/10'
            : avgScore !== null
              ? 'bg-red-500/10'
              : 'bg-gray-800',
      valueColor:
        avgScore !== null && avgScore >= 80
          ? 'text-emerald-400'
          : avgScore !== null && avgScore >= 60
            ? 'text-amber-400'
            : avgScore !== null
              ? 'text-red-400'
              : 'text-gray-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gray-950">
        {/* Ambient gradient orb */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] pointer-events-none"
          aria-hidden
        >
          <div className="w-full h-full rounded-full bg-emerald-500/[0.04] blur-[100px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Header row */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-50 tracking-tight mb-1">
                Dashboard
              </h1>
              <p className="text-gray-400">
                Welcome back, {user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                New Scan
              </Link>
              {profile?.tier !== 'pro' && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-200 font-semibold rounded-xl hover:bg-gray-700 transition-all active:scale-[0.98]"
                >
                  Upgrade
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  className="bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-800"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={clsx(
                        'w-9 h-9 rounded-lg flex items-center justify-center',
                        s.iconBg
                      )}
                    >
                      <Icon className={clsx('w-4 h-4', s.iconColor)} />
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      {s.label}
                    </span>
                  </div>
                  <div
                    className={clsx(
                      'text-3xl sm:text-4xl font-black',
                      s.valueColor || 'text-gray-50'
                    )}
                  >
                    {s.value}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"
        aria-hidden
      />

      {/* ══════════════════════════════════════
          CONTENT
          ══════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Monitored Sites */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease }}
        >
          <MonitoredSites />
        </motion.div>

        {/* ——— Scan History ——— */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease }}
          className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-5 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-50">
                Scan History
              </h2>

              {/* Filter tabs */}
              <div className="flex gap-1 bg-gray-950 rounded-xl p-1 border border-gray-800">
                {(['all', 'completed', 'failed'] as FilterType[]).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFilter(f);
                        setVisibleCount(SCANS_PER_PAGE);
                      }}
                      className={clsx(
                        'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 capitalize',
                        filter === f
                          ? 'bg-gray-800 text-gray-50 shadow-sm'
                          : 'text-gray-400 hover:text-gray-200'
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
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Loading scans...</p>
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-7 h-7 text-gray-500" />
              </div>
              <p className="text-gray-50 font-semibold text-lg mb-2">
                {filter === 'all'
                  ? 'No scans yet'
                  : `No ${filter} scans`}
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Start scanning websites to see them here
              </p>
              {filter === 'all' && (
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all active:scale-[0.98]"
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
                    className="flex items-center px-5 sm:px-6 py-4 hover:bg-gray-800/50 transition-all group border-b border-gray-800/50 last:border-0"
                  >
                    {/* Grade badge */}
                    <div
                      className={clsx(
                        'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mr-4',
                        scan.status === 'completed' && scan.letter_grade
                          ? getGradeBg(scan.letter_grade)
                          : 'bg-gray-800'
                      )}
                    >
                      {scan.status === 'completed' && scan.letter_grade ? (
                        <span className="text-base font-bold text-white">
                          {scan.letter_grade}
                        </span>
                      ) : scan.status === 'processing' ? (
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      ) : scan.status === 'failed' ? (
                        <X className="w-4 h-4 text-red-400" />
                      ) : (
                        <span className="text-gray-500 text-sm font-semibold">
                          —
                        </span>
                      )}
                    </div>

                    {/* URL & meta */}
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-gray-100 font-semibold truncate group-hover:text-emerald-400 transition-colors">
                        {scan.url
                          .replace(/^https?:\/\//, '')
                          .replace(/\/$/, '')}
                      </p>
                      <div className="flex items-center gap-2.5 mt-1">
                        <span
                          className={clsx(
                            'px-2 py-0.5 rounded-md text-xs font-semibold capitalize',
                            STATUS_STYLE[scan.status] || STATUS_STYLE.pending
                          )}
                        >
                          {scan.status}
                        </span>
                        <span className="text-xs text-gray-500">
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
                              'text-2xl font-black tabular-nums',
                              getScoreColor(scan.score_overall)
                            )}
                          >
                            {scan.score_overall}
                          </span>
                          <p className="text-xs text-gray-500">score</p>
                        </div>
                      )}

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
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
                    className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    Load more ({filteredScans.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
