'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
      <div className="bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200/40 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-white font-medium">Settings</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Settings</h1>
          <p className="text-white/60">Manage your API keys and integrations</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Account Info Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-black text-gray-900">Account</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Email</span>
              <span className="text-gray-900 font-bold">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Plan</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                profile?.tier === 'pro'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {profile?.tier === 'pro' ? 'Pro' : 'Free'}
              </span>
            </div>
            {profile?.scan_credits && profile.scan_credits > 0 && (
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-500 font-medium">Scan Credits</span>
                <span className="text-primary font-bold">{profile.scan_credits}</span>
              </div>
            )}
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-black text-gray-900">API Keys</h2>
            <p className="text-gray-500 text-sm mt-1">Use API keys to authenticate with the Crisp CLI</p>
          </div>

          {/* New Key Alert */}
          {newKey && (
            <div className="p-6 bg-emerald-50 border-b border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-emerald-800 font-bold mb-2">Save your API key now!</p>
                  <p className="text-emerald-600 text-sm mb-4">This is the only time you&apos;ll see this key.</p>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-white px-4 py-3 rounded-xl font-mono text-sm text-gray-800 border border-emerald-200 truncate">
                      {newKey}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <button
                    onClick={() => setNewKey(null)}
                    className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    I&apos;ve saved my key
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Key Form */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (optional)"
                className="flex-1 px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
              />
              <button
                onClick={createApiKey}
                disabled={creating || apiKeys.filter(k => k.is_active).length >= 5}
                className="px-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 whitespace-nowrap"
              >
                {creating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create API Key'
                )}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}
            {apiKeys.filter(k => k.is_active).length >= 5 && (
              <p className="text-gray-500 text-sm mt-3">Maximum 5 active API keys allowed.</p>
            )}
          </div>

          {/* Keys List */}
          {loadingKeys ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Loading keys...</p>
            </div>
          ) : apiKeys.filter(k => k.is_active).length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-gray-900 font-bold mb-2">No API keys yet</p>
              <p className="text-gray-500">Create one to use the CLI</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {apiKeys.filter(k => k.is_active).map((key) => (
                <div key={key.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-bold">{key.name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <code className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded-lg">{key.key_prefix}</code>
                      <span className="text-xs text-gray-400">
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      {key.last_used_at && (
                        <span className="text-xs text-gray-400">
                          Last used {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => revokeApiKey(key.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CLI Installation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-black text-gray-900">Install the CLI</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'npm (Node.js)', cmd: 'npm install -g crisp' },
              { label: 'npx (no install)', cmd: 'npx crisp scan https://example.com' },
              { label: 'Homebrew (macOS/Linux)', cmd: 'brew install crisp' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wide">{item.label}</p>
                <code className="block bg-gray-900 text-emerald-400 px-4 py-3 rounded-xl font-mono text-sm overflow-x-auto">
                  {item.cmd}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-black text-gray-900">Usage</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Set your API key', cmd: 'export CRISP_API_KEY=sk_...' },
              { label: 'Verify your key', cmd: 'crisp auth' },
              { label: 'Scan a website', cmd: 'crisp scan https://example.com' },
              { label: 'Search previous scans', cmd: 'crisp search stripe.com' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-sm text-gray-500 mb-2">{item.label}</p>
                <code className="block bg-gray-900 text-emerald-400 px-4 py-3 rounded-xl font-mono text-sm overflow-x-auto">
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
