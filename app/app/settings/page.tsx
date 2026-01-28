'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchApiKeys();
    }
  }, [loading, user, router]);

  const fetchApiKeys = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/keys?userId=${user.id}`);
      const data = await res.json();
      if (data.keys) {
        setApiKeys(data.keys);
      }
    } catch {
      console.error('Failed to fetch API keys');
    }
    setLoadingKeys(false);
  };

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-terminal">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-4 pb-12 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Link href="/dashboard" className="hover:text-terminal transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-200">Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Settings</h1>
          </div>

          {/* Account Info */}
          <div className="bg-void-50 rounded-lg border border-void-100 p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Account</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-gray-200">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Plan</span>
                <span className={profile?.tier === 'pro' ? 'text-terminal font-bold' : 'text-gray-200'}>
                  {profile?.tier === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>
              {profile?.scan_credits && profile.scan_credits > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Scan Credits</span>
                  <span className="text-neon-cyan">{profile.scan_credits}</span>
                </div>
              )}
            </div>
          </div>

          {/* API Keys Section */}
          <div className="bg-void-50 rounded-lg border border-void-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-void-100">
              <h2 className="text-lg font-bold text-gray-100">API Keys</h2>
              <p className="text-sm text-gray-400 mt-1">
                Use API keys to authenticate with the 3RROR CLI or external integrations.
              </p>
            </div>

            {/* New Key Display */}
            {newKey && (
              <div className="p-4 sm:p-6 bg-terminal/10 border-b border-terminal/30">
                <div className="flex items-start gap-3">
                  <div className="text-terminal text-xl">!</div>
                  <div className="flex-1">
                    <p className="text-terminal font-bold mb-2">Save your API key now!</p>
                    <p className="text-sm text-gray-400 mb-3">
                      This is the only time you&apos;ll see this key. Copy it now and store it securely.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-void px-3 py-2 rounded font-mono text-sm text-gray-200 truncate">
                        {newKey}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-terminal text-void font-bold rounded hover:bg-terminal-bright transition-colors"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <button
                      onClick={() => setNewKey(null)}
                      className="mt-3 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      I&apos;ve saved my key
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Key Form */}
            <div className="p-4 sm:p-6 border-b border-void-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (optional)"
                  className="flex-1 px-4 py-2 bg-void border border-void-100 rounded text-gray-200 placeholder-gray-500 focus:border-terminal focus:outline-none"
                />
                <button
                  onClick={createApiKey}
                  disabled={creating || apiKeys.filter(k => k.is_active).length >= 5}
                  className="px-6 py-2 bg-terminal text-void font-bold rounded hover:bg-terminal-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {creating ? 'Creating...' : 'Create API Key'}
                </button>
              </div>
              {error && (
                <p className="text-danger text-sm mt-2">{error}</p>
              )}
              {apiKeys.filter(k => k.is_active).length >= 5 && (
                <p className="text-gray-400 text-sm mt-2">Maximum 5 active API keys allowed.</p>
              )}
            </div>

            {/* API Keys List */}
            {loadingKeys ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : apiKeys.filter(k => k.is_active).length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No API keys yet. Create one to use the CLI.
              </div>
            ) : (
              <div className="divide-y divide-void-100">
                {apiKeys.filter(k => k.is_active).map((key) => (
                  <div key={key.id} className="flex items-center justify-between px-4 sm:px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 font-medium">{key.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <code className="text-sm text-gray-500 font-mono">{key.key_prefix}</code>
                        <span className="text-xs text-gray-500">
                          Created {new Date(key.created_at).toLocaleDateString()}
                        </span>
                        {key.last_used_at && (
                          <span className="text-xs text-gray-500">
                            Last used {new Date(key.last_used_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => revokeApiKey(key.id)}
                      className="px-3 py-1 text-sm text-danger hover:bg-danger/10 rounded transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CLI Installation */}
          <div className="mt-6 bg-void-50 rounded-lg border border-void-100 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Install the CLI</h2>
            <p className="text-sm text-gray-400 mb-4">Choose your preferred installation method:</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">npm (Node.js)</p>
                <code className="block bg-void px-4 py-3 rounded font-mono text-sm text-terminal overflow-x-auto">
                  npm install -g error-king
                </code>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">npx (no install)</p>
                <code className="block bg-void px-4 py-3 rounded font-mono text-sm text-terminal overflow-x-auto">
                  npx error-king scan https://example.com
                </code>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Homebrew (macOS/Linux)</p>
                <code className="block bg-void px-4 py-3 rounded font-mono text-sm text-terminal overflow-x-auto">
                  brew tap AtomicIntuition/tap && brew install error-king
                </code>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cargo (Rust)</p>
                <code className="block bg-void px-4 py-3 rounded font-mono text-sm text-terminal overflow-x-auto">
                  cargo install error_king
                </code>
              </div>
            </div>
          </div>

          {/* CLI Usage */}
          <div className="mt-6 bg-void-50 rounded-lg border border-void-100 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Usage</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Set your API key:</p>
                <code className="block bg-void px-4 py-3 rounded font-mono text-sm text-terminal overflow-x-auto">
                  export ERRORKING_API_KEY=sk_...
                </code>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Verify your key:</p>
                <code className="block bg-void px-4 py-3 rounded font-mono text-sm text-terminal overflow-x-auto">
                  3rror auth
                </code>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Scan a website:</p>
                <code className="block bg-void px-4 py-3 rounded font-mono text-sm text-terminal overflow-x-auto">
                  3rror scan https://example.com
                </code>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Search previous scans:</p>
                <code className="block bg-void px-4 py-3 rounded font-mono text-sm text-terminal overflow-x-auto">
                  3rror search stripe.com
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
