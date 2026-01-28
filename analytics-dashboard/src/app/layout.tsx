import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '3RROR_K1NG Analytics',
  description: 'Internal analytics dashboard',
};

const navItems = [
  { href: '/', label: 'Overview', icon: '📊' },
  { href: '/users', label: 'Users', icon: '👥' },
  { href: '/scans', label: 'Scans', icon: '🔍' },
  { href: '/revenue', label: 'Revenue', icon: '💰' },
  { href: '/funnel', label: 'Funnel', icon: '📈' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-void">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 min-h-screen bg-void-50 border-r border-void-200 p-6 fixed">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-terminal glow-green">
                3RROR_K1NG
              </h1>
              <p className="text-xs text-gray-500 mt-1">Analytics Dashboard</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-void-100 transition-all"
                >
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="p-4 bg-void-100 rounded-lg border border-void-200">
                <p className="text-xs text-gray-500">Environment</p>
                <p className="text-sm text-terminal font-mono">LOCAL DEV</p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
