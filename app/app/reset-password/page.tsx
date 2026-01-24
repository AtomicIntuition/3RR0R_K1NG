'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { GlitchText } from '@/components/GlitchText';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Listen for auth state changes - Supabase handles the token from URL automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setChecking(false);
      }
    });

    // Check current session after a brief delay to let Supabase process the URL
    const timer = setTimeout(() => {
      setChecking(false);
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-void-50 rounded-lg border border-void-100 p-8">
            <div className="text-terminal text-xl mb-4">Loading...</div>
            <p className="text-gray-400 text-sm">
              Verifying your reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-void-50 rounded-lg border border-terminal/30 p-8">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-terminal mb-2">Password Reset!</h1>
            <p className="text-gray-400">
              Your password has been updated. Redirecting...
            </p>
          </div>
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
              text="Reset Password"
              className="text-gray-100"
              glitchIntensity="low"
              as="span"
            />
          </h1>
          <p className="text-gray-400">Enter your new password</p>
        </div>

        {/* Form */}
        <div className="bg-void-50 rounded-lg border border-void-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-void-100 border border-void-200 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-terminal"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-void-100 border border-void-200 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-terminal"
                placeholder="Confirm your password"
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
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Back to login */}
        <p className="mt-6 text-center text-gray-400">
          <Link href="/login" className="text-terminal hover:text-terminal-bright transition-colors">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
