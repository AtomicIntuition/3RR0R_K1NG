'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { UserMenu } from './UserMenu';

const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
      router.push('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 50);
    }
  }, [pathname, router]);

  // Static placeholder rendered on both server and client initial render
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="px-6 py-3 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <span className="text-sm font-semibold text-gray-50">Crisp</span>
            </div>
            <div className="flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <span key={link.href} className="text-sm text-gray-400">{link.label}</span>
              ))}
              <span className="text-sm text-gray-400">Sign In</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-3 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <a
            href="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-sm font-semibold text-gray-50">
              Crisp
            </span>
          </a>

          {/* Right side */}
          <div className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
