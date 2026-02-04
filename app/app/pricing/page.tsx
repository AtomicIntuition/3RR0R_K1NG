'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { PaymentButton } from '@/components/PaymentButton';
import { PRICING } from '@/lib/constants';

const PRICE_IDS = {
  scanPack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID || '',
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  proYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
};

const FAQ_DATA = [
  { q: 'What counts as a scan?', a: 'Each URL you submit counts as one scan. Monitored sites use scans from your monthly allocation.' },
  { q: 'How does site monitoring work?', a: 'Pro users can add up to 5 websites for automated daily scans. We email you if your score drops.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your account settings and keep Pro access until the end of your billing period.' },
  { q: 'Do scan packs expire?', a: 'Never. Scan packs are yours forever and stack if you buy multiple.' },
  { q: 'Can I use the CLI without Pro?', a: 'Yes! The CLI (npm, Homebrew, Cargo) works for everyone. Pro gives you more scans and priority processing.' },
];

const PRO_FEATURES = [
  { icon: '⚡', title: '200 Scans/Month', desc: 'Audit your entire portfolio' },
  { icon: '🚀', title: 'Priority Queue', desc: '2x faster results' },
  { icon: '📊', title: 'Site Monitoring', desc: '5 sites with daily scans' },
  { icon: '🔔', title: 'Score Alerts', desc: 'Email when scores drop' },
  { icon: '🔑', title: 'API Access', desc: 'Integrate into your workflow' },
  { icon: '📈', title: 'Scan History', desc: 'Track progress over time' },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleToggle = useCallback((isYear: boolean) => {
    setIsYearly(isYear);
  }, []);

  const proPrice = useMemo(() => isYearly ? PRICING.PRO_YEARLY : PRICING.PRO_MONTHLY, [isYearly]);
  const monthlyEquivalent = useMemo(() => Math.round(PRICING.PRO_YEARLY / 12), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-white font-bold text-sm">Trusted by 1,000+ developers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
            Level Up Your Stack
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Free gets you started. Pro makes you unstoppable.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-white/10 backdrop-blur rounded-2xl p-1.5 border border-white/20">
            <button
              type="button"
              onClick={() => handleToggle(false)}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                !isYearly
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => handleToggle(true)}
              className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                isYearly
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-bold">
                -43%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 mb-1">Free</h3>
              <p className="text-gray-500 text-sm">For casual audits</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-black text-gray-300">$0</span>
              <span className="text-gray-400 ml-2">/forever</span>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                `${PRICING.FREE_SCANS_PER_DAY} scans per day`,
                'All 5 audit categories',
                'AI-powered analysis',
                'Shareable reports',
                'Basic scan history',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="block w-full py-4 text-center bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 hover:-translate-y-0.5 transition-all"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Plan - Featured */}
          <div className="relative bg-gray-900 rounded-3xl shadow-2xl p-8 md:-mt-4 md:mb-4">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-6 py-2 bg-amber-400 text-amber-900 text-sm font-black rounded-full shadow-lg">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6 pt-4">
              <h3 className="text-xl font-black text-white mb-1">Pro</h3>
              <p className="text-white/70 text-sm">For serious developers</p>
            </div>

            <div className="mb-2">
              <span className="text-5xl font-black text-white">${proPrice}</span>
              <span className="text-white/70 ml-2">/{isYearly ? 'yr' : 'mo'}</span>
            </div>
            {isYearly && (
              <p className="text-emerald-300 text-sm font-bold mb-6">
                ${monthlyEquivalent}/mo billed yearly
              </p>
            )}
            {!isYearly && <div className="mb-6" />}

            <ul className="space-y-4 mb-8">
              {[
                `${PRICING.PRO_SCANS_PER_MONTH} scans per month`,
                'Priority queue (2x faster)',
                'Monitor 5 sites daily',
                'Score drop email alerts',
                'API access + CLI',
                'Full scan history',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-white">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <PaymentButton
              priceId={isYearly ? PRICE_IDS.proYearly : PRICE_IDS.proMonthly}
              mode="subscription"
              label="Go Pro"
              className="[&_button]:bg-white [&_button]:text-indigo-600 [&_button]:hover:bg-gray-100 [&_button]:shadow-xl"
            />
            <p className="text-white/50 text-xs text-center mt-4">Cancel anytime</p>
          </div>

          {/* Scan Pack */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 mb-1">Scan Pack</h3>
              <p className="text-gray-500 text-sm">For agencies & teams</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-black text-emerald-600">${PRICING.SCAN_PACK}</span>
              <span className="text-gray-400 ml-2">/once</span>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                `${PRICING.SCAN_PACK_SCANS} scans (never expire)`,
                'All Pro features',
                'Perfect for client audits',
                'Bulk site scanning',
                'No subscription needed',
                'Stackable packs',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <PaymentButton
              priceId={PRICE_IDS.scanPack}
              mode="payment"
              label="Buy Pack"
              className="[&_button]:bg-emerald-600 [&_button]:hover:bg-emerald-700"
            />
          </div>
        </div>
      </div>

      {/* Pro Features Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-12">
          Everything in Pro
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRO_FEATURES.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 text-2xl">
                {feature.icon}
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-12">
          Compare Plans
        </h2>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-5 px-6 text-gray-500 font-bold">Feature</th>
                <th className="text-center py-5 px-6 text-gray-500 font-bold w-28">Free</th>
                <th className="text-center py-5 px-6 font-black w-28 bg-gray-900 text-white">Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Monthly Scans', free: '~90', pro: '200' },
                { feature: 'Priority Queue', free: false, pro: true },
                { feature: 'Site Monitoring', free: false, pro: '5 sites' },
                { feature: 'Daily Auto-Scans', free: false, pro: true },
                { feature: 'Score Alerts', free: false, pro: true },
                { feature: 'API Access', free: false, pro: true },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-4 px-6 text-gray-700 font-medium">{row.feature}</td>
                  <td className="text-center py-4 px-6">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <svg className="w-5 h-5 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )
                    ) : (
                      <span className="text-gray-400">{row.free}</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-6 bg-indigo-50">
                    {typeof row.pro === 'boolean' ? (
                      <svg className="w-5 h-5 text-indigo-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-indigo-600 font-bold">{row.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-900 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {FAQ_DATA.map((item, i) => (
              <div
                key={i}
                className={`bg-white/5 backdrop-blur rounded-2xl border transition-all ${
                  openFaq === i ? 'border-indigo-500' : 'border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-bold text-white">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-white/50 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`grid transition-all ${openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-white/60">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Questions?</h2>
          <p className="text-gray-500 mb-6">We&apos;re here to help with any questions about pricing or features.</p>
          <a
            href="mailto:support@crisp.dev"
            className="inline-block px-8 py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
