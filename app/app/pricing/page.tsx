'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlitchText } from '@/components/GlitchText';
import { PricingCard } from '@/components/PaymentButton';
import { Navbar } from '@/components/Navbar';

// Price IDs from environment
const PRICE_IDS = {
  scanPack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID || '',
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  proYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
};

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <GlitchText
                text="Choose Your Arsenal"
                className="text-gray-100"
                glitchIntensity="low"
                as="span"
              />
            </h1>

            <p className="text-gray-400 max-w-lg mx-auto">
              Free scans have limits. Unlock unlimited roasting power with Pro, or grab a scan pack for occasional audits.
            </p>
          </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1 bg-void-50 rounded-lg border border-void-100">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-terminal text-void'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-terminal text-void'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-neon-cyan">Save 35%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="relative p-6 rounded-lg border border-void-100 bg-void-50">
            <h3 className="text-xl font-bold text-gray-100 mb-2">Free</h3>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-400">$0</span>
              <span className="text-gray-500 ml-1">/forever</span>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                '5 scans per hour',
                'Basic security audit',
                'Performance metrics',
                'SEO analysis',
                'Accessibility check',
                'AI-powered roasts',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-gray-500 mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="block w-full px-6 py-4 font-bold rounded text-center transition-all duration-200 bg-void-100 text-gray-300 hover:bg-void-200 hover:text-gray-100"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Subscription */}
          <PricingCard
            name="Pro"
            price={billingPeriod === 'monthly' ? '$19' : '$149'}
            period={billingPeriod === 'monthly' ? 'month' : 'year'}
            features={[
              'Unlimited scans',
              'Priority queue (faster results)',
              'Advanced security deep-dive',
              'Historical scan data',
              'Export reports as PDF',
              'API access (coming soon)',
              'Email support',
            ]}
            priceId={billingPeriod === 'monthly' ? PRICE_IDS.proMonthly : PRICE_IDS.proYearly}
            mode="subscription"
            popular={true}
          />

          {/* Scan Pack */}
          <PricingCard
            name="Scan Pack"
            price="$9.99"
            features={[
              '50 scans (one-time)',
              'Never expires',
              'All Pro features included',
              'Perfect for agencies',
              'Bulk site auditing',
              'No recurring charges',
            ]}
            priceId={PRICE_IDS.scanPack}
            mode="payment"
          />
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="text-terminal">&gt;</span> FAQ
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: 'What counts as a scan?',
                a: 'Each URL you submit for auditing counts as one scan. Re-scanning the same URL after changes uses another scan.',
              },
              {
                q: 'Can I cancel my Pro subscription?',
                a: 'Yes, cancel anytime from your account. You\'ll keep Pro access until the end of your billing period.',
              },
              {
                q: 'Do scan packs expire?',
                a: 'No! Scan packs never expire. Use them whenever you need them.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, Apple Pay, and Google Pay through Stripe.',
              },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-void-50 rounded-lg border border-void-100">
                <h3 className="font-bold text-terminal mb-2">{item.q}</h3>
                <p className="text-sm text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-4">Still have questions?</p>
            <a
              href="mailto:support@3rrork1ng.com"
              className="text-terminal hover:text-terminal-bright transition-colors"
            >
              Contact us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
