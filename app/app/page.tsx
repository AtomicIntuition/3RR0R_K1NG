import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Scanner } from '@/components/Scanner';
import { GlitchText } from '@/components/GlitchText';
import { Stats } from '@/components/Stats';
import { LiveActivity } from '@/components/LiveActivity';
import { SiteSearch } from '@/components/SiteSearch';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/ScrollReveal';

// Lazy load heavy components below the fold
const HeroBackground = dynamic(() => import('@/components/HeroBackground').then(m => ({ default: m.HeroBackground })), { ssr: false });
const ExampleRoasts = dynamic(() => import('@/components/ExampleRoasts').then(m => ({ default: m.ExampleRoasts })));
const ExitIntentScan = dynamic(() => import('@/components/ExitIntentScan').then(m => ({ default: m.ExitIntentScan })), { ssr: false });
const FAQ = dynamic(() => import('@/components/FAQ').then(m => ({ default: m.FAQ })));
const Testimonials = dynamic(() => import('@/components/Testimonials').then(m => ({ default: m.Testimonials })));
const TerminalDemo = dynamic(() => import('@/components/TerminalDemo').then(m => ({ default: m.TerminalDemo })), { ssr: false });

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated Background */}
      <HeroBackground />

      {/* Exit Intent Modal for anonymous users */}
      <ExitIntentScan />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 relative z-10">
        {/* Badge */}
        <ScrollReveal delay={0} className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal/10 border border-terminal/30 rounded-full text-sm">
            <span className="w-2 h-2 bg-terminal rounded-full animate-pulse" />
            <span className="text-terminal font-medium">Free website audits</span>
          </div>
        </ScrollReveal>

        {/* Logo/Title */}
        <ScrollReveal delay={0.1}>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-4 text-center">
            <GlitchText
              text="3RROR_K1NG"
              className="text-terminal neon-glow-green"
              glitchIntensity="medium"
              as="span"
            />
          </h1>
        </ScrollReveal>

        {/* Headline - Pain point focused */}
        <ScrollReveal delay={0.2}>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-2 text-center font-medium max-w-3xl">
            Your website has problems.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <p className="text-lg sm:text-xl text-gray-400 mb-6 text-center max-w-2xl">
            We find them. AI tells you exactly how to fix them.
          </p>
        </ScrollReveal>

        {/* Social proof - inline stats */}
        <ScrollReveal delay={0.4} className="mb-8">
          <Stats variant="inline" />
        </ScrollReveal>

        {/* Scanner Input */}
        <ScrollReveal delay={0.5} className="w-full max-w-2xl mb-8">
          <Scanner className="w-full" />
        </ScrollReveal>

        {/* Live Activity Feed */}
        <ScrollReveal delay={0.6}>
          <LiveActivity compact className="mb-6" />
        </ScrollReveal>

        {/* Search for existing roasts */}
        <ScrollReveal delay={0.7} className="w-full max-w-md mb-12">
          <p className="text-xs text-gray-500 text-center mb-2">Already been roasted? Find your report:</p>
          <SiteSearch />
        </ScrollReveal>

        {/* Value Props */}
        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 max-w-4xl w-full mb-16" staggerDelay={0.08}>
          {[
            { icon: '🛡️', label: 'Security', desc: 'Headers & HTTPS' },
            { icon: '⚡', label: 'Performance', desc: 'Core Web Vitals' },
            { icon: '🔍', label: 'SEO', desc: 'Meta & Structure' },
            { icon: '♿', label: 'Accessibility', desc: 'WCAG Checks' },
            { icon: '🧹', label: 'Code', desc: 'Quality & Errors' },
          ].map((feature) => (
            <StaggerItem key={feature.label}>
              <div className="p-4 sm:p-5 bg-void-50/80 backdrop-blur rounded-xl border border-void-100 text-center hover:border-terminal/50 hover:bg-void-50 transition-all duration-300 group cursor-default">
                <span className="text-2xl sm:text-3xl mb-2 block group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                <p className="font-bold text-terminal text-sm">{feature.label}</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">{feature.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* Terminal Demo Section */}
      <section className="py-16 sm:py-24 px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              <span className="text-terminal">&gt;</span> See it in action
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              50+ checks across security, performance, SEO, accessibility, and code quality.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <TerminalDemo />
        </ScrollReveal>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              <span className="text-terminal">&gt;</span> How it works
            </h2>
          </ScrollReveal>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8" staggerDelay={0.15}>
            {[
              {
                step: '01',
                title: 'Drop a URL',
                desc: 'Paste any website you want to audit. Public pages only.',
                icon: '🎯',
              },
              {
                step: '02',
                title: 'Get Roasted',
                desc: 'AI analyzes 50+ metrics and generates brutally honest feedback.',
                icon: '🔥',
              },
              {
                step: '03',
                title: 'Fix & Ship',
                desc: 'Copy the report into Cursor, Claude, or ChatGPT. Watch issues vanish.',
                icon: '🚀',
              },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <div className="relative group">
                  <div className="absolute -top-4 -left-2 text-6xl sm:text-7xl font-bold text-terminal/10 select-none group-hover:text-terminal/20 transition-colors">
                    {item.step}
                  </div>
                  <div className="bg-void-50/80 backdrop-blur p-6 sm:p-8 rounded-xl border border-void-100 hover:border-terminal/30 transition-all duration-300 relative">
                    <span className="text-3xl mb-4 block">{item.icon}</span>
                    <h3 className="font-bold text-lg text-gray-100 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Example Roasts */}
      <section className="py-16 sm:py-24 px-4 relative z-10">
        <ScrollReveal>
          <ExampleRoasts />
        </ScrollReveal>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 px-4 relative z-10">
        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>
      </section>

      {/* Upgrade CTA */}
      <section className="py-16 sm:py-24 px-4 relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="relative p-8 sm:p-12 bg-gradient-to-br from-terminal/10 via-void-50 to-neon-cyan/10 rounded-2xl border border-terminal/30 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-terminal/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl" />

              <div className="relative text-center">
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-100 mb-4">
                  Ready to ship better code?
                </h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                  Free users get 3 scans/day. Go Pro for 200 scans/month, priority queue, site monitoring, and API access.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/pricing"
                    className="group px-8 py-4 font-bold rounded-lg transition-all duration-300 bg-terminal text-void hover:bg-terminal-bright hover:shadow-lg hover:shadow-terminal/25 active:scale-95 text-center"
                  >
                    Go Pro — $29/mo
                    <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-8 py-4 font-bold rounded-lg transition-all duration-300 border border-terminal/50 text-terminal hover:bg-terminal/10 active:scale-95 text-center"
                  >
                    View All Plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 px-4 relative z-10">
        <ScrollReveal>
          <FAQ />
        </ScrollReveal>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Still reading? Just scan something.
            </h2>
            <p className="text-gray-400 mb-8">
              It&apos;s free. Takes 30 seconds. You might learn something.
            </p>
            <Scanner className="max-w-xl mx-auto" />
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-void-100 px-4 relative z-10 bg-void/80 backdrop-blur">
        <div className="max-w-5xl mx-auto py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <span className="text-terminal font-bold text-lg">3RROR_K1NG</span>
              <span className="text-gray-500 text-sm hidden sm:inline">|</span>
              <span className="text-gray-500 text-sm">The website roast machine</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/pricing" className="text-gray-400 hover:text-terminal transition-colors">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-terminal transition-colors">
                Dashboard
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-terminal transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-terminal transition-colors">
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-void-100 text-center text-xs text-gray-500">
            Built with obsessive attention to detail. We score 95+ on our own scanner.
          </div>
        </div>
      </footer>
    </div>
  );
}
