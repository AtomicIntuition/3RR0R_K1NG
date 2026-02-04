'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex bg-red-600 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white text-xl font-black">C</span>
            </div>
            <span className="text-3xl font-black text-white">Crisp</span>
          </Link>

          {/* Error Icon */}
          <div className="w-24 h-24 mx-auto mb-8 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Something went wrong
          </h1>

          <p className="text-xl text-white/80 mb-8">
            We encountered an unexpected error. Please try again.
          </p>

          {/* Error details card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 text-left border border-white/20">
            <p className="text-white font-bold mb-2">Error Details</p>
            <p className="text-white/70 break-all text-sm">
              {error.message || 'An unexpected error occurred'}
            </p>
            {error.digest && (
              <p className="text-white/50 mt-3 text-xs font-mono">
                Reference: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="px-8 py-4 bg-white text-red-600 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-8 py-4 bg-white/20 backdrop-blur text-white font-bold text-lg rounded-xl hover:bg-white/30 transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
