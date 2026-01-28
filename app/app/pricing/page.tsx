'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlitchText } from '@/components/GlitchText';
import { PaymentButton } from '@/components/PaymentButton';
import { ExitIntentModal } from '@/components/ExitIntentModal';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/ScrollReveal';
import { PRICING } from '@/lib/constants';

// Price IDs from environment
const PRICE_IDS = {
  scanPack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID || '',
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  proYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
};

// Feature categories for Pro
const PRO_FEATURES = [
  {
    icon: '⚡',
    title: '200 Scans/Month',
    description: 'Audit your entire portfolio regularly',
  },
  {
    icon: '🚀',
    title: 'Priority Queue',
    description: 'Skip the line, get results faster',
  },
  {
    icon: '📊',
    title: 'Site Monitoring',
    description: 'Track 5 sites with daily automated scans',
  },
  {
    icon: '📧',
    title: 'Score Alerts',
    description: 'Get notified when scores drop',
  },
  {
    icon: '🔑',
    title: 'API Access',
    description: 'Integrate scans into your workflow',
  },
  {
    icon: '📜',
    title: 'Scan History',
    description: 'Track progress over time',
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const yearlyPrice = PRICING.PRO_YEARLY;
  const monthlyPrice = PRICING.PRO_MONTHLY;
  const yearlySavings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-terminal/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[200px]" />
      </div>

      <div className="pt-4 pb-16 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-terminal/10 border border-terminal/30 rounded-full text-sm mb-6"
              >
                <span className="w-2 h-2 bg-terminal rounded-full animate-pulse" />
                <span className="text-terminal font-medium">Trusted by 1,000+ developers</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                <GlitchText
                  text="Level Up Your Stack"
                  className="text-gray-100"
                  glitchIntensity="low"
                  as="span"
                />
              </h1>

              <p className="text-lg text-gray-400 max-w-xl mx-auto">
                Free gets you started. Pro makes you unstoppable.
              </p>
            </div>
          </ScrollReveal>

          {/* Billing Toggle */}
          <ScrollReveal delay={0.1}>
            <div className="flex justify-center mb-12">
              <div className="relative inline-flex items-center p-1.5 bg-void-50/80 backdrop-blur rounded-xl border border-void-100">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    billingPeriod === 'monthly'
                      ? 'bg-terminal text-void shadow-lg shadow-terminal/25'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    billingPeriod === 'yearly'
                      ? 'bg-terminal text-void shadow-lg shadow-terminal/25'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Yearly
                  <span className="ml-2 px-2 py-0.5 text-xs bg-neon-cyan/20 text-neon-cyan rounded-full">
                    Save {yearlySavings}%
                  </span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-20">
            {/* Free Tier */}
            <ScrollReveal delay={0.1}>
              <div className="relative h-full p-6 sm:p-8 rounded-2xl border border-void-100 bg-void-50/50 backdrop-blur transition-all duration-300 hover:border-void-200 group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-100 mb-1">Free</h3>
                  <p className="text-sm text-gray-500 mb-6">For casual audits</p>

                  <div className="mb-8">
                    <span className="text-5xl font-bold text-gray-300">$0</span>
                    <span className="text-gray-500 ml-2">/forever</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      `${PRICING.FREE_SCANS_PER_DAY} scans per day`,
                      'All 5 audit categories',
                      'AI-powered roasts',
                      'Shareable reports',
                      'Basic scan history',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                        <span className="text-gray-500 mt-0.5 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/"
                    className="block w-full px-6 py-4 font-bold rounded-xl text-center transition-all duration-300 bg-void-100 text-gray-300 hover:bg-void-200 hover:text-gray-100 border border-void-100 hover:border-void-200"
                  >
                    Start Free
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Pro Subscription - Featured */}
            <ScrollReveal delay={0.2}>
              <div className="relative h-full">
                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-terminal to-neon-cyan text-void text-xs font-bold rounded-full shadow-lg shadow-terminal/25">
                    MOST POPULAR
                  </span>
                </div>

                {/* Glow effect */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-terminal/50 via-terminal/20 to-neon-cyan/50 blur-sm" />

                <div className="relative h-full p-6 sm:p-8 rounded-2xl border border-terminal/50 bg-void/90 backdrop-blur">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-terminal/10 to-transparent" />

                  <div className="relative">
                    <h3 className="text-xl font-bold text-terminal mb-1">Pro</h3>
                    <p className="text-sm text-gray-400 mb-6">For serious developers</p>

                    <div className="mb-8">
                      <span className="text-5xl font-bold text-terminal">
                        ${billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice}
                      </span>
                      <span className="text-gray-500 ml-2">
                        /{billingPeriod === 'monthly' ? 'month' : 'year'}
                      </span>
                      {billingPeriod === 'yearly' && (
                        <p className="text-sm text-neon-cyan mt-2">
                          Just ${Math.round(yearlyPrice / 12)}/mo billed annually
                        </p>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8">
                      {[
                        `${PRICING.PRO_SCANS_PER_MONTH} scans per month`,
                        'Priority queue (2x faster)',
                        'Monitor 5 sites daily',
                        'Score drop alerts',
                        'API access + CLI',
                        'Full scan history',
                        'Multiple roast personas',
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                          <span className="text-terminal mt-0.5 flex-shrink-0">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <PaymentButton
                      priceId={billingPeriod === 'monthly' ? PRICE_IDS.proMonthly : PRICE_IDS.proYearly}
                      mode="subscription"
                      label="Go Pro"
                    />

                    <p className="text-xs text-gray-500 text-center mt-3">
                      Cancel anytime. No questions asked.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Scan Pack */}
            <ScrollReveal delay={0.3}>
              <div className="relative h-full p-6 sm:p-8 rounded-2xl border border-void-100 bg-void-50/50 backdrop-blur transition-all duration-300 hover:border-neon-cyan/30 group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-100 mb-1">Scan Pack</h3>
                  <p className="text-sm text-gray-500 mb-6">For agencies & teams</p>

                  <div className="mb-8">
                    <span className="text-5xl font-bold text-neon-cyan">${PRICING.SCAN_PACK}</span>
                    <span className="text-gray-500 ml-2">/one-time</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      `${PRICING.SCAN_PACK_SCANS} scans (never expire)`,
                      'All Pro features included',
                      'Perfect for client audits',
                      'Bulk site scanning',
                      'No recurring charges',
                      'Stackable packs',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                        <span className="text-neon-cyan mt-0.5 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <PaymentButton
                    priceId={PRICE_IDS.scanPack}
                    mode="payment"
                    label="Buy Pack"
                    className="[&_button]:bg-gradient-to-r [&_button]:from-neon-cyan [&_button]:to-neon-cyan/80"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Pro Features Grid */}
          <ScrollReveal>
            <div className="mb-20">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
                <span className="text-terminal">&gt;</span> Everything in Pro
              </h2>
              <p className="text-gray-400 text-center mb-10 max-w-lg mx-auto">
                Built for developers who ship fast and break things (then fix them with our audits)
              </p>

              <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
                {PRO_FEATURES.map((feature) => (
                  <StaggerItem key={feature.title}>
                    <div className="p-5 rounded-xl bg-void-50/50 border border-void-100 hover:border-terminal/30 transition-all duration-300 group">
                      <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform origin-left">
                        {feature.icon}
                      </span>
                      <h3 className="font-bold text-gray-100 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </ScrollReveal>

          {/* Comparison Table */}
          <ScrollReveal>
            <div className="mb-20">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
                <span className="text-terminal">&gt;</span> Compare Plans
              </h2>

              <div className="overflow-x-auto rounded-xl border border-void-100 bg-void-50/50 backdrop-blur">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-void-100 bg-void/50">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
                      <th className="text-center py-4 px-6 text-gray-400 font-medium w-28">Free</th>
                      <th className="text-center py-4 px-6 text-terminal font-bold w-28 bg-terminal/5">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Monthly Scans', free: '~90/mo', pro: '200/mo', highlight: true },
                      { feature: 'All Audit Categories', free: '✓', pro: '✓' },
                      { feature: 'AI Roasts', free: '✓', pro: '✓' },
                      { feature: 'Shareable Reports', free: '✓', pro: '✓' },
                      { feature: 'Priority Queue', free: '—', pro: '✓', highlight: true },
                      { feature: 'Site Monitoring', free: '—', pro: '5 sites', highlight: true },
                      { feature: 'Daily Auto-Scans', free: '—', pro: '✓', highlight: true },
                      { feature: 'Score Drop Alerts', free: '—', pro: '✓', highlight: true },
                      { feature: 'API Access', free: '—', pro: '✓' },
                      { feature: 'Full Scan History', free: '—', pro: '✓' },
                      { feature: 'Roast Personas', free: '1', pro: 'All' },
                    ].map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-void-100/50 ${row.highlight ? 'bg-terminal/5' : ''}`}
                      >
                        <td className="py-4 px-6 text-gray-300">
                          {row.feature}
                          {row.highlight && (
                            <span className="ml-2 text-xs text-terminal">★</span>
                          )}
                        </td>
                        <td className="text-center py-4 px-6 text-gray-500">{row.free}</td>
                        <td className="text-center py-4 px-6 text-terminal font-medium bg-terminal/5">
                          {row.pro}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>

          {/* FAQ Section */}
          <ScrollReveal>
            <div className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
                <span className="text-terminal">&gt;</span> FAQ
              </h2>

              <div className="max-w-2xl mx-auto space-y-3">
                {[
                  {
                    q: 'What counts as a scan?',
                    a: 'Each URL you submit for auditing counts as one scan. Re-scanning the same URL after making changes uses another scan. Monitored sites use scans from your monthly allocation.',
                  },
                  {
                    q: 'How does site monitoring work?',
                    a: 'Pro users can add up to 5 websites for automated daily scans. We\'ll run a full audit every day and alert you via email if your score drops below your threshold.',
                  },
                  {
                    q: 'Can I cancel my subscription?',
                    a: 'Yes, cancel anytime from your account settings. You\'ll keep Pro access until the end of your billing period. No questions, no hassle.',
                  },
                  {
                    q: 'Do scan packs expire?',
                    a: 'Never. Scan packs are yours forever. Use them whenever you need them, and they stack if you buy multiple.',
                  },
                  {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major credit cards, Apple Pay, and Google Pay through Stripe. All payments are secure and encrypted.',
                  },
                  {
                    q: 'Can I use the CLI without Pro?',
                    a: 'Yes! The CLI (npm, Homebrew, Cargo) works for everyone. Pro just gives you more scans and priority processing.',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-void-100 bg-void-50/50 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-void-100/30 transition-colors"
                    >
                      <span className="font-medium text-gray-100">{item.q}</span>
                      <motion.span
                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                        className="text-terminal flex-shrink-0 ml-4"
                      >
                        ▼
                      </motion.span>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: openFaq === i ? 'auto' : 0,
                        opacity: openFaq === i ? 1 : 0,
                      }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal>
            <div className="text-center">
              <div className="inline-block p-8 rounded-2xl bg-gradient-to-b from-terminal/10 to-transparent border border-terminal/20">
                <p className="text-gray-400 mb-2">Still have questions?</p>
                <a
                  href="mailto:support@3rrork1ng.com"
                  className="text-terminal hover:text-terminal-bright transition-colors font-medium"
                >
                  support@3rrork1ng.com
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Exit Intent Modal */}
      <ExitIntentModal discountPriceId={PRICE_IDS.proMonthly} />
    </div>
  );
}
