'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface PaymentButtonProps {
  priceId: string;
  mode: 'payment' | 'subscription';
  label: string;
  description?: string;
  className?: string;
}

export function PaymentButton({
  priceId,
  mode,
  label,
  description,
  className,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={clsx(
          'w-full px-6 py-4 font-bold rounded transition-all duration-200',
          'bg-gradient-to-r from-terminal to-neon-cyan text-void',
          'hover:from-terminal-bright hover:to-neon-cyan',
          'hover:shadow-lg hover:shadow-terminal/25',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed'
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
          label
        )}
      </button>

      {description && (
        <p className="mt-2 text-xs text-gray-500 text-center">{description}</p>
      )}

      {error && (
        <p className="mt-2 text-xs text-danger text-center">{error}</p>
      )}
    </div>
  );
}

// Pricing card component
interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  features: string[];
  priceId: string;
  mode: 'payment' | 'subscription';
  popular?: boolean;
  className?: string;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  priceId,
  mode,
  popular,
  className,
}: PricingCardProps) {
  return (
    <div
      className={clsx(
        'relative p-6 rounded-lg border',
        popular
          ? 'border-terminal bg-terminal/5'
          : 'border-void-100 bg-void-50',
        className
      )}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-terminal text-void text-xs font-bold rounded-full">
          POPULAR
        </span>
      )}

      <h3 className="text-xl font-bold text-gray-100 mb-2">{name}</h3>

      <div className="mb-6">
        <span className="text-4xl font-bold text-terminal">{price}</span>
        {period && <span className="text-gray-500 ml-1">/{period}</span>}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
            <span className="text-terminal mt-0.5">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <PaymentButton
        priceId={priceId}
        mode={mode}
        label={mode === 'subscription' ? 'Subscribe' : 'Buy Now'}
      />
    </div>
  );
}
