'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { GlitchText } from '@/components/GlitchText';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* ASCII Art Error */}
        <pre className="text-danger font-mono text-xs sm:text-sm mb-8 select-none">
{`
   ███████╗██████╗ ██████╗  ██████╗ ██████╗
   ██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
   █████╗  ██████╔╝██████╔╝██║   ██║██████╔╝
   ██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔══██╗
   ███████╗██║  ██║██║  ██║╚██████╔╝██║  ██║
   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
`}
        </pre>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <GlitchText
            text="SYSTEM MALFUNCTION"
            className="text-danger"
            glitchIntensity="high"
          />
        </h1>

        <p className="text-gray-400 mb-6">
          Something went wrong. Our systems encountered an unexpected error.
        </p>

        {/* Error details */}
        <div className="bg-void-50 rounded-lg border border-danger/30 p-4 mb-8 text-left font-mono text-sm">
          <p className="text-danger mb-2">[FATAL ERROR]</p>
          <p className="text-gray-500 break-all">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-gray-600 mt-2 text-xs">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-danger"
          >
            Try Again
          </button>
          <Link href="/" className="btn-secondary">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
