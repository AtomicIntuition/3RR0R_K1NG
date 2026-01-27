import Link from 'next/link';
import { Scanner } from '@/components/Scanner';
import { GlitchText } from '@/components/GlitchText';
import { Stats } from '@/components/Stats';
import { LiveActivity } from '@/components/LiveActivity';
import { ExampleRoasts } from '@/components/ExampleRoasts';
import { ExitIntentScan } from '@/components/ExitIntentScan';
import { SiteSearch } from '@/components/SiteSearch';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Exit Intent Modal for anonymous users */}
      <ExitIntentScan />
      {/* Hero Section - Mobile optimized */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Logo/Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-4 text-center">
          <GlitchText
            text="3RROR_K1NG"
            className="text-terminal neon-glow-green"
            glitchIntensity="medium"
            as="span"
          />
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-2 text-center">
          Website Roast Machine
        </p>

        {/* Social proof - inline stats */}
        <div className="mb-6 sm:mb-8">
          <Stats variant="inline" />
        </div>

        {/* Scanner Input */}
        <Scanner className="w-full max-w-2xl mb-6" />

        {/* Live Activity Feed */}
        <LiveActivity compact className="mb-4 sm:mb-6" />

        {/* Search for existing roasts */}
        <div className="w-full max-w-md mb-8 sm:mb-12">
          <p className="text-xs text-gray-500 text-center mb-2">Already been roasted? Find your report:</p>
          <SiteSearch />
        </div>

        {/* Value Props - Mobile-friendly grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 max-w-4xl w-full mb-12 sm:mb-16">
          {[
            { icon: '🛡️', label: 'Security', desc: 'Headers & HTTPS' },
            { icon: '⚡', label: 'Performance', desc: 'Core Web Vitals' },
            { icon: '🔍', label: 'SEO', desc: 'Meta & Structure' },
            { icon: '♿', label: 'Accessibility', desc: 'WCAG Checks' },
            { icon: '🧹', label: 'Code', desc: 'Quality & Errors' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="p-3 sm:p-4 bg-void-50/50 rounded-lg border border-void-100 text-center hover:border-terminal/30 transition-colors"
            >
              <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">{feature.icon}</span>
              <p className="font-bold text-terminal text-xs sm:text-sm">{feature.label}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works - Simplified for mobile */}
        <div className="max-w-3xl w-full mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">
            <span className="text-terminal">&gt;</span> How it works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                step: '01',
                title: 'Drop a URL',
                desc: 'Paste any website you want to audit',
              },
              {
                step: '02',
                title: 'Get Roasted',
                desc: 'AI analyzes 50+ metrics across 5 categories',
              },
              {
                step: '03',
                title: 'Copy & Fix',
                desc: 'Paste the report into Cursor or Claude to fix issues',
              },
            ].map((item) => (
              <div key={item.step} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0">
                <div className="text-3xl sm:text-5xl font-bold text-terminal/20 select-none shrink-0">
                  {item.step}
                </div>
                <div className="bg-void-50/50 p-4 sm:p-6 rounded-lg border border-void-100 flex-1 sm:flex-none sm:mt-3">
                  <h3 className="font-bold text-terminal mb-1 sm:mb-2 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example Roasts */}
        <div className="w-full mb-12 sm:mb-16">
          <ExampleRoasts />
        </div>

        {/* Upgrade CTA */}
        <div className="w-full max-w-2xl p-6 sm:p-8 bg-gradient-to-r from-terminal/10 to-neon-cyan/10 rounded-lg border border-terminal/30 mb-12 sm:mb-16">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2">
              Need more roasting power?
            </h2>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              Free users get 3 scans/day. Go Pro for 200 scans/month and priority queue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/pricing"
                className="px-6 py-3 font-bold rounded transition-all duration-200 bg-terminal text-void hover:bg-terminal-bright active:scale-95 text-center"
              >
                Go Pro — $29/mo
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 font-bold rounded transition-all duration-200 border border-terminal/50 text-terminal hover:bg-terminal/10 active:scale-95 text-center"
              >
                View All Plans
              </Link>
            </div>
          </div>
        </div>

        {/* Terminal decoration - Hidden on mobile */}
        <div className="hidden sm:block w-full max-w-2xl mb-16">
          <div className="bg-void-50 rounded-lg border border-void-100 p-4 font-mono text-xs text-gray-400">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-void-100">
              <span className="text-terminal">guest@3rror_k1ng</span>
              <span className="text-gray-400">~</span>
            </div>
            <div className="space-y-1">
              <p><span className="text-terminal">$</span> ./scan --target https://your-site.com</p>
              <p className="text-gray-400">[*] Initializing security audit...</p>
              <p className="text-gray-400">[*] Running performance checks...</p>
              <p className="text-neon-yellow">[!] WARNING: 12 vulnerabilities found</p>
              <p className="text-danger">[X] CRITICAL: Missing security headers</p>
              <p className="text-terminal">[+] Report generated. Prepare for roast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-void-100 px-4">
        <div className="max-w-4xl mx-auto py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="text-terminal font-bold">3RROR_K1NG</span>
              <span className="hidden sm:inline">Website Roast Machine</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/pricing" className="hover:text-terminal transition-colors">
                Pricing
              </Link>
              <Link href="/terms" className="hover:text-terminal transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-terminal transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
