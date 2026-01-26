'use client';

import { useState, FormEvent } from 'react';
import { Modal } from './Modal';
import { GlitchText } from './GlitchText';
import { setEmailCaptured } from '@/lib/conversion-tracking';
import clsx from 'clsx';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export function EmailCaptureModal({
  isOpen,
  onClose,
  onSuccess,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Store email for lead capture (you can send to your backend/CRM here)
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'scan_gate' }),
      });

      // Even if API fails, we still want to let them continue
      // The lead capture is a nice-to-have, not a blocker

      setEmailCaptured();
      onSuccess(email);
    } catch {
      // Still let them through even on network errors
      setEmailCaptured();
      onSuccess(email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      closeOnOutsideClick={false}
      closeOnEscape={false}
    >
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terminal/10 border border-terminal/30 mb-4">
            <svg
              className="w-8 h-8 text-terminal"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            <GlitchText
              text="One more thing..."
              glitchIntensity="low"
              as="span"
            />
          </h2>

          <p className="text-gray-400 text-sm">
            Enter your email to continue scanning. We&apos;ll save your results and
            send you security alerts if we find critical issues.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="hacker@example.com"
              className={clsx(
                'w-full px-4 py-3 bg-void-100 border rounded-lg',
                'text-gray-100 placeholder:text-gray-600',
                'focus:outline-none focus:border-terminal focus:ring-1 focus:ring-terminal',
                'transition-colors',
                error ? 'border-danger' : 'border-void-200'
              )}
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <p className="mt-2 text-sm text-danger">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className={clsx(
              'w-full px-6 py-3 font-bold rounded-lg transition-all duration-200',
              'bg-terminal text-void',
              'hover:bg-terminal-bright hover:shadow-lg hover:shadow-terminal/25',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'active:scale-[0.98]'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              'Continue Scanning'
            )}
          </button>
        </form>

        {/* Privacy note */}
        <p className="mt-4 text-xs text-gray-600 text-center">
          No spam, ever. We only email about critical security issues.
        </p>
      </div>
    </Modal>
  );
}
