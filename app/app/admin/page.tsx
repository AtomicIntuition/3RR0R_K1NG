'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface WhitelistEntry {
  id: string;
  email: string;
  granted_tier: 'free' | 'pro';
  expires_at: string | null;
  note: string | null;
  created_at: string;
  used_at: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, session, loading } = useAuth();

  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newTier, setNewTier] = useState<'free' | 'pro'>('pro');
  const [newNote, setNewNote] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch whitelist
  const fetchWhitelist = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/admin/whitelist', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.status === 403) {
        setError('You do not have admin access');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch whitelist');
      }

      const data = await response.json();
      setWhitelist(data.whitelist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (session?.access_token) {
      fetchWhitelist();
    }
  }, [loading, user, session, router]);

  const handleAddEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.access_token || !newEmail.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: newEmail.trim(),
          granted_tier: newTier,
          note: newNote.trim() || null,
          expires_at: newExpiry || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add email');
      }

      // Refresh list and clear form
      await fetchWhitelist();
      setNewEmail('');
      setNewNote('');
      setNewExpiry('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.access_token) return;
    if (!confirm('Remove this email from whitelist?')) return;

    try {
      const response = await fetch(`/api/admin/whitelist?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      await fetchWhitelist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-terminal">Loading...</div>
      </div>
    );
  }

  if (error === 'You do not have admin access') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-danger mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You do not have permission to access this page.</p>
          <Link href="/" className="text-terminal hover:text-terminal-bright">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-terminal hover:text-terminal-bright text-sm mb-4 inline-block">
            &larr; Back to home
          </Link>
          <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage email whitelist for giveaways</p>
        </div>

        {error && error !== 'You do not have admin access' && (
          <div className="mb-6 px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg text-danger">
            {error}
          </div>
        )}

        {/* Add Email Form */}
        <div className="bg-void-50 rounded-lg border border-void-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Add to Whitelist</h2>

          <form onSubmit={handleAddEmail} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-void-100 border border-void-200 rounded text-gray-100 focus:outline-none focus:border-terminal"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as 'free' | 'pro')}
                  className="w-full px-4 py-2 bg-void-100 border border-void-200 rounded text-gray-100 focus:outline-none focus:border-terminal"
                >
                  <option value="pro">Pro</option>
                  <option value="free">Free</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Expires (optional)</label>
                <input
                  type="datetime-local"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full px-4 py-2 bg-void-100 border border-void-200 rounded text-gray-100 focus:outline-none focus:border-terminal"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-4 py-2 bg-void-100 border border-void-200 rounded text-gray-100 focus:outline-none focus:border-terminal"
                  placeholder="e.g., Twitter giveaway winner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !newEmail.trim()}
              className="px-6 py-2 bg-terminal text-void font-bold rounded hover:bg-terminal-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Email'}
            </button>
          </form>
        </div>

        {/* Whitelist Table */}
        <div className="bg-void-50 rounded-lg border border-void-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-void-100">
            <h2 className="text-xl font-bold text-gray-100">Whitelist ({whitelist.length})</h2>
          </div>

          {whitelist.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No emails whitelisted yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-void-100 text-left text-sm text-gray-400">
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Tier</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Note</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {whitelist.map((entry) => (
                    <tr key={entry.id} className="border-b border-void-100 hover:bg-void-100/50">
                      <td className="px-6 py-3 text-gray-200">{entry.email}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            entry.granted_tier === 'pro'
                              ? 'bg-neon-cyan/20 text-neon-cyan'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {entry.granted_tier.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {entry.used_at ? (
                          <span className="text-terminal text-sm">Used</span>
                        ) : entry.expires_at && new Date(entry.expires_at) < new Date() ? (
                          <span className="text-danger text-sm">Expired</span>
                        ) : (
                          <span className="text-neon-yellow text-sm">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-sm">{entry.note || '-'}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-danger hover:text-danger/80 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
