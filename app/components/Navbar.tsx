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

  // Static placeholder rendered on both server and client initial render
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="px-6 py-3 transition-all duration-300 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/60">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <span className="text-base font-bold text-gray-50">
                Crisp
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-gray-400">Pricing</span>
              <span className="text-sm font-medium text-gray-400">Sign In</span>
              <span className="text-sm px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium">Sign Up</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-3 transition-all duration-300 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <a
            href="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-2.5 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <span className="text-base font-bold text-gray-50">
              Crisp
            </span>
          </a>

          {/* Nav links and user menu */}
          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors"
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
