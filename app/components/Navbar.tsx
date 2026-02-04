'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { UserMenu } from './UserMenu';

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

  // Check if on homepage (hero has dark background)
  const isHomepage = pathname === '/';

  // Static placeholder rendered on both server and client initial render
  // to prevent hydration mismatch (no <a> tags until after mount)
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="px-6 py-4 transition-all duration-300 bg-transparent">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-black">C</span>
              </div>
              <span className="text-xl font-black text-white">
                Crisp
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-8 h-8 rounded-full bg-gray-200/20 animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Navbar content */}
      <div className={`px-6 py-4 transition-all duration-300 ${
        isHomepage
          ? 'bg-transparent'
          : 'bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <a
            href="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-3 transition-all duration-200"
          >
            {/* Logo icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
              <span className="text-white text-lg font-black">C</span>
            </div>
            <span className={`text-xl font-black transition-colors duration-200 ${
              isHomepage
                ? 'text-white group-hover:text-white/80'
                : 'text-gray-900 group-hover:text-indigo-600'
            }`}>
              Crisp
            </span>
          </a>

          {/* Nav links and user menu */}
          <div className="flex items-center gap-6">
            {/* Pricing link */}
            <Link
              href="/pricing"
              className={`text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                isHomepage
                  ? 'text-white/80 hover:text-white'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Pricing
            </Link>
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
