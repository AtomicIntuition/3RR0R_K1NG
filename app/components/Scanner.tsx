'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';
import { PersonaSelector, type RoastPersona } from './PersonaSelector';
import { PaywallModal } from './PaywallModal';

interface ScannerProps {
  className?: string;
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

export function Scanner({ className }: ScannerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanPhase, setScanPhase] = useState('');
  const [persona, setPersona] = useState<RoastPersona>('hacker');
  const [skipRoast, setSkipRoast] = useState(false);
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUrl = normalizeUrl(url);

    if (!isValidUrl(normalizedUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    // Check if user is signed in
    if (!user) {
      setShowAuthWall(true);
      return;
    }

    setIsLoading(true);
    setScanPhase('Initializing scan...');

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          userId: user?.id || null,
          persona,
          skipRoast,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a rate limit error
        if (response.status === 429 && data.requiresUpgrade) {
          setShowPaywall(true);
          setIsLoading(false);
          setScanPhase('');
          return;
        }
        throw new Error(data.message || data.error || 'Failed to start scan');
      }

      setScanPhase('Redirecting to results...');

      // Navigate to results page
      router.push(`/scan/${data.scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
      setScanPhase('');
    }
  };

  return (
    <div className={clsx('w-full max-w-2xl mx-auto', className)}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Terminal-style header */}
        <div className="flex items-center justify-between px-4 py-2 bg-void-100 rounded-t-lg border border-b-0 border-void-200">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-danger/80" />
              <span className="w-3 h-3 rounded-full bg-neon-yellow/80" />
              <span className="w-3 h-3 rounded-full bg-terminal/80" />
            </div>
            <span className="text-xs text-gray-400 ml-2">target_scanner.exe</span>
          </div>

          {/* Quick Audit Toggle */}
          <button
            type="button"
            onClick={() => setSkipRoast(!skipRoast)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 rounded border transition-all text-xs font-medium',
              skipRoast
                ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                : 'bg-void-50 border-void-200 text-gray-400 hover:border-gray-300 hover:text-gray-200'
            )}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Quick Mode</span>
          </button>
        </div>

        {/* Input container */}
        <div className="relative bg-void-50 border border-void-200 rounded-b-lg overflow-hidden">
          <div className="flex items-center">
            <span className="pl-4 text-terminal font-bold select-none">$</span>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
                setShowAuthWall(false);
              }}
              placeholder="Enter target URL (e.g., example.com)"
              className={clsx(
                'flex-1 px-3 py-4 bg-transparent text-gray-100',
                'placeholder:text-gray-500',
                'focus:outline-none',
                'font-mono text-lg',
                error && 'text-danger'
              )}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className={clsx(
                'px-6 py-4 font-bold transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isLoading
                  ? 'bg-neon-yellow text-void'
                  : 'bg-terminal text-void hover:bg-terminal-bright'
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
                  SCANNING
                </span>
              ) : (
                'SCAN'
              )}
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="px-4 pb-3">
              <div className="h-1 bg-void-200 rounded-full overflow-hidden">
                <div className="h-full bg-terminal animate-pulse w-1/3" />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">{scanPhase}</p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 px-4 py-2 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
            <span className="font-bold">ERROR:</span> {error}
          </div>
        )}

        {/* Auth Wall */}
        {showAuthWall && (
          <div className="mt-4 p-6 bg-gradient-to-b from-terminal/10 to-terminal/5 border border-terminal/30 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Free Account Required
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Create a free account to scan websites and get brutal roasts with actionable fixes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-terminal text-void font-bold rounded hover:bg-terminal-bright transition-colors"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-void-100 text-gray-300 font-bold rounded border border-void-200 hover:border-terminal/50 hover:text-terminal transition-colors"
                >
                  Sign In
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthWall(false)}
                className="mt-4 text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Persona Selector - hide when auth wall is showing */}
        {!showAuthWall && (
          <div className="mt-4">
            <PersonaSelector
              selected={persona}
              onSelect={setPersona}
              compact={false}
              disabled={skipRoast}
            />
          </div>
        )}
      </form>

      {/* Example URLs - hide when auth wall is showing */}
      {!showAuthWall && <div className="mt-6 text-center">
        <p className="text-xs text-gray-400 mb-2">Try scanning:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['github.com', 'stripe.com', 'vercel.com'].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setUrl(example)}
              className="px-3 py-1 text-xs text-gray-400 bg-void-100 rounded border border-void-200 hover:border-terminal/50 hover:text-terminal transition-colors"
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>}

      {/* Paywall Modal for rate limited users */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}
