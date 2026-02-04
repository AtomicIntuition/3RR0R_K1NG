'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Scanner } from '@/components/Scanner';
import {
  Shield, Zap, Search, Eye, Code2, Sparkles,
  Check, Globe, ArrowRight,
} from 'lucide-react';

const ExampleRoasts = dynamic(() =>
  import('@/components/ExampleRoasts').then(m => ({ default: m.ExampleRoasts }))
);
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
   Animated counter
   ═══════════════════════════════════════════ */

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setN(Math.round((1 - (1 - p) ** 3) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString()}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════
   Features data
   ═══════════════════════════════════════════ */

const FEATURES = [
  {
    icon: Shield,
    title: 'Security',
    desc: 'HTTPS validation, security headers, CSP policies, XSS protection, and vulnerability scanning.',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    hoverBorder: 'group-hover:border-emerald-500/30',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.06)]',
    span: 'md:col-span-2',
  },
  {
    icon: Zap,
    title: 'Performance',
    desc: 'Core Web Vitals, load times, bundle size, and optimization opportunities.',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    hoverBorder: 'group-hover:border-amber-500/30',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(245,158,11,0.06)]',
  },
  {
    icon: Search,
    title: 'SEO',
    desc: 'Meta tags, OpenGraph, structured data, crawlability, and social cards.',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    hoverBorder: 'group-hover:border-blue-500/30',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.06)]',
  },
  {
    icon: Eye,
    title: 'Accessibility',
    desc: 'WCAG 2.1 compliance, color contrast, screen reader support, and keyboard navigation.',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    hoverBorder: 'group-hover:border-violet-500/30',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(139,92,246,0.06)]',
  },
  {
    icon: Code2,
    title: 'Code Quality',
    desc: 'Console errors, deprecated APIs, best practices, and browser compatibility.',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    hoverBorder: 'group-hover:border-orange-500/30',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(249,115,22,0.06)]',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    desc: 'Intelligent recommendations with specific code fixes tailored to your stack. Not generic advice — actionable fixes you can copy, paste, and ship.',
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-400/10',
    hoverBorder: 'group-hover:border-teal-400/30',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(45,212,191,0.06)]',
    span: 'md:col-span-2 lg:col-span-3',
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
  const orbY2 = useTransform(scrollY, [0, 600], [0, -100]);
  const heroFade = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gray-950 min-h-[85vh] flex items-center">
        {/* Ambient gradient orbs */}
        <motion.div
          style={{ y: orbY1, opacity: heroFade }}
          className="absolute -top-40 -right-40 w-[700px] h-[700px] pointer-events-none"
          aria-hidden
        >
          <div className="w-full h-full rounded-full bg-emerald-500/[0.07] blur-[120px]" />
        </motion.div>
        <motion.div
          style={{ y: orbY2, opacity: heroFade }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] pointer-events-none"
          aria-hidden
        >
          <div className="w-full h-full rounded-full bg-blue-500/[0.04] blur-[100px]" />
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

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 bg-gray-900/80 border border-gray-700/50 rounded-full backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-gray-300 font-medium text-sm">
                Free website audits &mdash; No signup required
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-7 leading-[0.95]"
            >
              <span className="text-gray-50">Is your website</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                actually good?
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Find out in 30 seconds. 50+ automated checks across security,
              performance, SEO, and accessibility &mdash; with AI&#8209;powered
              fixes you can ship today.
            </motion.p>

            {/* Scanner */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease, delay: 0.35 }}
              className="max-w-2xl mx-auto mb-10"
            >
              <Scanner className="w-full" autoFocus />
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500 text-sm"
            >
              {['100% Free', 'No Signup', 'Results in 30s'].map((text) => (
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
          STATS
          ══════════════════════════════════════ */}
      <Divider />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease }}
        className="py-16 sm:py-20 px-4 bg-gray-950"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { val: 10000, suf: '+', label: 'Sites Audited' },
              { val: 50, suf: '+', label: 'Checks Per Scan' },
              { val: 30, suf: 's', label: 'Avg. Scan Time' },
              { val: 6, suf: '', label: 'Audit Categories' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-gray-50 mb-1">
                  <Counter to={s.val} suffix={s.suf} />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════
          FEATURES — BENTO GRID
          ══════════════════════════════════════ */}
      <Divider />
      <section className="py-24 sm:py-32 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-display-md font-bold text-gray-50 mb-4 tracking-tight">
              Everything we check
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Comprehensive analysis across six critical areas
            </p>
          </motion.div>

          {/* Grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className={`group relative bg-gray-900 border border-gray-800 rounded-2xl p-7 overflow-hidden transition-all duration-300 hover:bg-gray-900/80 ${f.hoverBorder} ${f.hoverGlow} ${f.span || ''}`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}
                  >
                    <Icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-50 mb-2">
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
      <section className="py-24 sm:py-32 px-4 bg-gradient-to-b from-gray-950 via-gray-900/40 to-gray-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-display-md font-bold text-gray-50 mb-4 tracking-tight">
              Three steps. Zero&nbsp;guesswork.
            </h2>
            <p className="text-lg text-gray-400">
              From URL to actionable fixes in under a minute
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line — desktop */}
            <div
              className="hidden md:block absolute top-[3.25rem] left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-emerald-500/20 via-emerald-500/40 to-emerald-500/20"
              aria-hidden
            />

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6"
            >
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  variants={fadeUp}
                  className="relative text-center"
                >
                  {/* Step circle */}
                  <div className="relative z-10 w-12 h-12 mx-auto mb-6">
                    <div
                      className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"
                      style={{ animationDuration: '3s' }}
                      aria-hidden
                    />
                    <div className="relative w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-emerald-950 font-bold text-sm shadow-glow-primary">
                      {step.n}
                    </div>
                  </div>

                  {/* Step 1 mockup — URL bar */}
                  {i === 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 mb-5 mx-auto max-w-[260px]">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-gray-500">https://</span>
                        <span className="text-gray-300 truncate">
                          example.com
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step 2 mockup — scanning categories */}
                  {i === 1 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 mb-5 mx-auto max-w-[260px] space-y-1.5">
                      {['Security', 'Performance', 'SEO', 'A11y'].map(
                        (cat, j) => (
                          <div key={cat} className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            <span className="text-xs text-gray-500">
                              {cat}
                            </span>
                            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500/40 rounded-full"
                                style={{ width: `${65 + j * 10}%` }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Step 3 mockup — results card */}
                  {i === 2 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 mb-5 mx-auto max-w-[260px]">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-500 font-bold text-sm flex-shrink-0">
                          87
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-emerald-400">
                            B+
                          </div>
                          <div className="text-xs text-gray-500">
                            12 fixes available
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
          EXAMPLE REPORTS
          ══════════════════════════════════════ */}
      <Divider />
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease }}
        className="py-24 sm:py-32 px-4 bg-gray-950"
      >
        <ExampleRoasts />
      </motion.section>

      {/* ══════════════════════════════════════
          PRICING CTA
          ══════════════════════════════════════ */}
      <Divider />
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease }}
        className="py-24 sm:py-32 px-4 bg-gray-950"
      >
        <div className="max-w-3xl mx-auto">
          {/* Gradient border wrapper */}
          <div className="relative p-px rounded-3xl bg-gradient-to-r from-emerald-500/20 via-gray-800 to-emerald-500/20 overflow-hidden">
            {/* Ambient glow behind card */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl pointer-events-none"
              aria-hidden
            />

            <div className="relative bg-gray-900 rounded-3xl p-10 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to ship better websites?
              </h2>
              <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
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
        className="py-24 sm:py-32 px-4 bg-gradient-to-b from-gray-950 via-gray-900/40 to-gray-950"
      >
        <FAQ />
      </motion.section>

      {/* ══════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════ */}
      <Divider />
      <section className="relative py-28 sm:py-36 px-4 bg-gray-950 overflow-hidden">
        {/* Background orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          aria-hidden
        >
          <div className="w-full h-full rounded-full bg-emerald-500/[0.04] blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-display-md font-bold text-gray-50 mb-4 tracking-tight">
            Don&apos;t just guess.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Know.
            </span>
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            It&apos;s free. Takes 30 seconds. You might learn something.
          </p>
          <Scanner className="w-full" />
        </motion.div>
      </section>
    </div>
  );
}
