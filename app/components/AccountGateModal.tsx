'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { useAuth } from '@/lib/auth-context';
import { setAccountPrompted } from '@/lib/conversion-tracking';
import clsx from 'clsx';

interface AccountGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AccountGateModal({
  isOpen,
  onClose,
  onSuccess,
}: AccountGateModalProps) {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password);

      if (signUpError) {
        // Check if user already exists
        if (signUpError.message.includes('already registered')) {
          setError('Account exists. Try logging in instead.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      setAccountPrompted();
      onSuccess();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    setError('');

    try {
      const signInFn = provider === 'google' ? signInWithGoogle : signInWithGithub;
      const { error: oauthError } = await signInFn();

      if (oauthError) {
        setError(oauthError.message);
        return;
      }

      setAccountPrompted();
      // OAuth redirects, so no need to call onSuccess
    } catch (err) {
      setError('OAuth sign in failed. Please try again.');
    } finally {
      setOauthLoading(null);
    }
  };

  const goToLogin = () => {
    onClose();
    router.push('/login');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      closeOnOutsideClick={false}
      closeOnEscape={false}
    >
      <div className="p-8 bg-gray-900">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-50 mb-2">
            Create your account
          </h2>

          <p className="text-gray-400 text-sm">
            Save your scan history, get 3 free scans daily, and unlock all features.
          </p>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuth('google')}
            disabled={isLoading || oauthLoading !== null}
            className={clsx(
              'w-full px-4 py-3 flex items-center justify-center gap-3',
              'bg-gray-800 border border-gray-700 rounded-xl',
              'text-gray-200 font-medium',
              'hover:bg-gray-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {oauthLoading === 'google' ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth('github')}
            disabled={isLoading || oauthLoading !== null}
            className={clsx(
              'w-full px-4 py-3 flex items-center justify-center gap-3',
              'bg-gray-800 border border-gray-700 rounded-xl',
              'text-gray-200 font-medium',
              'hover:bg-gray-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {oauthLoading === 'github' ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Email address"
              className={clsx(
                'w-full px-4 py-3 bg-gray-800 border rounded-xl',
                'text-gray-50 placeholder-gray-500',
                'focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20',
                'transition-colors',
                error ? 'border-danger' : 'border-gray-700'
              )}
              disabled={isLoading || oauthLoading !== null}
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Password (min 8 characters)"
              className={clsx(
                'w-full px-4 py-3 bg-gray-800 border rounded-xl',
                'text-gray-50 placeholder-gray-500',
                'focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20',
                'transition-colors',
                error ? 'border-danger' : 'border-gray-700'
              )}
              disabled={isLoading || oauthLoading !== null}
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || oauthLoading !== null || !email || !password}
            className={clsx(
              'w-full px-6 py-3 font-semibold rounded-xl transition-all duration-200',
              'bg-primary text-white',
              'hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/25',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'active:scale-[0.98]'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-4 text-sm text-gray-400 text-center">
          Already have an account?{' '}
          <button
            onClick={goToLogin}
            className="text-primary hover:text-primary-600 transition-colors"
          >
            Log in
          </button>
        </p>
      </div>
    </Modal>
  );
}
