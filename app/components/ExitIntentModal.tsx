'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { GlitchText } from './GlitchText';
import { PRICING } from '@/lib/constants';
import { wasExitIntentShown, setExitIntentShown } from '@/lib/conversion-tracking';
import { useAuth } from '@/lib/auth-context';
import clsx from 'clsx';

interface ExitIntentModalProps {
  /** Price ID for the discounted monthly plan */
  discountPriceId?: string;
}

export function ExitIntentModal({ discountPriceId }: ExitIntentModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  // Handle mouse leave detection
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse leaves toward the top of the page (closing intent)
    if (e.clientY <= 0 && !wasExitIntentShown()) {
      setIsOpen(true);
      setExitIntentShown();
      // Remove listener after showing once
      document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, []);

  useEffect(() => {
    // Don't add listener if already shown
    if (wasExitIntentShown()) return;

    // Small delay before enabling exit intent detection
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000); // Wait 3 seconds before enabling

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClaimOffer = async () => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setIsLoading(true);

    try {
      // Use the regular monthly price with exit intent coupon applied
      const priceId = discountPriceId || process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode: 'subscription',
          applyExitDiscount: true, // This triggers the coupon
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?redirect=/pricing');
          return;
        }
        throw new Error(data.error || 'Checkout failed');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDecline}
      showCloseButton={false}
      closeOnOutsideClick={false}
      closeOnEscape={true}
      className="max-w-md"
    >
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-terminal/10 via-transparent to-neon-cyan/10 animate-pulse" />

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-danger/20 text-danger text-xs font-bold rounded-full mb-4 animate-pulse">
              WAIT — EXCLUSIVE OFFER
            </div>

            <h2 className="text-3xl font-bold text-gray-100 mb-3">
              <GlitchText
                text="Don't leave yet!"
                glitchIntensity="medium"
                as="span"
              />
            </h2>

            <p className="text-gray-400">
              Get your first month of Pro for just
            </p>
          </div>

          {/* Price display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-2xl text-gray-500 line-through">
                ${PRICING.PRO_MONTHLY}
              </span>
              <span className="text-5xl font-bold text-terminal">
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
          <div className="bg-void-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 font-medium mb-3">What you get:</p>
            <ul className="space-y-2">
              {[
                `${PRICING.PRO_SCANS_PER_MONTH} scans per month`,
                'Priority queue (faster results)',
                'Full security, SEO & accessibility audits',
                'Scan history saved to account',
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
          <div className="text-center mb-6">
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

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleClaimOffer}
              disabled={isLoading}
              className={clsx(
                'w-full px-6 py-4 font-bold rounded-lg transition-all duration-200',
                'bg-gradient-to-r from-terminal to-neon-cyan text-void',
                'hover:from-terminal-bright hover:to-neon-cyan',
                'hover:shadow-lg hover:shadow-terminal/25',
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
                  Processing...
                </span>
              ) : (
                'Claim My Discount'
              )}
            </button>

            <button
              onClick={handleDecline}
              className="w-full px-6 py-3 text-gray-500 hover:text-gray-400 transition-colors text-sm"
            >
              No thanks, I&apos;ll pay full price later
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
