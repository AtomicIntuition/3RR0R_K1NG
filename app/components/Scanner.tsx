'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUrl = normalizeUrl(url);

    if (!isValidUrl(normalizedUrl)) {
      setError('Please enter a valid URL');
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start scan');
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
        <div className="flex items-center gap-2 px-4 py-2 bg-void-100 rounded-t-lg border border-b-0 border-void-200">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-danger/80" />
            <span className="w-3 h-3 rounded-full bg-neon-yellow/80" />
            <span className="w-3 h-3 rounded-full bg-terminal/80" />
          </div>
          <span className="text-xs text-gray-500 ml-2">target_scanner.exe</span>
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
              }}
              placeholder="Enter target URL (e.g., example.com)"
              className={clsx(
                'flex-1 px-3 py-4 bg-transparent text-gray-100',
                'placeholder:text-gray-600',
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
      </form>

      {/* Example URLs */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-600 mb-2">Try scanning:</p>
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
      </div>
    </div>
  );
}
