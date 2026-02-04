'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (sessionId) {
      // Refresh the profile to update the tier badge in navbar
      refreshProfile();
      setStatus('success');
      toast.success('Payment successful!', { description: 'Your account has been upgraded.' });
    } else {
      setStatus('error');
      toast.error('Payment verification failed');
    }
  }, [sessionId, refreshProfile]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-950">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-warning/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-50 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-400 mb-6">
            We couldn't verify your payment. If you were charged, please contact support.
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-950">
      <div className="text-center max-w-lg">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-success"
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

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-50 mb-4">
          Payment Successful!
        </h1>

        <p className="text-xl text-gray-400 mb-2">
          Welcome to Pro.
        </p>

        <p className="text-gray-400 mb-8">
          Your account has been upgraded. You now have access to all premium features.
        </p>

        {/* Next Steps */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-8 text-left shadow-sm">
          <h2 className="font-semibold text-gray-100 mb-4">What's next?</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-medium">1.</span>
              <span>200 scans per month with priority queue access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-medium">2.</span>
              <span>Site monitoring with score drop alerts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-medium">3.</span>
              <span>API access for automated auditing</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 font-semibold rounded-xl transition-all bg-emerald-500 text-white hover:bg-emerald-400"
          >
            Start Scanning
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 font-semibold rounded-xl transition-all bg-gray-800 text-gray-200 hover:bg-gray-700"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Receipt Info */}
        <p className="mt-8 text-xs text-gray-400">
          A receipt has been sent to your email. Questions?{' '}
          <a href="mailto:support@crisp.dev" className="text-emerald-500 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
