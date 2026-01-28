'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlitchText } from '@/components/GlitchText';
import { PaymentButton } from '@/components/PaymentButton';
import { PRICING } from '@/lib/constants';

const PRICE_IDS = {
  scanPack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID || '',
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  proYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
};

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-8 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal/10 border border-terminal/30 rounded-full text-sm mb-6">
            <span className="w-2 h-2 bg-terminal rounded-full" />
            <span className="text-terminal font-medium">Trusted by 1,000+ developers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <GlitchText text="Level Up Your Stack" className="text-gray-100" glitchIntensity="low" as="span" />
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Free gets you started. Pro makes you unstoppable.
          </p>
        </div>

        {/* Billing Toggle - Dead Simple */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-void-50 rounded-xl border border-void-100 p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold ${
                !isYearly ? 'bg-terminal text-void' : 'text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 ${
                isYearly ? 'bg-terminal text-void' : 'text-gray-400'
              }`}
            >
              Yearly
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                isYearly ? 'bg-void text-terminal' : 'bg-terminal/20 text-terminal'
              }`}>
                -43%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {/* Free */}
          <div className="p-8 rounded-2xl border border-void-100 bg-void-50">
            <h3 className="text-xl font-bold text-gray-100 mb-1">Free</h3>
            <p className="text-sm text-gray-500 mb-6">For casual audits</p>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gray-300">$0</span>
              <span className="text-gray-500 ml-2">/forever</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-gray-500">✓</span>
                {PRICING.FREE_SCANS_PER_DAY} scans per day
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-gray-500">✓</span>
                All 5 audit categories
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-gray-500">✓</span>
                AI-powered roasts
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-gray-500">✓</span>
                Shareable reports
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-gray-500">✓</span>
                Basic scan history
              </li>
            </ul>

            <Link
              href="/"
              className="block w-full py-4 font-bold rounded-xl text-center bg-void-100 text-gray-300 hover:bg-void-200 hover:text-gray-100"
            >
              Start Free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative p-8 rounded-2xl border-2 border-terminal bg-terminal/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-terminal text-void text-xs font-bold rounded-full">
                MOST POPULAR
              </span>
            </div>

            <h3 className="text-xl font-bold text-terminal mb-1">Pro</h3>
            <p className="text-sm text-gray-400 mb-6">For serious developers</p>

            <div className="mb-8">
              <span className="text-5xl font-bold text-terminal">
                ${isYearly ? PRICING.PRO_YEARLY : PRICING.PRO_MONTHLY}
              </span>
              <span className="text-gray-500 ml-2">/{isYearly ? 'yr' : 'mo'}</span>
              {isYearly && (
                <p className="text-sm text-neon-cyan mt-1">
                  ${Math.round(PRICING.PRO_YEARLY / 12)}/mo billed yearly
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <span className="text-terminal">✓</span>
                {PRICING.PRO_SCANS_PER_MONTH} scans per month
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <span className="text-terminal">✓</span>
                Priority queue (2x faster)
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <span className="text-terminal">✓</span>
                Monitor 5 sites daily
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <span className="text-terminal">✓</span>
                Score drop email alerts
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <span className="text-terminal">✓</span>
                API access + CLI
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <span className="text-terminal">✓</span>
                Full scan history
              </li>
            </ul>

            <PaymentButton
              priceId={isYearly ? PRICE_IDS.proYearly : PRICE_IDS.proMonthly}
              mode="subscription"
              label="Go Pro"
            />
            <p className="text-xs text-gray-500 text-center mt-3">Cancel anytime</p>
          </div>

          {/* Scan Pack */}
          <div className="p-8 rounded-2xl border border-void-100 bg-void-50">
            <h3 className="text-xl font-bold text-gray-100 mb-1">Scan Pack</h3>
            <p className="text-sm text-gray-500 mb-6">For agencies & teams</p>

            <div className="mb-8">
              <span className="text-5xl font-bold text-neon-cyan">${PRICING.SCAN_PACK}</span>
              <span className="text-gray-500 ml-2">/once</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-neon-cyan">✓</span>
                {PRICING.SCAN_PACK_SCANS} scans (never expire)
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-neon-cyan">✓</span>
                All Pro features
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-neon-cyan">✓</span>
                Perfect for client audits
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-neon-cyan">✓</span>
                Bulk site scanning
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-neon-cyan">✓</span>
                No subscription needed
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-neon-cyan">✓</span>
                Stackable packs
              </li>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            <span className="text-terminal">&gt;</span> Everything in Pro
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '⚡', title: '200 Scans/Month', desc: 'Audit your entire portfolio' },
              { icon: '🚀', title: 'Priority Queue', desc: '2x faster results' },
              { icon: '📊', title: 'Site Monitoring', desc: '5 sites with daily scans' },
              { icon: '📧', title: 'Score Alerts', desc: 'Email when scores drop' },
              { icon: '🔑', title: 'API Access', desc: 'Integrate into your workflow' },
              { icon: '📜', title: 'Scan History', desc: 'Track progress over time' },
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-xl bg-void-50 border border-void-100">
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3 className="font-bold text-gray-100 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
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
              <tbody>
                <tr className="border-b border-void-100/50">
                  <td className="py-3 px-6 text-gray-300">Monthly Scans</td>
                  <td className="text-center py-3 px-6 text-gray-500">~90</td>
                  <td className="text-center py-3 px-6 text-terminal bg-terminal/5">200</td>
                </tr>
                <tr className="border-b border-void-100/50">
                  <td className="py-3 px-6 text-gray-300">Priority Queue</td>
                  <td className="text-center py-3 px-6 text-gray-500">—</td>
                  <td className="text-center py-3 px-6 text-terminal bg-terminal/5">✓</td>
                </tr>
                <tr className="border-b border-void-100/50">
                  <td className="py-3 px-6 text-gray-300">Site Monitoring</td>
                  <td className="text-center py-3 px-6 text-gray-500">—</td>
                  <td className="text-center py-3 px-6 text-terminal bg-terminal/5">5 sites</td>
                </tr>
                <tr className="border-b border-void-100/50">
                  <td className="py-3 px-6 text-gray-300">Daily Auto-Scans</td>
                  <td className="text-center py-3 px-6 text-gray-500">—</td>
                  <td className="text-center py-3 px-6 text-terminal bg-terminal/5">✓</td>
                </tr>
                <tr className="border-b border-void-100/50">
                  <td className="py-3 px-6 text-gray-300">Score Alerts</td>
                  <td className="text-center py-3 px-6 text-gray-500">—</td>
                  <td className="text-center py-3 px-6 text-terminal bg-terminal/5">✓</td>
                </tr>
                <tr className="border-b border-void-100/50">
                  <td className="py-3 px-6 text-gray-300">API Access</td>
                  <td className="text-center py-3 px-6 text-gray-500">—</td>
                  <td className="text-center py-3 px-6 text-terminal bg-terminal/5">✓</td>
                </tr>
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
              { q: 'What counts as a scan?', a: 'Each URL you submit counts as one scan. Monitored sites use scans from your monthly allocation.' },
              { q: 'How does site monitoring work?', a: 'Pro users can add up to 5 websites for automated daily scans. We email you if your score drops.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your account settings and keep Pro access until the end of your billing period.' },
              { q: 'Do scan packs expire?', a: 'Never. Scan packs are yours forever and stack if you buy multiple.' },
              { q: 'Can I use the CLI without Pro?', a: 'Yes! The CLI (npm, Homebrew, Cargo) works for everyone. Pro gives you more scans and priority processing.' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-void-100 bg-void-50">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-gray-100">{item.q}</span>
                  <span className={`text-terminal ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
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
          <a href="mailto:support@3rrork1ng.com" className="text-terminal hover:underline">
            support@3rrork1ng.com
          </a>
        </div>
      </div>
    </div>
  );
}
