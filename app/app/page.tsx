'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Scanner } from '@/components/Scanner';
import {
  Shield, Zap, Search, Eye, Code2, Sparkles,
  Check, ArrowRight,
} from 'lucide-react';

const FAQ = dynamic(
  () => import('@/components/FAQ').then(m => ({ default: m.FAQ })),
  { ssr: false }
);

/* ═══════════════════════════════════════════
   Animation helpers
   ═══════════════════════════════════════════ */

const ease = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
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
   Features data
   ═══════════════════════════════════════════ */

const FEATURES = [
  {
    icon: Shield,
    title: 'Security',
    desc: 'HTTPS, security headers, CSP, XSS protection, and vulnerability scanning.',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    hoverBorder: 'group-hover:border-emerald-500/30',
  },
  {
    icon: Zap,
    title: 'Performance',
    desc: 'Core Web Vitals, load times, bundle analysis, and optimization opportunities.',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    hoverBorder: 'group-hover:border-amber-500/30',
  },
  {
    icon: Search,
    title: 'SEO',
    desc: 'Meta tags, OpenGraph, structured data, crawlability, and social cards.',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    hoverBorder: 'group-hover:border-blue-500/30',
  },
  {
    icon: Eye,
    title: 'Accessibility',
    desc: 'WCAG 2.1 compliance, color contrast, screen reader support, and keyboard nav.',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    hoverBorder: 'group-hover:border-violet-500/30',
  },
  {
    icon: Code2,
    title: 'Code Quality',
    desc: 'Console errors, deprecated APIs, best practices, and browser compatibility.',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    hoverBorder: 'group-hover:border-orange-500/30',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Fixes',
    desc: 'Actionable code fixes tailored to your stack. Copy, paste, and ship.',
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-400/10',
    hoverBorder: 'group-hover:border-teal-400/30',
  },
];

/* ═══════════════════════════════════════════
   Steps data
   ═══════════════════════════════════════════ */

const STEPS = [
  {
    n: '1',
    title: 'Paste your URL',
    desc: 'Enter any website. We scan publicly accessible pages — exactly what your visitors see.',
  },
  {
    n: '2',
    title: 'We analyze everything',
    desc: '50+ automated checks across security, performance, SEO, accessibility, and code quality.',
  },
  {
    n: '3',
    title: 'Ship the fixes',
    desc: 'Get prioritized recommendations with specific code snippets you can implement immediately.',
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
   Page
   ═══════════════════════════════════════════ */

export default function HomePage() {
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 600], [0, -150]);
  const heroFade = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gray-950 min-h-[85vh] flex items-center">
        {/* Ambient gradient orb */}
        <motion.div
          style={{ y: orbY1, opacity: heroFade }}
          className="absolute -top-40 -right-40 w-[300px] h-[300px] md:w-[700px] md:h-[700px] pointer-events-none hidden sm:block"
          aria-hidden
        >
          <div className="w-full h-full rounded-full bg-emerald-500/[0.07] blur-[120px]" />
        </motion.div>

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

        {/* Content */}
        <div className="relative z-10 w-full px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center">

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease, delay: 0.05 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-7 leading-[0.95]"
            >
              <span className="text-gray-50">Audit any website.</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                Ship it better.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease, delay: 0.15 }}
              className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              50+ automated checks across security, performance, SEO, and
              accessibility &mdash; with AI&#8209;powered fixes you can deploy today.
            </motion.p>

            {/* Scanner */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease, delay: 0.3 }}
              className="max-w-2xl mx-auto mb-10"
            >
              <Scanner className="w-full" autoFocus />
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500 text-sm"
            >
              {['Free to use', 'No signup required', 'Results in 30s'].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500/70" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHAT WE CHECK
          ══════════════════════════════════════ */}
      <Divider />
      <section className="py-24 sm:py-28 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-50 mb-4 tracking-tight">
              Everything we check
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Six categories. 50+ checks. One report.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className={`group bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:bg-gray-900/80 ${f.hoverBorder}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-50 mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════ */}
      <Divider />
      <section className="py-24 sm:py-28 px-4 bg-gradient-to-b from-gray-950 via-gray-900/40 to-gray-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-50 mb-4 tracking-tight">
              How it works
            </h2>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Connecting line — desktop */}
            <div
              className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-emerald-500/20 via-emerald-500/40 to-emerald-500/20"
              aria-hidden
            />

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6"
            >
              {STEPS.map((step) => (
                <motion.div
                  key={step.n}
                  variants={fadeUp}
                  className="relative text-center"
                >
                  <div className="relative z-10 w-12 h-12 mx-auto mb-5">
                    <div className="relative w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-emerald-950 font-bold text-sm shadow-glow-primary">
                      {step.n}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-50 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING CTA
          ══════════════════════════════════════ */}
      <Divider />
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease }}
        className="py-24 sm:py-28 px-4 bg-gray-950"
      >
        <div className="max-w-3xl mx-auto">
          <div className="relative p-px rounded-3xl bg-gradient-to-r from-emerald-500/20 via-gray-800 to-emerald-500/20 overflow-hidden">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl pointer-events-none"
              aria-hidden
            />
            <div className="relative bg-gray-900 rounded-3xl p-10 sm:p-14 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to ship better websites?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Free users get 3 scans/day. Go Pro for 200 scans/month,
                priority processing, and API access.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all active:scale-[0.98]"
                >
                  View Pricing
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  className="px-8 py-3.5 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-700 transition-all active:scale-[0.98]"
                >
                  Try Free Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════
          FAQ
          ══════════════════════════════════════ */}
      <Divider />
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease }}
        className="py-24 sm:py-28 px-4 bg-gray-950"
      >
        <FAQ />
      </motion.section>
    </div>
  );
}
