import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Scanner } from '@/components/Scanner';

// Lazy load heavy components
const ExampleRoasts = dynamic(() => import('@/components/ExampleRoasts').then(m => ({ default: m.ExampleRoasts })));
const FAQ = dynamic(() => import('@/components/FAQ').then(m => ({ default: m.FAQ })), { ssr: false });
const Testimonials = dynamic(() => import('@/components/Testimonials').then(m => ({ default: m.Testimonials })), { ssr: false });

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />

        <div className="relative z-10 px-4 pt-24 pb-20 sm:pt-36 sm:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gray-100 border border-gray-200 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-gray-600 font-medium text-sm">Free website audits &mdash; No signup required</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
              Know exactly where
              <br />
              your site stands.
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              50+ checks across security, performance, SEO, and accessibility.
              AI-powered insights you can actually use.
            </p>

            {/* Scanner Input */}
            <div className="max-w-2xl mx-auto mb-12">
              <Scanner className="w-full" autoFocus />
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No Signup</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Results in 30s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES GRID
          ============================================ */}
      <section className="py-24 sm:py-32 px-4 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything we check
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Comprehensive analysis across six critical areas
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: 'Security',
                description: 'HTTPS, headers, vulnerabilities, XSS protection, and more',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
                title: 'Performance',
                description: 'Core Web Vitals, load times, optimization opportunities',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
                title: 'SEO',
                description: 'Meta tags, structure, crawlability, social cards',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
                title: 'Accessibility',
                description: 'WCAG compliance, screen reader support, color contrast',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                ),
                title: 'Code Quality',
                description: 'Errors, best practices, deprecated APIs, console issues',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
                title: 'AI Analysis',
                description: 'Intelligent recommendations with specific code fixes',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-8 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 mb-5 group-hover:bg-gray-200 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section className="py-24 sm:py-32 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Three steps to better code
            </h2>
            <p className="text-lg text-gray-500">
              From URL to actionable fixes in under a minute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Paste your URL',
                description: 'Enter any website URL. We scan public pages only — same as any visitor would see.',
              },
              {
                step: '2',
                title: 'We analyze everything',
                description: 'Our engine runs 50+ checks across security, performance, SEO, accessibility, and code quality.',
              },
              {
                step: '3',
                title: 'Get actionable fixes',
                description: 'Receive prioritized recommendations with specific code snippets you can copy and paste.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {/* Step Number */}
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-5">
                  {item.step}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          EXAMPLE REPORTS
          ============================================ */}
      <section className="py-24 sm:py-32 px-4 bg-white border-t border-gray-100">
        <ExampleRoasts />
      </section>

      {/* ============================================
          TESTIMONIALS
          ============================================ */}
      <section className="py-24 sm:py-32 px-4 bg-gray-50 border-t border-gray-100">
        <Testimonials />
      </section>

      {/* ============================================
          PRICING CTA
          ============================================ */}
      <section className="py-24 sm:py-32 px-4 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900 rounded-3xl p-10 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to ship better websites?
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
              Free users get 3 scans/day. Go Pro for 200 scans/month, priority processing, and API access.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all hover:-translate-y-0.5"
              >
                View Pricing
              </Link>
              <Link
                href="/"
                className="px-8 py-3.5 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-700 transition-all hover:-translate-y-0.5"
              >
                Try Free Scan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ
          ============================================ */}
      <section className="py-24 sm:py-32 px-4 bg-gray-50 border-t border-gray-100">
        <FAQ />
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="py-24 sm:py-32 px-4 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Ready to see your score?
          </h2>
          <p className="text-lg text-gray-500 mb-10">
            It&apos;s free. Takes 30 seconds. You might learn something.
          </p>
          <Scanner className="w-full" />
        </div>
      </section>
    </div>
  );
}
