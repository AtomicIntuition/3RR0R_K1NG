import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: '3RROR_K1NG | Website Roast Machine',
  description: 'Get your website brutally roasted. Security, performance, SEO, and accessibility audits delivered as savage truths with actionable fixes.',
  keywords: ['website audit', 'security scanner', 'performance testing', 'SEO checker', 'accessibility audit'],
  authors: [{ name: '3RROR_K1NG' }],
  openGraph: {
    title: '3RROR_K1NG | Website Roast Machine',
    description: 'Get your website brutally roasted with actionable fixes',
    type: 'website',
    locale: 'en_US',
    siteName: '3RROR_K1NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3RROR_K1NG | Website Roast Machine',
    description: 'Get your website brutally roasted with actionable fixes',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen">
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            {/* Gradient overlay */}
            <div className="fixed inset-0 bg-gradient-to-b from-void via-transparent to-void/80 pointer-events-none" />

            {/* Content */}
            <main className="relative z-10 flex-1">
              {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-6 px-4 border-t border-void-100">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-terminal font-bold">3RROR_K1NG</span>
                  <span className="text-gray-600">|</span>
                  <span>Website Roast Machine</span>
                </div>
                <div className="flex items-center gap-4">
                  <a href="/privacy" className="hover:text-terminal transition-colors">Privacy</a>
                  <a href="/terms" className="hover:text-terminal transition-colors">Terms</a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-terminal transition-colors"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
