import Link from 'next/link';
import { Scanner } from '@/components/Scanner';
import { GlitchText } from '@/components/GlitchText';
import { Navbar } from '@/components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="text-center mb-12 mt-16">
        {/* Logo/Title */}
        <h1 className="text-5xl sm:text-7xl font-bold mb-4">
          <GlitchText
            text="3RROR_K1NG"
            className="text-terminal neon-glow-green"
            glitchIntensity="medium"
            as="span"
          />
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-gray-400 mb-2">
          Website Roast Machine
        </p>

        {/* Description */}
        <p className="max-w-lg mx-auto text-gray-500 text-sm sm:text-base">
          Drop a URL. Get brutally roasted. Security, performance, SEO, and
          accessibility audits delivered as savage truths with actionable fixes.
        </p>
      </div>

      {/* Scanner Input */}
      <Scanner className="w-full max-w-2xl" />

      {/* Features Grid */}
      <div className="mt-16 grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl w-full">
        {[
          { icon: '⚡', label: 'Performance', desc: 'Core Web Vitals' },
          { icon: '🛡️', label: 'Security', desc: 'Headers & HTTPS' },
          { icon: '🔍', label: 'SEO', desc: 'Meta & Structure' },
          { icon: '♿', label: 'Accessibility', desc: 'WCAG Compliance' },
          { icon: '🧹', label: 'Code Quality', desc: 'Errors & Issues' },
        ].map((feature) => (
          <div
            key={feature.label}
            className="p-4 bg-void-50/50 rounded-lg border border-void-100 text-center hover:border-terminal/30 transition-colors"
          >
            <span className="text-2xl mb-2 block">{feature.icon}</span>
            <h3 className="font-bold text-terminal text-sm">{feature.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats/Social Proof */}
      <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-terminal">10K+</div>
          <div className="text-xs text-gray-500">Sites Roasted</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-neon-cyan">50+</div>
          <div className="text-xs text-gray-500">Security Checks</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-neon-purple">100%</div>
          <div className="text-xs text-gray-500">Brutal Honesty</div>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-20 max-w-3xl w-full">
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="text-terminal">&gt;</span> How it works
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Enter URL',
              desc: 'Paste any website URL you want to audit',
            },
            {
              step: '02',
              title: 'Deep Scan',
              desc: 'We analyze 50+ metrics across 5 categories',
            },
            {
              step: '03',
              title: 'Get Roasted',
              desc: 'Receive your brutal report with fixes',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="text-5xl font-bold text-terminal/20 mb-3 select-none">
                {item.step}
              </div>
              <div className="bg-void-50/50 p-6 rounded-lg border border-void-100">
                <h3 className="font-bold text-terminal mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="mt-20 w-full max-w-2xl p-8 bg-gradient-to-r from-terminal/10 to-neon-cyan/10 rounded-lg border border-terminal/30">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Need more roasting power?
          </h2>
          <p className="text-gray-400 mb-6">
            Free users get 5 scans/hour. Go Pro for unlimited scans, priority queue, and advanced features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-6 py-3 font-bold rounded transition-all duration-200 bg-terminal text-void hover:bg-terminal-bright"
            >
              View Pricing
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 font-bold rounded transition-all duration-200 border border-terminal/50 text-terminal hover:bg-terminal/10"
            >
              50 Scans for $9.99
            </Link>
          </div>
        </div>
      </div>

      {/* Terminal decoration */}
      <div className="mt-20 w-full max-w-2xl">
        <div className="bg-void-50 rounded-lg border border-void-100 p-4 font-mono text-xs text-gray-500">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-void-100">
            <span className="text-terminal">guest@3rror_k1ng</span>
            <span className="text-gray-600">~</span>
          </div>
          <div className="space-y-1">
            <p><span className="text-terminal">$</span> ./scan --target https://your-site.com</p>
            <p className="text-gray-600">[*] Initializing security audit...</p>
            <p className="text-gray-600">[*] Running performance checks...</p>
            <p className="text-gray-600">[*] Analyzing SEO configuration...</p>
            <p className="text-neon-yellow">[!] WARNING: 12 vulnerabilities found</p>
            <p className="text-danger">[X] CRITICAL: Missing security headers</p>
            <p className="text-terminal">[+] Report generated. Prepare for roast.</p>
            <p className="cursor-blink text-terminal">$</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 w-full max-w-4xl border-t border-void-100 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="text-terminal font-bold">3RROR_K1NG</span>
            <span>Website Roast Machine</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-terminal transition-colors">
              Pricing
            </Link>
            <a href="mailto:support@3rrork1ng.com" className="hover:text-terminal transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
