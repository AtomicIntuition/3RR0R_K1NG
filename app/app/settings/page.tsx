'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Plus, Copy, Check, Trash2, Loader2 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

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

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchApiKeys();
    }
  }, [loading, user, router]);

  const fetchApiKeys = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/keys?userId=${user.id}`);
      const data = await res.json();
      if (data.keys) {
        startTransition(() => {
          setApiKeys(data.keys);
        });
      }
    } catch {
      console.error('Failed to fetch API keys');
    }
    setLoadingKeys(false);
  }, [user]);

  const createApiKey = async () => {
    if (!user) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: newKeyName || 'CLI Key' }),
      });

      const data = await res.json();

      if (res.ok && data.key) {
        setNewKey(data.key);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        setError(data.error || 'Failed to create API key');
      }
    } catch {
      setError('Failed to create API key');
    }

    setCreating(false);
  };

  const revokeApiKey = async (keyId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/keys?id=${keyId}&userId=${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchApiKeys();
      }
    } catch {
      console.error('Failed to revoke API key');
    }
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeKeys = apiKeys.filter(k => k.is_active);

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

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 space-y-8">

        {/* ——— Page header ——— */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">API Keys</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* ——— Overview strip ——— */}
        <div className="grid grid-cols-2 sm:grid-cols-3 border border-gray-800 rounded-lg divide-x divide-y sm:divide-y-0 divide-gray-800">
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">Active keys</p>
            <p className="text-lg font-semibold text-white tabular-nums">{activeKeys.length} / 5</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">Plan</p>
            <p className="text-lg font-semibold text-white">
              {profile?.tier === 'pro' ? 'Pro' : 'Free'}
            </p>
          </div>
          <div className="px-5 py-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm font-medium text-gray-300 truncate">{user?.email}</p>
          </div>
        </div>

        {/* ——— New key created alert ——— */}
        {newKey && (
          <div className="border border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-medium text-white">Save your API key now</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">This is the only time you&apos;ll see this key.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-900 px-4 py-2.5 rounded-lg font-mono text-sm text-gray-200 border border-gray-800 truncate">
                {newKey}
              </code>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2.5 bg-white text-gray-950 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              I&apos;ve saved my key
            </button>
          </div>
        )}

        {/* ——— Create key ——— */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Create key</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (optional)"
              className="flex-1 px-4 py-2.5 bg-transparent border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
            />
            <button
              onClick={createApiKey}
              disabled={creating || activeKeys.length >= 5}
              className="px-5 py-2.5 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {creating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Create Key
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          {activeKeys.length >= 5 && (
            <p className="text-gray-500 text-xs mt-2">Maximum 5 active API keys allowed.</p>
          )}
        </div>

        {/* ——— Keys table ——— */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Active keys</h2>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            {/* Column headers (desktop) */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_120px_100px_100px_48px] px-5 py-2 border-b border-gray-800 text-xs text-gray-500">
              <span>Name</span>
              <span>Prefix</span>
              <span>Created</span>
              <span>Last used</span>
              <span />
            </div>

            {loadingKeys ? (
              <div className="p-12 text-center">
                <Loader2 className="w-5 h-5 text-gray-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading keys...</p>
              </div>
            ) : activeKeys.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-white font-medium text-sm mb-1">No API keys yet</p>
                <p className="text-gray-500 text-xs">Create one to use the CLI.</p>
              </div>
            ) : (
              <div>
                {activeKeys.map((key) => (
                  <div
                    key={key.id}
                    className="grid sm:grid-cols-[1fr_120px_100px_100px_48px] items-center px-5 py-3 border-b border-gray-800/50 last:border-0 group hover:bg-gray-900/80 transition-colors"
                  >
                    {/* Name */}
                    <p className="text-sm text-gray-200 font-medium">{key.name}</p>

                    {/* Prefix */}
                    <div className="hidden sm:block">
                      <code className="text-xs text-gray-500 font-mono">{key.key_prefix}</code>
                    </div>

                    {/* Created */}
                    <div className="hidden sm:block">
                      <span className="text-xs text-gray-500">{timeAgo(key.created_at)}</span>
                    </div>

                    {/* Last used */}
                    <div className="hidden sm:block">
                      <span className="text-xs text-gray-500">
                        {key.last_used_at ? timeAgo(key.last_used_at) : 'Never'}
                      </span>
                    </div>

                    {/* Revoke */}
                    <div className="hidden sm:flex justify-end">
                      <button
                        onClick={() => revokeApiKey(key.id)}
                        className="p-1.5 text-gray-700 hover:text-red-400 rounded-md transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Mobile meta row */}
                    <div className="flex items-center gap-3 mt-1 sm:hidden col-span-full">
                      <code className="text-xs text-gray-600 font-mono">{key.key_prefix}</code>
                      <span className="text-xs text-gray-600">{timeAgo(key.created_at)}</span>
                      <button
                        onClick={() => revokeApiKey(key.id)}
                        className="ml-auto p-1 text-gray-700 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ——— CLI setup ——— */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Install the CLI</h2>
          <div className="border border-gray-800 rounded-lg divide-y divide-gray-800">
            {[
              { label: 'Cargo (Rust)', cmd: 'cargo install error_king' },
              { label: 'npm (Node.js)', cmd: 'npm install -g error-king' },
              { label: 'npx (no install)', cmd: 'npx error-king scan https://example.com' },
              { label: 'Homebrew (macOS/Linux)', cmd: 'brew install error-king' },
            ].map((item, i) => (
              <div key={i} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                <code className="text-sm text-gray-300 font-mono">{item.cmd}</code>
              </div>
            ))}
          </div>
        </div>

        {/* ——— Usage ——— */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Usage</h2>
          <div className="border border-gray-800 rounded-lg divide-y divide-gray-800">
            {[
              { label: 'Set your API key', cmd: 'export ERROR_KING_API_KEY=sk_...' },
              { label: 'Scan a website (Rust)', cmd: '3rror scan https://example.com' },
              { label: 'Scan a website (Node)', cmd: 'error-king scan https://example.com' },
              { label: 'Check scan status', cmd: '3rror status <scan-id>' },
              { label: 'Search previous scans', cmd: '3rror search stripe.com' },
              { label: 'Verify your key', cmd: '3rror auth' },
            ].map((item, i) => (
              <div key={i} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-xs text-gray-500">{item.label}</span>
                <code className="text-sm text-gray-300 font-mono">{item.cmd}</code>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
