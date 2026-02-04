'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';
import { PaywallModal } from './PaywallModal';
import { toast } from 'sonner';

interface ScannerProps {
  className?: string;
  autoFocus?: boolean;
}

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string.startsWith('http') ? string : `https://${string}`);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

export function Scanner({ className, autoFocus = false }: ScannerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanPhase, setScanPhase] = useState('');
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUrl = normalizeUrl(url);

    if (!isValidUrl(normalizedUrl)) {
      setError('Please enter a valid URL');
      toast.error('Invalid URL', { description: 'Please enter a valid website URL' });
      return;
    }

    setIsLoading(true);
    setScanPhase('Initializing audit...');

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          userId: user?.id || null,
          persona: 'professional',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.requiresUpgrade) {
          if (!user) {
            toast.error('Free scans used', { description: 'Create a free account to continue scanning' });
            setShowAuthWall(true);
          } else {
            toast.error('Scan limit reached', { description: data.message || 'Upgrade for more scans' });
            setShowPaywall(true);
          }
          setIsLoading(false);
          setScanPhase('');
          return;
        }
        throw new Error(data.message || data.error || 'Failed to start scan');
      }

      setScanPhase('Redirecting to results...');
      router.push(`/scan/${data.scanId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      toast.error('Scan failed', { description: message });
      setIsLoading(false);
      setScanPhase('');
    }
  };

  return (
    <div className={clsx('w-full max-w-2xl mx-auto', className)}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Outer glow on focus */}
        <div
          className={clsx(
            'absolute -inset-1 rounded-3xl transition-all duration-300 pointer-events-none',
            isFocused && !error
              ? 'bg-emerald-500/5 blur-xl opacity-100'
              : 'opacity-0'
          )}
        />

        {/* Card with premium styling */}
        <div
          className={clsx(
            'relative bg-gray-900 rounded-2xl shadow-card border overflow-hidden transition-all duration-200',
            isFocused && !error ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-gray-800',
            error && 'border-danger/30'
          )}
        >
          {/* Input container */}
          <div className="flex items-center">
            <div className="pl-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
                setShowAuthWall(false);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="example.com"
              className={clsx(
                'flex-1 px-3 py-4 bg-transparent text-gray-50',
                'placeholder:text-gray-500',
                'focus:outline-none',
                'text-lg',
                error && 'text-danger'
              )}
              disabled={isLoading}
              autoFocus={autoFocus}
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className={clsx(
                'px-6 py-4 font-semibold transition-all duration-200 rounded-r-xl',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isLoading
                  ? 'bg-gray-700 text-white'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98]'
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing
                </span>
              ) : (
                'Analyze'
              )}
            </button>
          </div>

          {/* Premium shimmer loading bar */}
          {isLoading && (
            <div className="px-4 pb-4">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full loading-bar-premium rounded-full" />
              </div>
              <p className="text-xs text-gray-500 mt-2">{scanPhase}</p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 px-4 py-3 bg-danger/5 border border-danger/20 rounded-xl text-danger text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Auth Wall */}
        {showAuthWall && (
          <div className="mt-4 p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-card animate-slide-up">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-50 mb-2">
                Want More Scans?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Create a free account to get <span className="text-emerald-500 font-semibold">3 scans per day</span>, save your results, and track improvements over time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/signup?redirect=${encodeURIComponent(`/?url=${encodeURIComponent(url)}`)}`}
                  className="btn-premium text-center"
                >
                  Create Free Account
                </Link>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/?url=${encodeURIComponent(url)}`)}`}
                  className="btn-secondary-premium text-center"
                >
                  Sign In
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthWall(false)}
                className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Example URLs */}
      {!showAuthWall && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 mb-2">Try scanning:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['github.com', 'notion.com', 'vercel.com'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setUrl(example)}
                className="px-3 py-1.5 text-xs text-gray-400 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:text-gray-200 transition-all duration-200"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}
