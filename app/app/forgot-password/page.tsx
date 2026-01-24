'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { GlitchText } from '@/components/GlitchText';

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
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-void-50 rounded-lg border border-terminal/30 p-8">
            <div className="text-5xl mb-4">✉️</div>
            <h1 className="text-2xl font-bold text-terminal mb-2">Check Your Email</h1>
            <p className="text-gray-400 mb-6">
              We sent a password reset link to <span className="text-gray-200">{email}</span>
            </p>
            <p className="text-sm text-gray-500">
              Click the link in the email to reset your password.
            </p>
          </div>
          <p className="mt-6 text-gray-400">
            <Link href="/login" className="text-terminal hover:text-terminal-bright transition-colors">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-terminal hover:text-terminal-bright transition-colors">
              3RROR_K1NG
            </span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">
            <GlitchText
              text="Forgot Password"
              className="text-gray-100"
              glitchIntensity="low"
              as="span"
            />
          </h1>
          <p className="text-gray-400">Enter your email to reset your password</p>
        </div>

        {/* Form */}
        <div className="bg-void-50 rounded-lg border border-void-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-void-100 border border-void-200 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-terminal"
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <div className="px-4 py-2 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-terminal text-void font-bold rounded-lg hover:bg-terminal-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>

        {/* Back to login */}
        <p className="mt-6 text-center text-gray-400">
          Remember your password?{' '}
          <Link href="/login" className="text-terminal hover:text-terminal-bright transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
