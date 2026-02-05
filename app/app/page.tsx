'use client';

import { Scanner } from '@/components/Scanner';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { title: 'Security', dot: 'bg-red-400' },
  { title: 'Performance', dot: 'bg-amber-400' },
  { title: 'SEO', dot: 'bg-blue-400' },
  { title: 'Accessibility', dot: 'bg-purple-400' },
  { title: 'Code Quality', dot: 'bg-emerald-400' },
];

export default function HomePage() {
  return (
    <div className="bg-gray-950 overflow-x-hidden">

      {/* ─── Hero ─── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 pb-20">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Soft glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-2xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 leading-[1.1]">
            <span className="text-gray-50">Audit any website.</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Ship it better.
            </span>
          </h1>

          <p className="text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
            Security, performance, SEO, and accessibility — 50+ checks
            with AI&#8209;powered fixes you can deploy today.
          </p>

          <Scanner className="w-full mb-8" autoFocus />

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-500 text-sm">
            {['Free to use', 'No signup required', 'Results in 30s'].map((text) => (
              <div key={text} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500/60" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories strip ─── */}
      <section className="border-t border-gray-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.title} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                <span className="text-sm text-gray-400">{cat.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="border-t border-gray-800/60 py-20 sm:py-28 px-4">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-medium text-emerald-400 mb-3 text-center">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-50 tracking-tight text-center mb-16">
              URL in, actionable report out.
            </h2>

            <div className="space-y-12 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-12">
              {[
                { step: '1', title: 'Paste a URL', desc: 'Enter any publicly accessible website.' },
                { step: '2', title: 'We scan it', desc: '50+ automated checks run in under 30 seconds.' },
                { step: '3', title: 'Get your report', desc: 'Prioritized fixes with AI-generated code snippets.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center mx-auto mb-4">
                    <span className="text-sm font-semibold text-gray-400">{item.step}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-50 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Social proof bar ─── */}
      <section className="border-t border-gray-800/60 bg-gray-900/30">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-50">50+</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Checks per scan</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-50">5</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Audit categories</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-50">&lt;30s</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Time to report</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-gray-800/60 py-20 sm:py-28 px-4">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-50 tracking-tight mb-4">
              Ready to improve your site?
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              No account needed. Paste a URL above or check out what&apos;s included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
              >
                View pricing
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
