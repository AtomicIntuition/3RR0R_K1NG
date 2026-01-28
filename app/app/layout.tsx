import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrl = 'https://3rrork1ng.com';

// Viewport configuration with theme color
export const viewport: Viewport = {
  themeColor: '#00ff41',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '3RROR_K1NG | Website Roast Machine',
  description: 'Get your website brutally roasted. Security, performance, SEO, and accessibility audits delivered as savage truths with actionable fixes.',
  keywords: ['website audit', 'security scanner', 'performance testing', 'SEO checker', 'accessibility audit'],
  authors: [{ name: '3RROR_K1NG' }],
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
    ],
    other: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', rel: 'icon' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '3RROR_K1NG',
  },
  openGraph: {
    title: '3RROR_K1NG | Get Your Website Brutally Roasted',
    description: 'AI-powered security, performance, SEO & accessibility audits. Savage truths with actionable fixes. Try free - 3 scans/day.',
    type: 'website',
    locale: 'en_US',
    siteName: '3RROR_K1NG',
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: '3RROR_K1NG - Website Roast Machine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '3RROR_K1NG | Get Your Website Brutally Roasted',
    description: 'AI-powered security, performance, SEO & accessibility audits. Savage truths with actionable fixes. Try free - 3 scans/day.',
    creator: '@3rrork1ng',
    images: [`${siteUrl}/images/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: '3RROR_K1NG',
      description: 'Website Roast Machine - Security, performance, SEO, and accessibility audits',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/?url={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: '3RROR_K1NG',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: `${siteUrl}`,
        availableLanguage: 'English',
      },
      sameAs: [],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#app`,
      name: '3RROR_K1NG',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Get your website brutally roasted with actionable fixes for security, performance, SEO, and accessibility issues.',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${siteUrl}/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen font-mono">
        <ServiceWorkerRegistration />
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            {/* Navbar */}
            <Navbar />

            {/* Gradient overlay */}
            <div className="fixed inset-0 bg-gradient-to-b from-void via-transparent to-void/80 pointer-events-none" />

            {/* Content - add top padding for fixed navbar */}
            <main className="relative z-10 flex-1 pt-16">
              {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-6 px-4 border-t border-void-100">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo.png" alt="" aria-hidden="true" className="w-6 h-6" />
                  <span className="text-terminal font-bold">3RROR_K1NG</span>
                  <span className="text-gray-400">|</span>
                  <span>Website Roast Machine</span>
                </div>
                <div className="flex items-center gap-4">
                  <a href="/privacy" className="hover:text-terminal transition-colors">Privacy</a>
                  <a href="/terms" className="hover:text-terminal transition-colors">Terms</a>
                  <a
                    href="https://x.com/3RROR_K1NG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-terminal transition-colors"
                  >
                    @3RROR_K1NG
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
