'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
import { Check, Minus } from 'lucide-react';
import { PaymentButton } from '@/components/PaymentButton';
import { PRICING } from '@/lib/constants';

const PRICE_IDS = {
  scanPack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID || '',
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  proYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
};

function FeatureRow({ label, free, pro }: { label: string; free: string | boolean; pro: string | boolean }) {
  return (
    <div className="grid grid-cols-[1fr_72px_72px] items-center py-2.5 border-b border-gray-800/50 last:border-0 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-center">
        {typeof free === 'boolean' ? (
          free ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <Minus className="w-3.5 h-3.5 text-gray-700 mx-auto" />
        ) : (
          <span className="text-gray-500">{free}</span>
        )}
      </span>
      <span className="text-center">
        {typeof pro === 'boolean' ? (
          <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
        ) : (
          <span className="text-emerald-400 font-medium">{pro}</span>
        )}
      </span>
    </div>
  );
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

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
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 pb-12">
      <div className="w-full max-w-5xl mx-auto">

        {/* Header + Toggle */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-50 tracking-tight mb-3">
            Pricing
          </h1>
          <p className="text-gray-400 mb-6">
            Free gets you started. Pro makes you unstoppable.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-gray-900 rounded-lg p-1 border border-gray-800">
            <button
              type="button"
              onClick={() => handleToggle(false)}
              className={clsx(
                'px-5 py-2 rounded-md text-sm font-medium transition-all',
                !isYearly ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => handleToggle(true)}
              className={clsx(
                'px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all',
                isYearly ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              Yearly
              <span className="px-1.5 py-0.5 bg-emerald-500 text-emerald-950 text-[10px] rounded-full font-bold">
                -43%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4 items-start">

          {/* Free */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-50 mb-0.5">Free</h3>
            <p className="text-gray-500 text-xs mb-5">For casual audits</p>

            <div className="mb-5">
              <span className="text-4xl font-black text-gray-400">$0</span>
              <span className="text-gray-600 text-sm ml-1">/forever</span>
            </div>

            <Link
              href="/"
              className="block w-full py-3 text-center bg-gray-800 text-gray-200 font-semibold rounded-xl text-sm hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Start Free
            </Link>

            <div className="mt-5 space-y-2.5">
              {[
                `${PRICING.FREE_SCANS_PER_DAY} scans/day`,
                'All 5 audit categories',
                'AI-powered analysis',
                'Shareable reports',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-500">
                  <Check className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="px-4 py-1 bg-emerald-500 text-emerald-950 text-[10px] font-bold rounded-full uppercase tracking-wide">
                Popular
              </span>
            </div>
            <div className="p-px rounded-2xl bg-gradient-to-b from-emerald-500/40 to-gray-800/40">
              <div className="bg-gray-900 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-0.5 pt-2">Pro</h3>
                <p className="text-gray-400 text-xs mb-5">For serious developers</p>

                <div className="mb-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly ? 'y' : 'm'}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex items-baseline"
                    >
                      <span className="text-4xl font-black text-white">${proPrice}</span>
                      <span className="text-gray-500 text-sm ml-1">/{isYearly ? 'yr' : 'mo'}</span>
                    </motion.span>
                  </AnimatePresence>
                </div>
                {isYearly && (
                  <p className="text-emerald-400 text-xs font-medium mb-5">
                    ${monthlyEquivalent}/mo billed yearly
                  </p>
                )}
                {!isYearly && <div className="mb-5" />}

                <PaymentButton
                  priceId={isYearly ? PRICE_IDS.proYearly : PRICE_IDS.proMonthly}
                  mode="subscription"
                  label="Go Pro"
                  className="[&_button]:bg-emerald-500 [&_button]:text-emerald-950 [&_button]:hover:bg-emerald-400"
                />

                <div className="mt-5 space-y-2.5">
                  {[
                    `${PRICING.PRO_SCANS_PER_MONTH} scans/month`,
                    'Priority queue (2x faster)',
                    'Monitor 5 sites daily',
                    'Score drop alerts',
                    'API access + CLI',
                    'Full scan history',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scan Pack */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-50 mb-0.5">Scan Pack</h3>
            <p className="text-gray-500 text-xs mb-5">For agencies & teams</p>

            <div className="mb-5">
              <span className="text-4xl font-black text-emerald-400">${PRICING.SCAN_PACK}</span>
              <span className="text-gray-600 text-sm ml-1">/once</span>
            </div>

            <PaymentButton
              priceId={PRICE_IDS.scanPack}
              mode="payment"
              label="Buy Pack"
              className="[&_button]:bg-emerald-500 [&_button]:text-emerald-950 [&_button]:hover:bg-emerald-400"
            />

            <div className="mt-5 space-y-2.5">
              {[
                `${PRICING.SCAN_PACK_SCANS} scans (never expire)`,
                'All Pro features',
                'Perfect for client audits',
                'Stackable packs',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compact comparison */}
        <div className="mt-10 max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
          <div className="grid grid-cols-[1fr_72px_72px] items-center pb-2.5 border-b border-gray-800 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Compare</span>
            <span className="text-xs font-medium text-gray-500 text-center">Free</span>
            <span className="text-xs font-medium text-emerald-400 text-center">Pro</span>
          </div>
          <FeatureRow label="Monthly scans" free="~90" pro="200" />
          <FeatureRow label="Priority queue" free={false} pro={true} />
          <FeatureRow label="Site monitoring" free={false} pro="5 sites" />
          <FeatureRow label="Score alerts" free={false} pro={true} />
          <FeatureRow label="API access" free={false} pro={true} />
        </div>

      </div>
    </div>
  );
}
