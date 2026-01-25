'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { GlitchText } from './GlitchText';
import { PRICING } from '@/lib/constants';
import clsx from 'clsx';

const DISCOUNT_STORAGE_KEY = 'errorking_discount_expiry';
const DISCOUNT_SHOWN_KEY = 'errorking_discount_shown';
const DISCOUNT_DURATION = 15 * 60 * 1000; // 15 minutes in ms

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<'monthly' | 'yearly' | 'pack' | 'discount' | null>(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [discountExpired, setDiscountExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if discount was already shown and if timer is still valid
  const checkDiscountState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const wasShown = localStorage.getItem(DISCOUNT_SHOWN_KEY) === 'true';
    const expiryStr = localStorage.getItem(DISCOUNT_STORAGE_KEY);

    if (wasShown && expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      const now = Date.now();

      if (now < expiry) {
        // Still within the 15 minute window - show discount with remaining time
        setShowDiscount(true);
        setTimeLeft(Math.floor((expiry - now) / 1000));
        setDiscountExpired(false);
      } else {
        // Timer expired - discount is no longer available
        setDiscountExpired(true);
        setShowDiscount(false);
      }
    }
  }, []);

  // Check state when modal opens
  useEffect(() => {
    if (isOpen) {
      checkDiscountState();
    }
  }, [isOpen, checkDiscountState]);

  // Countdown timer
  useEffect(() => {
    if (!showDiscount || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDiscountExpired(true);
          setShowDiscount(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showDiscount, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckout = async (type: 'monthly' | 'yearly' | 'pack' | 'discount') => {
    setIsLoading(type);
    setError(null);

    try {
      const priceIdMap = {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
        pack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID,
        discount: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      };

      const mode = type === 'pack' ? 'payment' : 'subscription';

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceIdMap[type],
          mode,
          applyExitDiscount: type === 'discount',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If not logged in, redirect to login
        if (response.status === 401) {
          router.push('/login?redirect=/pricing');
          return;
        }
        throw new Error(data.error || 'Checkout failed');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleDecline = () => {
    if (!showDiscount && !discountExpired) {
      // First decline - show discount offer and start timer
      const expiry = Date.now() + DISCOUNT_DURATION;
      localStorage.setItem(DISCOUNT_SHOWN_KEY, 'true');
      localStorage.setItem(DISCOUNT_STORAGE_KEY, expiry.toString());
      setShowDiscount(true);
      setTimeLeft(15 * 60); // 15 minutes
    } else {
      // Already showing discount or expired - close for real
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Discount view
  if (showDiscount && !discountExpired && timeLeft > 0) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={false} className="max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-terminal/10 via-transparent to-neon-cyan/10 animate-pulse" />

          <div className="relative p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="inline-block px-3 py-1 bg-danger/20 text-danger text-xs font-bold rounded-full mb-3 animate-pulse">
                WAIT — EXCLUSIVE OFFER
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
                <GlitchText
                  text="One Last Chance!"
                  glitchIntensity="medium"
                  as="span"
                />
              </h2>

              <p className="text-gray-400 text-sm sm:text-base">
                Get your first month of Pro for just
              </p>
            </div>

            {/* Price display */}
            <div className="text-center mb-5">
              <div className="inline-flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl text-gray-500 line-through">
                  ${PRICING.PRO_MONTHLY}
                </span>
                <span className="text-4xl sm:text-5xl font-bold text-terminal">
                  ${PRICING.EXIT_INTENT_DISCOUNT_PRICE}
                </span>
              </div>
              <div className="mt-2">
                <span className="inline-block px-3 py-1 bg-terminal/20 text-terminal text-sm font-bold rounded-full">
                  {PRICING.EXIT_INTENT_DISCOUNT_PERCENT}% OFF
                </span>
              </div>
            </div>

            {/* What you get */}
            <div className="bg-void-100 rounded-lg p-4 mb-5">
              <p className="text-sm text-gray-400 font-medium mb-2">What you get:</p>
              <ul className="space-y-1.5">
                {[
                  `${PRICING.PRO_SCANS_PER_MONTH} scans per month`,
                  'Priority queue (faster results)',
                  'Full security, SEO & accessibility audits',
                  'Cancel anytime',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-terminal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timer */}
            <div className="text-center mb-5">
              <p className="text-sm text-gray-500 mb-1">Offer expires in</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/30 rounded-lg">
                <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xl font-mono font-bold text-danger">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm text-center">
                {error}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleCheckout('discount')}
                disabled={isLoading !== null}
                className={clsx(
                  'w-full px-6 py-3 sm:py-4 font-bold rounded-lg transition-all duration-200',
                  'bg-gradient-to-r from-terminal to-neon-cyan text-void',
                  'hover:from-terminal-bright hover:to-neon-cyan',
                  'hover:shadow-lg hover:shadow-terminal/25',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'active:scale-[0.98]'
                )}
              >
                {isLoading === 'discount' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Claim My Discount'
                )}
              </button>

              <button
                onClick={handleDecline}
                className="w-full px-6 py-2 text-gray-500 hover:text-gray-400 transition-colors text-sm"
              >
                No thanks, I&apos;ll pay full price later
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // Regular paywall view
  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-danger/10 border border-danger/30 mb-4">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-danger"
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

          <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2">
            <GlitchText
              text="Daily Limit Reached"
              glitchIntensity="medium"
              as="span"
            />
          </h2>

          <p className="text-gray-400 text-sm sm:text-base">
            You&apos;ve used all {PRICING.FREE_SCANS_PER_DAY} free scans for today.
            <br />
            Upgrade to keep roasting.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm text-center">
            {error}
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
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
                  <span className="font-bold text-terminal text-base sm:text-lg">Pro Monthly</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-terminal text-void rounded">
                    BEST
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
                    <span className="text-xl sm:text-2xl font-bold text-terminal">${PRICING.PRO_MONTHLY}</span>
                    <span className="text-gray-500 text-sm">/mo</span>
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
                  <span className="font-bold text-gray-100 text-base sm:text-lg">Pro Yearly</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-neon-cyan/20 text-neon-cyan rounded">
                    SAVE 43%
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
                    <span className="text-xl sm:text-2xl font-bold text-gray-100">${PRICING.PRO_YEARLY}</span>
                    <span className="text-gray-500 text-sm">/yr</span>
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
                <span className="font-bold text-gray-100 text-base sm:text-lg">Scan Pack</span>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
                    <span className="text-xl sm:text-2xl font-bold text-gray-100">${PRICING.SCAN_PACK}</span>
                    <span className="text-gray-500 text-sm"> once</span>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center">
          <button
            onClick={handleDecline}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            {discountExpired ? 'Close' : 'Come back tomorrow for free scans'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
