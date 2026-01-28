'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlitchText } from '@/components/GlitchText';
import { PaymentButton } from '@/components/PaymentButton';
import { ExitIntentModal } from '@/components/ExitIntentModal';
import { PRICING } from '@/lib/constants';

const PRICE_IDS = {
  scanPack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID || '',
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  proYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
};

const PRO_FEATURES = [
  { icon: '⚡', title: '200 Scans/Month', description: 'Audit your entire portfolio' },
  { icon: '🚀', title: 'Priority Queue', description: '2x faster results' },
  { icon: '📊', title: 'Site Monitoring', description: '5 sites with daily scans' },
  { icon: '📧', title: 'Score Alerts', description: 'Email when scores drop' },
  { icon: '🔑', title: 'API Access', description: 'Integrate into your workflow' },
  { icon: '📜', title: 'Scan History', description: 'Track progress over time' },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const yearlyPrice = PRICING.PRO_YEARLY;
  const monthlyPrice = PRICING.PRO_MONTHLY;

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-terminal/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[150px]" />
      </div>

      <div className="pt-8 pb-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal/10 border border-terminal/30 rounded-full text-sm mb-6">
              <span className="w-2 h-2 bg-terminal rounded-full animate-pulse" />
              <span className="text-terminal font-medium">Trusted by 1,000+ developers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <GlitchText text="Level Up Your Stack" className="text-gray-100" glitchIntensity="low" as="span" />
            </h1>

            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Free gets you started. Pro makes you unstoppable.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-1 p-1 bg-void-50 rounded-xl border border-void-100">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-terminal text-void'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-terminal text-void'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Yearly
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  billingPeriod === 'yearly'
                    ? 'bg-void/30 text-void'
                    : 'bg-neon-cyan/20 text-neon-cyan'
                }`}>
                  -43%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {/* Free */}
            <div className="p-6 sm:p-8 rounded-2xl border border-void-100 bg-void-50/80">
              <h3 className="text-xl font-bold text-gray-100 mb-1">Free</h3>
              <p className="text-sm text-gray-500 mb-6">For casual audits</p>

              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-300">$0</span>
                <span className="text-gray-500 ml-2">/forever</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  `${PRICING.FREE_SCANS_PER_DAY} scans per day`,
                  'All 5 audit categories',
                  'AI-powered roasts',
                  'Shareable reports',
                  'Basic scan history',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-gray-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/"
                className="block w-full py-4 font-bold rounded-xl text-center bg-void-100 text-gray-300 hover:bg-void-200 hover:text-gray-100 transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative p-6 sm:p-8 rounded-2xl border-2 border-terminal bg-gradient-to-b from-terminal/10 to-void-50/80">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-terminal text-void text-xs font-bold rounded-full">
                  MOST POPULAR
                </span>
              </div>

              <h3 className="text-xl font-bold text-terminal mb-1">Pro</h3>
              <p className="text-sm text-gray-400 mb-6">For serious developers</p>

              <div className="mb-8">
                <span className="text-5xl font-bold text-terminal">
                  ${billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice}
                </span>
                <span className="text-gray-500 ml-2">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-neon-cyan mt-1">${Math.round(yearlyPrice / 12)}/mo billed yearly</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  `${PRICING.PRO_SCANS_PER_MONTH} scans per month`,
                  'Priority queue (2x faster)',
                  'Monitor 5 sites daily',
                  'Score drop email alerts',
                  'API access + CLI',
                  'Full scan history',
                  'Multiple roast personas',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-200">
                    <span className="text-terminal">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <PaymentButton
                priceId={billingPeriod === 'monthly' ? PRICE_IDS.proMonthly : PRICE_IDS.proYearly}
                mode="subscription"
                label="Go Pro"
              />
              <p className="text-xs text-gray-500 text-center mt-3">Cancel anytime</p>
            </div>

            {/* Scan Pack */}
            <div className="p-6 sm:p-8 rounded-2xl border border-void-100 bg-void-50/80">
              <h3 className="text-xl font-bold text-gray-100 mb-1">Scan Pack</h3>
              <p className="text-sm text-gray-500 mb-6">For agencies & teams</p>

              <div className="mb-8">
                <span className="text-5xl font-bold text-neon-cyan">${PRICING.SCAN_PACK}</span>
                <span className="text-gray-500 ml-2">/once</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  `${PRICING.SCAN_PACK_SCANS} scans (never expire)`,
                  'All Pro features',
                  'Perfect for client audits',
                  'Bulk site scanning',
                  'No subscription needed',
                  'Stackable packs',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-neon-cyan">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <PaymentButton
                priceId={PRICE_IDS.scanPack}
                mode="payment"
                label="Buy Pack"
                className="[&_button]:from-neon-cyan [&_button]:to-neon-cyan"
              />
            </div>
          </div>

          {/* Pro Features */}
          <div className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
              <span className="text-terminal">&gt;</span> Everything in Pro
            </h2>
            <p className="text-gray-500 text-center mb-10">
              Built for developers who ship fast
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRO_FEATURES.map((feature) => (
                <div key={feature.title} className="p-5 rounded-xl bg-void-50 border border-void-100 hover:border-terminal/30 transition-colors">
                  <span className="text-2xl mb-3 block">{feature.icon}</span>
                  <h3 className="font-bold text-gray-100 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              <span className="text-terminal">&gt;</span> Compare Plans
            </h2>

            <div className="overflow-x-auto rounded-xl border border-void-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-void-100 bg-void-50">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-medium w-24">Free</th>
                    <th className="text-center py-4 px-6 text-terminal font-bold w-24 bg-terminal/5">Pro</th>
                  </tr>
                </thead>
                <tbody className="bg-void/30">
                  {[
                    { feature: 'Monthly Scans', free: '~90', pro: '200' },
                    { feature: 'All Audit Categories', free: '✓', pro: '✓' },
                    { feature: 'AI Roasts', free: '✓', pro: '✓' },
                    { feature: 'Priority Queue', free: '—', pro: '✓' },
                    { feature: 'Site Monitoring', free: '—', pro: '5 sites' },
                    { feature: 'Daily Auto-Scans', free: '—', pro: '✓' },
                    { feature: 'Score Alerts', free: '—', pro: '✓' },
                    { feature: 'API Access', free: '—', pro: '✓' },
                    { feature: 'Full History', free: '—', pro: '✓' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-void-100/50">
                      <td className="py-3 px-6 text-gray-300">{row.feature}</td>
                      <td className="text-center py-3 px-6 text-gray-500">{row.free}</td>
                      <td className="text-center py-3 px-6 text-terminal bg-terminal/5">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              <span className="text-terminal">&gt;</span> FAQ
            </h2>

            <div className="max-w-2xl mx-auto space-y-2">
              {[
                {
                  q: 'What counts as a scan?',
                  a: 'Each URL you submit counts as one scan. Re-scanning the same URL uses another scan. Monitored sites use scans from your monthly allocation.',
                },
                {
                  q: 'How does site monitoring work?',
                  a: 'Pro users can add up to 5 websites for automated daily scans. We run a full audit every day and email you if your score drops.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes. Cancel from your account settings and keep Pro access until the end of your billing period.',
                },
                {
                  q: 'Do scan packs expire?',
                  a: 'Never. Scan packs are yours forever and stack if you buy multiple.',
                },
                {
                  q: 'Can I use the CLI without Pro?',
                  a: 'Yes! The CLI (npm, Homebrew, Cargo) works for everyone. Pro gives you more scans and priority processing.',
                },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-void-100 bg-void-50 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-void-100/50 transition-colors"
                  >
                    <span className="font-medium text-gray-100">{item.q}</span>
                    <span className={`text-terminal transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="px-5 pb-5 text-sm text-gray-400">{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="text-center">
            <p className="text-gray-500 mb-2">Questions?</p>
            <a href="mailto:support@3rrork1ng.com" className="text-terminal hover:text-terminal-bright transition-colors">
              support@3rrork1ng.com
            </a>
          </div>
        </div>
      </div>

      <ExitIntentModal discountPriceId={PRICE_IDS.proMonthly} />
    </div>
  );
}
