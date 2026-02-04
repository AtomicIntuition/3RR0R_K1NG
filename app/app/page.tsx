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
          HERO SECTION - BOLD & DRAMATIC
          ============================================ */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />

        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative z-10 px-4 py-20 sm:py-32">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-white/90 font-medium text-sm">Free website audits — No signup required</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Your website,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200">
                brutally analyzed.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              50+ checks across security, performance, SEO, and accessibility.
              AI-powered insights you can actually use.
            </p>

            {/* Scanner Input - WHITE CARD */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="bg-white rounded-2xl shadow-2xl p-2">
                <Scanner className="w-full" autoFocus />
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No Signup</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Results in 30s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ============================================
          FEATURES GRID - BOLD CARDS
          ============================================ */}
      <section className="py-20 sm:py-28 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Everything we check
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Comprehensive analysis across five critical areas
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🛡️',
                title: 'Security',
                description: 'HTTPS, headers, vulnerabilities, XSS protection, and more',
                color: 'from-red-500 to-orange-500',
                bgColor: 'bg-red-50',
              },
              {
                icon: '⚡',
                title: 'Performance',
                description: 'Core Web Vitals, load times, optimization opportunities',
                color: 'from-yellow-500 to-amber-500',
                bgColor: 'bg-yellow-50',
              },
              {
                icon: '🔍',
                title: 'SEO',
                description: 'Meta tags, structure, crawlability, social cards',
                color: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-50',
              },
              {
                icon: '♿',
                title: 'Accessibility',
                description: 'WCAG compliance, screen reader support, color contrast',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-50',
              },
              {
                icon: '💻',
                title: 'Code Quality',
                description: 'Errors, best practices, deprecated APIs, console issues',
                color: 'from-purple-500 to-violet-500',
                bgColor: 'bg-purple-50',
              },
              {
                icon: '🤖',
                title: 'AI Analysis',
                description: 'Intelligent recommendations with specific code fixes',
                color: 'from-pink-500 to-rose-500',
                bgColor: 'bg-pink-50',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`${feature.bgColor} rounded-2xl p-8 border-2 border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS - STEP BY STEP
          ============================================ */}
      <section className="py-20 sm:py-28 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Three steps to better code
            </h2>
            <p className="text-xl text-gray-500">
              From URL to actionable fixes in under a minute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Paste your URL',
                description: 'Enter any website URL. We scan public pages only — same as any visitor would see.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'We analyze everything',
                description: 'Our AI runs 50+ checks across security, performance, SEO, accessibility, and code quality.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Get actionable fixes',
                description: 'Receive prioritized recommendations with specific code snippets you can copy and paste.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-300 to-transparent z-0" style={{ width: 'calc(100% - 3rem)' }} />
                )}

                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative z-10 hover:shadow-xl transition-shadow">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 mt-4">
                    {item.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          EXAMPLE REPORTS
          ============================================ */}
      <section className="py-20 sm:py-28 px-4 bg-white">
        <ExampleRoasts />
      </section>

      {/* ============================================
          TESTIMONIALS
          ============================================ */}
      <section className="py-20 sm:py-28 px-4 bg-gray-50">
        <Testimonials />
      </section>

      {/* ============================================
          PRICING CTA - BOLD
          ============================================ */}
      <section className="py-20 sm:py-28 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 sm:p-16">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">
                Ready to ship better websites?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Free users get 3 scans/day. Go Pro for 200 scans/month, priority processing, and API access.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/pricing"
                  className="px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  View Pricing →
                </Link>
                <Link
                  href="/"
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold text-lg rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
                >
                  Try Free Scan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ
          ============================================ */}
      <section className="py-20 sm:py-28 px-4 bg-gray-50">
        <FAQ />
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="py-20 sm:py-28 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
            Still here? Just scan something.
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            It&apos;s free. Takes 30 seconds. You might learn something.
          </p>
          <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
            <Scanner className="w-full" />
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER - CLEAN & MODERN
          ============================================ */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-lg">
                C
              </div>
              <span className="text-2xl font-black">Crisp</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-gray-400">
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            Built for developers who care about quality. We score 95+ on our own audits.
          </div>
        </div>
      </footer>
    </div>
  );
}
