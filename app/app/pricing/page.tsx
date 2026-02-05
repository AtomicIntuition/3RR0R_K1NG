'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import { PaymentButton } from '@/components/PaymentButton';
import { PRICING } from '@/lib/constants';

const PRICE_IDS = {
  scanPack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID || '',
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  proYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
};

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const handleToggle = useCallback((yearly: boolean) => {
    setIsYearly(yearly);
  }, []);

  const proPrice = useMemo(
    () => (isYearly ? PRICING.PRO_YEARLY : PRICING.PRO_MONTHLY),
    [isYearly]
  );
  const monthlyEquivalent = useMemo(
    () => Math.round(PRICING.PRO_YEARLY / 12),
    []
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-5xl mx-auto">

        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 text-gray-400 text-lg">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-gray-900 rounded-full p-1 border border-gray-800">
            <button
              type="button"
              onClick={() => handleToggle(false)}
              className={clsx(
                'px-6 py-2.5 rounded-full text-sm font-medium transition-all',
                !isYearly ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => handleToggle(true)}
              className={clsx(
                'px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all',
                isYearly ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              Yearly
              <span className="px-2 py-0.5 bg-emerald-500 text-emerald-950 text-[10px] rounded-full font-bold">
                SAVE 43%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 items-stretch">

          {/* Free */}
          <div className="flex flex-col bg-gray-900 rounded-2xl border border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-50">Free</h3>
            <p className="text-sm text-gray-400 mb-6">For casual audits</p>

            <div className="min-h-[72px] flex items-end">
              <div>
                <span className="text-5xl font-bold text-gray-300">$0</span>
                <span className="text-gray-600 text-sm ml-1">/forever</span>
              </div>
            </div>

            <Link
              href="/"
              className="mt-6 block w-full py-3 text-center font-semibold rounded-xl text-sm transition-colors border border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800"
            >
              Start Free
            </Link>

            <div className="border-t border-gray-800 my-6" />

            <div className="flex-1 space-y-3">
              {[
                `${PRICING.FREE_SCANS_PER_DAY} scans per day`,
                'All 5 audit categories',
                'AI-powered analysis',
                'Shareable reports',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-500">
                  <Check className="w-4 h-4 text-gray-600 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
              <span className="px-4 py-1 bg-emerald-500 text-emerald-950 text-xs font-bold rounded-full uppercase tracking-wide">
                Most Popular
              </span>
            </div>
            <div className="flex-1 flex flex-col p-px rounded-2xl bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-gray-800/40">
              <div className="flex-1 flex flex-col bg-gray-900 rounded-[15px] p-8">
                <h3 className="text-lg font-semibold text-white pt-1">Pro</h3>
                <p className="text-sm text-gray-400 mb-6">For serious developers</p>

                <div className="min-h-[72px] flex flex-col justify-end">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isYearly ? 'y' : 'm'}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <span className="text-5xl font-bold text-white">${proPrice}</span>
                      <span className="text-gray-500 text-sm ml-1">/{isYearly ? 'yr' : 'mo'}</span>
                    </motion.div>
                  </AnimatePresence>
                  <p className={clsx(
                    'text-xs font-medium mt-1 h-4',
                    isYearly ? 'text-emerald-400' : 'text-transparent'
                  )}>
                    {isYearly ? `$${monthlyEquivalent}/mo billed yearly` : '\u00A0'}
                  </p>
                </div>

                <div className="mt-6">
                  <PaymentButton
                    priceId={isYearly ? PRICE_IDS.proYearly : PRICE_IDS.proMonthly}
                    mode="subscription"
                    label="Go Pro"
                    className="[&_button]:bg-emerald-500 [&_button]:text-emerald-950 [&_button]:font-semibold [&_button]:hover:bg-emerald-400 [&_button]:rounded-xl [&_button]:py-3 [&_button]:text-sm"
                  />
                </div>

                <div className="border-t border-gray-800 my-6" />

                <div className="flex-1 space-y-3">
                  {[
                    `${PRICING.PRO_SCANS_PER_MONTH} scans/month`,
                    'Priority queue (2x faster)',
                    'Monitor 5 sites daily',
                    'Score drop alerts',
                    'API access + CLI',
                    'Full scan history',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scan Pack */}
          <div className="flex flex-col bg-gray-900 rounded-2xl border border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-50">Scan Pack</h3>
            <p className="text-sm text-gray-400 mb-6">For agencies &amp; teams</p>

            <div className="min-h-[72px] flex items-end">
              <div>
                <span className="text-5xl font-bold text-white">${PRICING.SCAN_PACK}</span>
                <span className="text-gray-600 text-sm ml-1">/one-time</span>
              </div>
            </div>

            <div className="mt-6">
              <PaymentButton
                priceId={PRICE_IDS.scanPack}
                mode="payment"
                label="Buy Pack"
                className="[&_button]:bg-transparent [&_button]:text-emerald-400 [&_button]:font-semibold [&_button]:border [&_button]:border-emerald-500/50 [&_button]:hover:bg-emerald-500/10 [&_button]:rounded-xl [&_button]:py-3 [&_button]:text-sm"
              />
            </div>

            <div className="border-t border-gray-800 my-6" />

            <div className="flex-1 space-y-3">
              {[
                `${PRICING.SCAN_PACK_SCANS} scans (never expire)`,
                'All Pro features',
                'Perfect for client audits',
                'Stackable packs',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust line */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Cancel anytime. No hidden fees.
        </p>

      </div>
    </div>
  );
}
