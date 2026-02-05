'use client';

import { Scanner } from '@/components/Scanner';
import { ProductMockup } from '@/components/ProductMockup';
import { HowItWorks } from '@/components/TerminalDemo';
import { Stats } from '@/components/Stats';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Check, Shield, Zap, Search, Accessibility, Code } from 'lucide-react';
import Link from 'next/link';
import { PRICING } from '@/lib/constants';

const CATEGORIES = [
  {
    icon: Shield,
    title: 'Security',
    description: 'Headers, HTTPS, CSP, cookies, and vulnerability detection across your entire stack.',
    checks: 12,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Zap,
    title: 'Performance',
    description: 'Core Web Vitals, asset optimization, caching, and Lighthouse-powered metrics.',
    checks: 10,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Search,
    title: 'SEO',
    description: 'Meta tags, headings, robots config, canonical URLs, and structured data validation.',
    checks: 11,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Accessibility,
    title: 'Accessibility',
    description: 'WCAG compliance, color contrast, ARIA labels, keyboard navigation, and axe-core audits.',
    checks: 10,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Code,
    title: 'Code Quality',
    description: 'Tech stack detection, dependency health, console errors, and resource efficiency.',
    checks: 7,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [`${PRICING.FREE_SCANS_PER_DAY} scans/day`, 'All 5 categories', 'AI analysis'],
    cta: 'Start Free',
    href: '/',
    highlight: false,
  },
  {
    name: 'Pro',
    price: `$${PRICING.PRO_MONTHLY}`,
    period: '/mo',
    features: [`${PRICING.PRO_SCANS_PER_MONTH} scans/mo`, 'Priority queue', 'API & CLI'],
    cta: 'Go Pro',
    href: '/pricing',
    highlight: true,
  },
  {
    name: 'Scan Pack',
    price: `$${PRICING.SCAN_PACK}`,
    period: 'one-time',
    features: [`${PRICING.SCAN_PACK_SCANS} scans`, 'Never expire', 'All Pro features'],
    cta: 'Buy Pack',
    href: '/pricing',
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <div className="bg-gray-950">

      {/* ─── Section 1: Hero ─── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 pb-16 overflow-hidden">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Emerald glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/[0.07] rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-2xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 leading-[1.1]">
            <span className="text-gray-50">Audit any website.</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Ship it better.
            </span>
          </h1>

          <p className="text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
            50+ automated checks across security, performance, SEO, and
            accessibility — with AI&#8209;powered fixes you can deploy today.
          </p>

          <Scanner className="w-full mb-8" autoFocus />

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-400 text-sm">
            {['Free to use', 'No signup required', 'Results in 30s'].map((text) => (
              <div key={text} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500/70" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 2: Product Preview ─── */}
      <section className="py-20 sm:py-28 px-4">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-50 tracking-tight">
                Comprehensive audits in seconds
              </h2>
              <p className="mt-3 text-gray-400 max-w-lg mx-auto">
                Get a complete breakdown of your site&apos;s health across every category that matters.
              </p>
            </div>
            <div className="relative">
              {/* Decorative blurs */}
              <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -right-20 top-1/3 w-60 h-60 bg-teal-500/[0.06] rounded-full blur-3xl pointer-events-none" />
              <ProductMockup />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Section 3: How It Works ─── */}
      <section className="py-20 sm:py-28 px-4">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-50 tracking-tight">
                How it works
              </h2>
              <p className="mt-3 text-gray-400 max-w-lg mx-auto">
                From URL to actionable report in four simple steps.
              </p>
            </div>
            <HowItWorks />
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Section 4: Category Breakdown ─── */}
      <section id="features" className="py-20 sm:py-28 px-4">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-50 tracking-tight">
                Five audits. One report.
              </h2>
              <p className="mt-3 text-gray-400 max-w-lg mx-auto">
                Every scan covers the categories that search engines, users, and attackers care about.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.title}
                    className="group bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-50 mb-2">{cat.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">{cat.description}</p>
                    <p className="text-xs text-gray-600">{cat.checks}+ checks</p>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Section 5: Stats ─── */}
      <section className="py-16 sm:py-20 border-y border-gray-800 bg-gray-900/50">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto px-4">
            <Stats variant="default" />
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Section 6: Pricing Preview ─── */}
      <section className="py-20 sm:py-28 px-4">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-50 tracking-tight">
                Simple pricing
              </h2>
              <p className="mt-3 text-gray-400 max-w-lg mx-auto">
                Start free, upgrade when you need more.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border p-6 flex flex-col ${
                    plan.highlight
                      ? 'bg-gray-900 border-emerald-500/30'
                      : 'bg-gray-900 border-gray-800'
                  }`}
                >
                  <h3 className="text-base font-semibold text-gray-50">{plan.name}</h3>
                  <div className="mt-3 mb-4">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500 ml-1">/{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                        <Check className={`w-3.5 h-3.5 shrink-0 ${plan.highlight ? 'text-emerald-500' : 'text-gray-600'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
                        : 'border border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center mt-6">
              <Link href="/pricing" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                View full pricing &rarr;
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Section 7: Final CTA ─── */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none" />

        <ScrollReveal>
          <div className="relative w-full max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-50 tracking-tight mb-4">
              Ready to improve your site?
            </h2>
            <p className="text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
              Paste any URL and get a professional audit in under 30 seconds.
            </p>

            <Scanner className="w-full mb-8" />

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-400 text-sm">
              {['Free to use', 'No signup required', 'Results in 30s'].map((text) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500/70" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
