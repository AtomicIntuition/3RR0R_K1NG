'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GlitchText } from '@/components/GlitchText';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the session with your backend
      // For now, we'll just show success
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-terminal"></div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-6 block">⚠️</span>
          <h1 className="text-2xl font-bold text-neon-orange mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-400 mb-6">
            We couldn't verify your payment. If you were charged, please contact support.
          </p>
          <Link href="/" className="btn-primary inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-terminal/20 flex items-center justify-center animate-pulse">
            <svg
              className="w-12 h-12 text-terminal"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <GlitchText
            text="Payment Successful!"
            className="text-terminal"
            glitchIntensity="low"
            as="span"
          />
        </h1>

        <p className="text-xl text-gray-300 mb-2">
          Welcome to the elite, hacker.
        </p>

        <p className="text-gray-500 mb-8">
          Your account has been upgraded. You now have access to unlimited roasting power.
          Time to expose some vulnerabilities.
        </p>

        {/* Next Steps */}
        <div className="bg-void-50 rounded-lg border border-void-100 p-6 mb-8 text-left">
          <h2 className="font-bold text-terminal mb-4">What's next?</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-terminal">1.</span>
              <span>Start scanning unlimited websites with priority queue access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal">2.</span>
              <span>Access detailed security deep-dives and historical data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal">3.</span>
              <span>Export your roast reports as shareable PDFs</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 font-bold rounded transition-all duration-200 bg-gradient-to-r from-terminal to-neon-cyan text-void hover:shadow-lg hover:shadow-terminal/25"
          >
            Start Scanning
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 font-bold rounded transition-all duration-200 bg-void-100 text-gray-300 hover:bg-void-200"
          >
            View Plans
          </Link>
        </div>

        {/* Receipt Info */}
        <p className="mt-8 text-xs text-gray-600">
          A receipt has been sent to your email. Questions?{' '}
          <a href="mailto:support@3rrork1ng.com" className="text-terminal hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
