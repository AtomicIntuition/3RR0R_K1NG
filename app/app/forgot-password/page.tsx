'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      toast.error('Failed to send reset email', { description: error.message });
      setLoading(false);
    } else {
      setSent(true);
      toast.success('Reset email sent!', { description: 'Check your inbox for the reset link.' });
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Gradient */}
        <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 relative overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col justify-center px-12">
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <span className="text-white text-xl font-black">C</span>
              </div>
              <span className="text-3xl font-black text-white">Crisp</span>
            </Link>

            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="text-4xl font-black text-white mb-4">
              Check your inbox
            </h1>
            <p className="text-xl text-white/80 max-w-md">
              We&apos;ve sent a password reset link to your email address.
            </p>
          </div>
        </div>

        {/* Right side - Success Message */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
          <div className="w-full max-w-md text-center">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <span className="text-white text-lg font-black">C</span>
                </div>
                <span className="text-2xl font-black text-gray-900">Crisp</span>
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-2">Email sent!</h2>
              <p className="text-gray-500 mb-2">
                We sent a password reset link to
              </p>
              <p className="text-gray-900 font-semibold mb-6">{email}</p>
              <p className="text-sm text-gray-400">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>
            </div>

            <p className="mt-8 text-gray-500">
              <Link href="/login" className="text-primary hover:text-primary-700 font-semibold">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-amber-600 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white text-xl font-black">C</span>
            </div>
            <span className="text-3xl font-black text-white">Crisp</span>
          </Link>

          <h1 className="text-4xl font-black text-white mb-4">
            Forgot your password?
          </h1>
          <p className="text-xl text-white/80 max-w-md">
            No worries! Enter your email and we&apos;ll send you instructions to reset it.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                <span className="text-white text-lg font-black">C</span>
              </div>
              <span className="text-2xl font-black text-gray-900">Crisp</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Reset password
            </h2>
            <p className="text-gray-500">
              Enter your email to receive a reset link
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-amber-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-gray-500">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
