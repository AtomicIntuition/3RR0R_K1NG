'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Key, Terminal, Copy, Check, Trash2, Plus, Loader2 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
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
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-300">Settings</span>
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your API keys and integrations</p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-6">

        {/* Account Info */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-base font-semibold text-white">Account</h2>
          </div>
          <div className="divide-y divide-gray-800">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-gray-400">Email</span>
              <span className="text-sm text-white font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-gray-400">Plan</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                profile?.tier === 'pro'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {profile?.tier === 'pro' ? 'Pro' : 'Free'}
              </span>
            </div>
            {profile?.scan_credits && profile.scan_credits > 0 && (
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-gray-400">Scan Credits</span>
                <span className="text-sm text-emerald-400 font-medium">{profile.scan_credits}</span>
              </div>
            )}
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-500" />
              <h2 className="text-base font-semibold text-white">API Keys</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Use API keys to authenticate with the error-king CLI</p>
          </div>

          {/* New Key Alert */}
          {newKey && (
            <div className="px-6 py-5 bg-emerald-500/5 border-b border-emerald-500/10">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">Save your API key now</p>
              </div>
              <p className="text-xs text-gray-500 mb-3">This is the only time you&apos;ll see this key.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-800 px-4 py-2.5 rounded-lg font-mono text-sm text-gray-200 border border-gray-700 truncate">
                  {newKey}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2.5 bg-emerald-500 text-emerald-950 font-medium rounded-lg hover:bg-emerald-400 transition-colors text-sm flex items-center gap-1.5"
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

          {/* Create Key Form */}
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (optional)"
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
              <button
                onClick={createApiKey}
                disabled={creating || activeKeys.length >= 5}
                className="px-5 py-2.5 bg-emerald-500 text-emerald-950 font-medium rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 whitespace-nowrap"
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

          {/* Keys List */}
          {loadingKeys ? (
            <div className="p-12 text-center">
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading keys...</p>
            </div>
          ) : activeKeys.length === 0 ? (
            <div className="p-12 text-center">
              <Key className="w-6 h-6 text-gray-600 mx-auto mb-3" />
              <p className="text-white font-medium text-sm mb-1">No API keys yet</p>
              <p className="text-gray-500 text-xs">Create one to use the CLI</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {activeKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between px-6 py-4 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{key.name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <code className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-0.5 rounded">{key.key_prefix}</code>
                      <span className="text-xs text-gray-600">
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      {key.last_used_at && (
                        <span className="text-xs text-gray-600">
                          Last used {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => revokeApiKey(key.id)}
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Revoke key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CLI Installation */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-500" />
              <h2 className="text-base font-semibold text-white">Install the CLI</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Cargo (Rust)', cmd: 'cargo install error_king' },
              { label: 'npm (Node.js)', cmd: 'npm install -g error-king' },
              { label: 'npx (no install)', cmd: 'npx error-king scan https://example.com' },
              { label: 'Homebrew (macOS/Linux)', cmd: 'brew install error-king' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">{item.label}</p>
                <code className="block bg-gray-800 text-emerald-400 px-4 py-2.5 rounded-lg font-mono text-sm border border-gray-700/50">
                  {item.cmd}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-base font-semibold text-white">Usage</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Set your API key', cmd: 'export ERROR_KING_API_KEY=sk_...' },
              { label: 'Scan a website (Rust)', cmd: '3rror scan https://example.com' },
              { label: 'Scan a website (Node)', cmd: 'error-king scan https://example.com' },
              { label: 'Check scan status', cmd: '3rror status <scan-id>' },
              { label: 'Search previous scans', cmd: '3rror search stripe.com' },
              { label: 'Verify your key', cmd: '3rror auth' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-gray-500 mb-1.5">{item.label}</p>
                <code className="block bg-gray-800 text-emerald-400 px-4 py-2.5 rounded-lg font-mono text-sm border border-gray-700/50">
                  {item.cmd}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
