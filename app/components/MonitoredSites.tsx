'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface MonitoredSite {
  id: string;
  url: string;
  name: string;
  frequency: 'daily' | 'weekly';
  is_active: boolean;
  last_score: number | null;
  last_grade: string | null;
  last_scanned_at: string | null;
  next_scan_at: string;
  alert_on_drop: boolean;
  alert_threshold: number;
}

function getGradeColor(grade: string | null) {
  if (!grade) return 'text-gray-400';
  switch (grade[0]) {
    case 'A': return 'text-success';
    case 'B': return 'text-primary';
    case 'C': return 'text-warning';
    case 'D': return 'text-warning';
    default: return 'text-danger';
  }
}

export function MonitoredSites() {
  const { user, profile } = useAuth();
  const [sites, setSites] = useState<MonitoredSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const isPro = profile?.tier === 'pro';
  const maxSites = isPro ? 5 : 0;

  useEffect(() => {
    if (user) {
      fetchSites();
    }
  }, [user]);

  const fetchSites = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/monitored-sites?userId=${user.id}`);
      const data = await res.json();
      if (data.sites) {
        setSites(data.sites);
      }
    } catch (err) {
      console.error('Failed to fetch monitored sites:', err);
    }
    setLoading(false);
  };

  const addSite = async () => {
    if (!user || !newUrl.trim()) return;
    setAdding(true);
    setError(null);

    try {
      const res = await fetch('/api/monitored-sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, url: newUrl.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewUrl('');
        setShowAddForm(false);
        fetchSites();
      } else {
        setError(data.error || 'Failed to add site');
      }
    } catch {
      setError('Failed to add site');
    }

    setAdding(false);
  };

  const removeSite = async (siteId: string) => {
    if (!user) return;
    if (!confirm('Stop monitoring this site?')) return;

    try {
      const res = await fetch(`/api/monitored-sites?id=${siteId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchSites();
      }
    } catch (err) {
      console.error('Failed to remove site:', err);
    }
  };

  const activeSites = sites.filter(s => s.is_active);

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-50">Monitored Sites</h2>
          <p className="text-sm text-gray-400 mt-1">
            We scan these sites daily and alert you when scores drop.
          </p>
        </div>
        {isPro && activeSites.length < maxSites && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors text-sm"
          >
            + Add Site
          </button>
        )}
      </div>

      {/* Upgrade prompt for free users */}
      {!isPro && (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-50 mb-2">Monitor Your Sites</h3>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            Pro users can monitor up to 5 sites. We&apos;ll scan them daily and email you when scores drop.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Add site form */}
      {isPro && showAddForm && (
        <div className="p-4 sm:p-6 border-b border-gray-800 bg-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-50 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addSite()}
            />
            <button
              onClick={addSite}
              disabled={adding || !newUrl.trim()}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {adding ? 'Adding...' : 'Monitor Site'}
            </button>
          </div>
          {error && (
            <p className="text-danger text-sm mt-2">{error}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {activeSites.length} / {maxSites} sites monitored
          </p>
        </div>
      )}

      {/* Sites list */}
      {isPro && (
        <>
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading...</div>
          ) : activeSites.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              {showAddForm ? (
                'Add your first site to start monitoring.'
              ) : (
                <>
                  No sites being monitored.{' '}
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-primary hover:underline"
                  >
                    Add one now
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {activeSites.map((site) => (
                <div key={site.id} className="px-4 sm:px-6 py-4 flex items-center gap-4">
                  {/* Score badge */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-800 border border-gray-800 flex items-center justify-center">
                    {site.last_grade ? (
                      <span className={`text-xl font-bold ${getGradeColor(site.last_grade)}`}>
                        {site.last_grade}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">--</span>
                    )}
                  </div>

                  {/* Site info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-50 font-medium truncate">{site.name}</p>
                    <p className="text-sm text-gray-400 truncate">{site.url}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>
                        {site.last_scanned_at
                          ? `Scanned ${new Date(site.last_scanned_at).toLocaleDateString()}`
                          : 'Not scanned yet'}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{site.frequency}</span>
                    </div>
                  </div>

                  {/* Score */}
                  {site.last_score !== null && (
                    <div className="text-right hidden sm:block">
                      <p className="text-2xl font-bold text-gray-50">{site.last_score}</p>
                      <p className="text-xs text-gray-500">score</p>
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removeSite(site.id)}
                    className="px-3 py-1 text-sm text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSites.length > 0 && activeSites.length < maxSites && !showAddForm && (
            <div className="px-4 sm:px-6 py-3 border-t border-gray-800 text-center">
              <button
                onClick={() => setShowAddForm(true)}
                className="text-sm text-primary hover:underline"
              >
                + Add another site ({activeSites.length}/{maxSites})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
