'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { GlitchText } from '@/components/GlitchText';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check for password recovery event or existing session
    const checkSession = async () => {
      // First check if there's already a session from the recovery link
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
        setChecking(false);
        return;
      }

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true);
          setChecking(false);
        } else if (event === 'SIGNED_IN' && session) {
          setIsValidSession(true);
          setChecking(false);
        }
      });

      // Timeout fallback - if no auth event after 3 seconds, show error
      const timer = setTimeout(() => {
        if (!isValidSession) {
          setChecking(false);
        }
      }, 3000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
      };
    };

    checkSession();
  }, [isValidSession]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
        toast.error('Failed to update password', { description: error.message });
        setLoading(false);
      } else {
        setSuccess(true);
        toast.success('Password updated!', { description: 'Redirecting you to the app...' });

        // Wait a moment for the user to see the success message
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
      toast.error('Failed to update password', { description: 'Please try again.' });
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-void-50 rounded-lg border border-void-100 p-8">
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-2 border-terminal border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-terminal text-xl mb-2">Verifying...</div>
            <p className="text-gray-400 text-sm">
              Validating your reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession && !checking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-void-50 rounded-lg border border-danger/30 p-8">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-danger mb-2">Invalid or Expired Link</h1>
            <p className="text-gray-400 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block px-6 py-3 bg-terminal text-void font-bold rounded-lg hover:bg-terminal-bright transition-colors"
            >
              Request New Link
            </Link>
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-void-50 rounded-lg border border-terminal/30 p-8">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-terminal mb-2">Password Updated!</h1>
            <p className="text-gray-400 mb-4">
              Your password has been successfully changed.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-terminal border-t-transparent rounded-full animate-spin" />
              <span>Redirecting to app...</span>
            </div>
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
          <p className="text-gray-400">Enter your new password below</p>
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
                autoFocus
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-void border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                'Update Password'
              )}
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
