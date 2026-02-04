import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = 'https://crisp.dev';

// Viewport configuration with theme color
export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Crisp | Website Audit Platform',
  description: 'Professional website audits for security, performance, SEO, and accessibility. Get actionable insights powered by AI.',
  keywords: ['website audit', 'security scanner', 'performance testing', 'SEO checker', 'accessibility audit'],
  authors: [{ name: 'Crisp' }],
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
    statusBarStyle: 'default',
    title: 'Crisp',
  },
  openGraph: {
    title: 'Crisp | Professional Website Audits',
    description: 'AI-powered security, performance, SEO & accessibility audits. Get actionable insights for your website.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Crisp',
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Crisp - Website Audit Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crisp | Professional Website Audits',
    description: 'AI-powered security, performance, SEO & accessibility audits. Get actionable insights for your website.',
    creator: '@crisp_dev',
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
      name: 'Crisp',
      description: 'Website Audit Platform - Security, performance, SEO, and accessibility audits',
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
      name: 'Crisp',
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
      name: 'Crisp',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Professional website audits with actionable insights for security, performance, SEO, and accessibility.',
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
    <html lang="en" className={`${inter.variable} ${GeistSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <ServiceWorkerRegistration />
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            {/* Navbar */}
            <Navbar />

            {/* Content - add top padding for fixed navbar */}
            <main className="relative z-10 flex-1 pt-16">
              {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 px-4 border-t border-gray-200 bg-white">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-black">C</span>
                  </div>
                  <span className="text-gray-900 font-black">Crisp</span>
                  <span className="text-gray-300">|</span>
                  <span>Website Audit Platform</span>
                </div>
                <div className="flex items-center gap-6">
                  <a href="/privacy" className="hover:text-indigo-600 transition-colors font-medium">Privacy</a>
                  <a href="/terms" className="hover:text-indigo-600 transition-colors font-medium">Terms</a>
                  <a
                    href="https://x.com/crisp_dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors font-medium"
                  >
                    @crisp
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
