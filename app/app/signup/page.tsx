'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { GlitchText } from '@/components/GlitchText';
import { toast } from 'sonner';

export default function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      toast.error('Sign up failed', { description: error.message });
      setLoading(false);
    } else {
      setSuccess(true);
      toast.success('Check your email!', { description: 'We sent you a confirmation link.' });
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-void-50 rounded-lg border border-terminal/30 p-8">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-terminal mb-2">Check Your Email</h1>
            <p className="text-gray-400 mb-6">
              We&apos;ve sent a confirmation link to <span className="text-gray-200">{email}</span>
            </p>
            <p className="text-sm text-gray-500">
              Click the link in the email to activate your account and start roasting websites.
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
              text="Join the Roast"
              className="text-gray-100"
              glitchIntensity="low"
              as="span"
            />
          </h1>
          <p className="text-gray-400">Create an account to unlock more scans</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-void-50 rounded-lg border border-void-100 p-6">
          {/* Email/Password Form */}
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
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
                Confirm Password
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500 text-center">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-gray-400 hover:text-terminal">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-gray-400 hover:text-terminal">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-terminal hover:text-terminal-bright transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
