'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { GlitchText } from './GlitchText';
import { PRICING } from '@/lib/constants';
import clsx from 'clsx';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<'monthly' | 'yearly' | 'pack' | null>(null);

  const handleCheckout = async (type: 'monthly' | 'yearly' | 'pack') => {
    setIsLoading(type);

    try {
      const priceIdMap = {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
        pack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID,
      };

      const mode = type === 'pack' ? 'payment' : 'subscription';

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceIdMap[type],
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      // Fallback to pricing page
      router.push('/pricing');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-danger/10 border border-danger/30 mb-4">
            <svg
              className="w-10 h-10 text-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            <GlitchText
              text="Daily Limit Reached"
              glitchIntensity="medium"
              as="span"
            />
          </h2>

          <p className="text-gray-400">
            You&apos;ve used all {PRICING.FREE_SCANS_PER_DAY} free scans for today.
            <br />
            Upgrade to keep roasting.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Pro Monthly - Featured */}
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={isLoading !== null}
            className={clsx(
              'w-full p-4 rounded-lg border-2 border-terminal bg-terminal/5',
              'hover:bg-terminal/10 transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'group'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-terminal text-lg">Pro Monthly</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-terminal text-void rounded">
                    BEST VALUE
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {PRICING.PRO_SCANS_PER_MONTH} scans/month + priority queue
                </p>
              </div>
              <div className="text-right">
                {isLoading === 'monthly' ? (
                  <svg className="animate-spin h-6 w-6 text-terminal" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-terminal">${PRICING.PRO_MONTHLY}</span>
                    <span className="text-gray-500">/mo</span>
                  </>
                )}
              </div>
            </div>
          </button>

          {/* Pro Yearly */}
          <button
            onClick={() => handleCheckout('yearly')}
            disabled={isLoading !== null}
            className={clsx(
              'w-full p-4 rounded-lg border border-void-200 bg-void-100',
              'hover:border-neon-cyan/50 hover:bg-void-100/80 transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-100 text-lg">Pro Yearly</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-neon-cyan/20 text-neon-cyan rounded">
                    SAVE 43%
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {PRICING.PRO_SCANS_PER_MONTH} scans/month, billed annually
                </p>
              </div>
              <div className="text-right">
                {isLoading === 'yearly' ? (
                  <svg className="animate-spin h-6 w-6 text-neon-cyan" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-100">${PRICING.PRO_YEARLY}</span>
                    <span className="text-gray-500">/yr</span>
                  </>
                )}
              </div>
            </div>
          </button>

          {/* Scan Pack */}
          <button
            onClick={() => handleCheckout('pack')}
            disabled={isLoading !== null}
            className={clsx(
              'w-full p-4 rounded-lg border border-void-200 bg-void-100',
              'hover:border-neon-purple/50 hover:bg-void-100/80 transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="font-bold text-gray-100 text-lg">Scan Pack</span>
                <p className="text-sm text-gray-400 mt-1">
                  {PRICING.SCAN_PACK_SCANS} scans, one-time purchase
                </p>
              </div>
              <div className="text-right">
                {isLoading === 'pack' ? (
                  <svg className="animate-spin h-6 w-6 text-neon-purple" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-100">${PRICING.SCAN_PACK}</span>
                    <span className="text-gray-500"> once</span>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Come back tomorrow for free scans
          </button>
        </div>
      </div>
    </Modal>
  );
}
