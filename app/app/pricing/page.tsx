'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
import {
  Zap, Rocket, BarChart3, Bell, Key, TrendingUp,
  Check, ChevronDown, Minus, ArrowRight,
} from 'lucide-react';
import { PaymentButton } from '@/components/PaymentButton';
import { PRICING } from '@/lib/constants';

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

const PRICE_IDS = {
  scanPack: process.env.NEXT_PUBLIC_STRIPE_SCAN_PACK_PRICE_ID || '',
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  proYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
};

/* ═══════════════════════════════════════════
   Animation helpers
   ═══════════════════════════════════════════ */

const ease = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

/* ═══════════════════════════════════════════
   Data
   ═══════════════════════════════════════════ */

const PRO_FEATURES = [
  {
    icon: Zap,
    title: '200 Scans/Month',
    desc: 'Audit your entire portfolio',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
  },
  {
    icon: Rocket,
    title: 'Priority Queue',
    desc: '2x faster scan results',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Site Monitoring',
    desc: '5 sites with daily scans',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
  {
    icon: Bell,
    title: 'Score Alerts',
    desc: 'Email when scores drop',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
  },
  {
    icon: Key,
    title: 'API Access',
    desc: 'Integrate into your workflow',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Scan History',
    desc: 'Track progress over time',
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
  },
];

const COMPARISON = [
  { feature: 'Monthly Scans', free: '~90', pro: '200' },
  { feature: 'Priority Queue', free: false, pro: true },
  { feature: 'Site Monitoring', free: false, pro: '5 sites' },
  { feature: 'Daily Auto-Scans', free: false, pro: true },
  { feature: 'Score Alerts', free: false, pro: true },
  { feature: 'API Access', free: false, pro: true },
];

const FAQ_DATA = [
  {
    q: 'What counts as a scan?',
    a: 'Each URL you submit counts as one scan. Monitored sites use scans from your monthly allocation.',
  },
  {
    q: 'How does site monitoring work?',
    a: 'Pro users can add up to 5 websites for automated daily scans. We email you if your score drops.',
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
];

/* ═══════════════════════════════════════════
   Divider
   ═══════════════════════════════════════════ */

function Divider() {
  return (
    <div
      className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"
      aria-hidden
    />
  );
}

/* ═══════════════════════════════════════════
   Feature check item
   ═══════════════════════════════════════════ */

function FeatureItem({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'pro';
}) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={clsx(
          'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
          variant === 'pro'
            ? 'bg-emerald-500/15'
            : variant === 'muted'
              ? 'bg-gray-800'
              : 'bg-emerald-500/10'
        )}
      >
        <Check
          className={clsx(
            'w-3 h-3',
            variant === 'muted' ? 'text-gray-500' : 'text-emerald-500'
          )}
        />
      </div>
      <span
        className={clsx(
          'text-sm',
          variant === 'pro'
            ? 'text-gray-200 font-medium'
            : variant === 'muted'
              ? 'text-gray-500'
              : 'text-gray-400'
        )}
      >
        {children}
      </span>
    </li>
  );
}

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    <div className="min-h-screen bg-gray-950">

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gray-950 pb-24">
        {/* Ambient gradient orb */}
        <div
          className="absolute -top-40 right-0 w-[600px] h-[600px] pointer-events-none"
          aria-hidden
        >
          <div className="w-full h-full rounded-full bg-emerald-500/[0.05] blur-[120px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-gray-900/80 border border-gray-700/50 rounded-full backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-gray-300 font-medium text-sm">
              Trusted by 1,000+ developers
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.95]"
          >
            <span className="text-gray-50">Pick a </span>
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              plan.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-12"
          >
            Free gets you started. Pro makes you unstoppable.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
            className="inline-flex bg-gray-900/80 backdrop-blur-sm rounded-xl p-1 border border-gray-800"
          >
            <button
              type="button"
              onClick={() => handleToggle(false)}
              className={clsx(
                'px-6 sm:px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300',
                !isYearly
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => handleToggle(true)}
              className={clsx(
                'px-6 sm:px-8 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300',
                isYearly
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              Yearly
              <span className="px-2 py-0.5 bg-emerald-500 text-emerald-950 text-xs rounded-full font-bold">
                Save 43%
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING CARDS
          ══════════════════════════════════════ */}
      <section className="relative z-20 -mt-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto px-4 sm:px-6"
        >
          <div className="grid md:grid-cols-3 gap-5 items-start">

            {/* ——— Free Plan ——— */}
            <motion.div
              variants={fadeUp}
              className="bg-gray-900 rounded-3xl border border-gray-800 p-8 transition-all duration-300 hover:border-gray-700"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-50 mb-1">Free</h3>
                <p className="text-gray-500 text-sm">For casual audits</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black text-gray-400">$0</span>
                <span className="text-gray-500 ml-2">/forever</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                {[
                  `${PRICING.FREE_SCANS_PER_DAY} scans per day`,
                  'All 5 audit categories',
                  'AI-powered analysis',
                  'Shareable reports',
                  'Basic scan history',
                ].map((f) => (
                  <FeatureItem key={f} variant="muted">
                    {f}
                  </FeatureItem>
                ))}
              </ul>

              <Link
                href="/"
                className="block w-full py-3.5 text-center bg-gray-800 text-gray-200 font-semibold rounded-xl hover:bg-gray-700 transition-all active:scale-[0.98] border border-gray-700"
              >
                Start Free
              </Link>
            </motion.div>

            {/* ——— Pro Plan ——— */}
            <motion.div variants={fadeUp} className="relative md:-mt-4 md:mb-4">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="px-5 py-1.5 bg-emerald-500 text-emerald-950 text-xs font-bold rounded-full shadow-glow-primary">
                  MOST POPULAR
                </span>
              </div>

              {/* Gradient border */}
              <div className="p-px rounded-3xl bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-gray-800/50 shadow-elevated">
                <div className="relative bg-gray-900 rounded-3xl p-8 overflow-hidden">
                  {/* Ambient glow */}
                  <div
                    className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none"
                    aria-hidden
                  />

                  <div className="relative">
                    <div className="mb-6 pt-3">
                      <h3 className="text-xl font-bold text-white mb-1">
                        Pro
                      </h3>
                      <p className="text-gray-400 text-sm">
                        For serious developers
                      </p>
                    </div>

                    {/* Animated price */}
                    <div className="mb-2">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isYearly ? 'yearly' : 'monthly'}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2, ease }}
                          className="inline-flex items-baseline"
                        >
                          <span className="text-5xl font-black text-white">
                            ${proPrice}
                          </span>
                          <span className="text-gray-400 ml-2">
                            /{isYearly ? 'yr' : 'mo'}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    {isYearly ? (
                      <p className="text-emerald-400 text-sm font-semibold mb-6">
                        ${monthlyEquivalent}/mo billed yearly
                      </p>
                    ) : (
                      <div className="mb-6" />
                    )}

                    <ul className="space-y-3.5 mb-8">
                      {[
                        `${PRICING.PRO_SCANS_PER_MONTH} scans per month`,
                        'Priority queue (2x faster)',
                        'Monitor 5 sites daily',
                        'Score drop email alerts',
                        'API access + CLI',
                        'Full scan history',
                      ].map((f) => (
                        <FeatureItem key={f} variant="pro">
                          {f}
                        </FeatureItem>
                      ))}
                    </ul>

                    <PaymentButton
                      priceId={
                        isYearly
                          ? PRICE_IDS.proYearly
                          : PRICE_IDS.proMonthly
                      }
                      mode="subscription"
                      label="Go Pro"
                      className="[&_button]:bg-emerald-500 [&_button]:text-emerald-950 [&_button]:hover:bg-emerald-400 [&_button]:shadow-glow-primary"
                    />
                    <p className="text-gray-500 text-xs text-center mt-4">
                      Cancel anytime &middot; No hidden fees
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ——— Scan Pack ——— */}
            <motion.div
              variants={fadeUp}
              className="bg-gray-900 rounded-3xl border border-gray-800 p-8 transition-all duration-300 hover:border-gray-700"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-50 mb-1">
                  Scan Pack
                </h3>
                <p className="text-gray-500 text-sm">For agencies & teams</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black text-emerald-400">
                  ${PRICING.SCAN_PACK}
                </span>
                <span className="text-gray-500 ml-2">/once</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                {[
                  `${PRICING.SCAN_PACK_SCANS} scans (never expire)`,
                  'All Pro features',
                  'Perfect for client audits',
                  'Bulk site scanning',
                  'No subscription needed',
                  'Stackable packs',
                ].map((f) => (
                  <FeatureItem key={f}>{f}</FeatureItem>
                ))}
              </ul>

              <PaymentButton
                priceId={PRICE_IDS.scanPack}
                mode="payment"
                label="Buy Pack"
                className="[&_button]:bg-emerald-500 [&_button]:text-emerald-950 [&_button]:hover:bg-emerald-400"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          PRO FEATURES GRID
          ══════════════════════════════════════ */}
      <Divider />
      <section className="py-24 sm:py-32 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="text-3xl sm:text-4xl font-bold text-gray-50 text-center mb-14 tracking-tight"
          >
            Everything in Pro
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {PRO_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="group bg-gray-900 rounded-2xl p-6 border border-gray-800 transition-all duration-300 hover:border-gray-700"
                >
                  <div
                    className={clsx(
                      'w-11 h-11 rounded-xl flex items-center justify-center mb-4',
                      f.iconBg
                    )}
                  >
                    <Icon className={clsx('w-5 h-5', f.iconColor)} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-50 mb-1">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          COMPARISON TABLE
          ══════════════════════════════════════ */}
      <Divider />
      <section className="py-24 sm:py-32 px-4 bg-gradient-to-b from-gray-950 via-gray-900/40 to-gray-950">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="text-3xl sm:text-4xl font-bold text-gray-50 text-center mb-14 tracking-tight"
          >
            Compare Plans
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease }}
            className="overflow-x-auto"
          >
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden min-w-[480px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">
                      Feature
                    </th>
                    <th className="text-center py-4 px-6 text-gray-400 font-semibold text-sm w-28">
                      Free
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-sm w-28 bg-emerald-500/5 text-emerald-400">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-800/50 last:border-0"
                    >
                      <td className="py-4 px-6 text-gray-300 text-sm font-medium">
                        {row.feature}
                      </td>
                      <td className="text-center py-4 px-6">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-700 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {row.free}
                          </span>
                        )}
                      </td>
                      <td className="text-center py-4 px-6 bg-emerald-500/[0.03]">
                        {typeof row.pro === 'boolean' ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-emerald-400 font-semibold text-sm">
                            {row.pro}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
          ══════════════════════════════════════ */}
      <Divider />
      <section className="py-24 sm:py-32 px-4 bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="text-3xl sm:text-4xl font-bold text-gray-50 text-center mb-14 tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease }}
            className="space-y-3"
          >
            {FAQ_DATA.map((item, i) => (
              <div
                key={i}
                className={clsx(
                  'bg-gray-900 border rounded-xl overflow-hidden transition-all duration-200',
                  openFaq === i ? 'border-emerald-500/30' : 'border-gray-800'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-medium text-gray-50 pr-4">
                    {item.q}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2, ease }}
                    className={clsx(
                      'flex-shrink-0 transition-colors',
                      openFaq === i ? 'text-emerald-500' : 'text-gray-400'
                    )}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CONTACT CTA
          ══════════════════════════════════════ */}
      <Divider />
      <section className="relative py-24 sm:py-28 px-4 bg-gray-950 overflow-hidden">
        {/* Background orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          aria-hidden
        >
          <div className="w-full h-full rounded-full bg-emerald-500/[0.03] blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="relative z-10 max-w-xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-50 mb-4 tracking-tight">
            Questions?
          </h2>
          <p className="text-gray-400 mb-8">
            We&apos;re here to help with any questions about pricing or
            features.
          </p>
          <a
            href="mailto:support@3rrork1ng.com"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all active:scale-[0.98]"
          >
            Contact Support
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
