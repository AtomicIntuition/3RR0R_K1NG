'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
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

  const isActive = (href: string) => pathname === href;

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
            <div className="hidden md:flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <span key={link.href} className="text-sm text-gray-400">{link.label}</span>
              ))}
              <span className="text-sm text-gray-400">Sign In</span>
            </div>
            <div className="md:hidden">
              <div className="w-8 h-8" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
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

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="relative text-sm transition-colors py-1"
                >
                  <span className={isActive(link.href) ? 'text-gray-50 font-medium' : 'text-gray-400 hover:text-gray-200'}>
                    {link.label}
                  </span>
                  {isActive(link.href) && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </Link>
              ))}
              <UserMenu />
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          className="md:hidden overflow-hidden transition-[grid-template-rows] duration-200 ease-out"
          style={{
            display: 'grid',
            gridTemplateRows: mobileOpen ? '1fr' : '0fr',
          }}
        >
          <div className="min-h-0">
            <div className="bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50 px-6 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-gray-50 bg-gray-800/50'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isActive(link.href) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                    {link.label}
                  </span>
                </Link>
              ))}

              {/* Auth section — flat links instead of dropdown */}
              <div className="pt-2 border-t border-gray-800/50 mt-2 space-y-1">
                {authLoading ? (
                  <div className="px-3 py-2.5">
                    <div className="w-24 h-4 bg-gray-800 rounded animate-pulse" />
                  </div>
                ) : user ? (
                  <>
                    {/* User info */}
                    <div className="px-3 py-2 mb-1">
                      <p className="text-sm text-gray-300 font-medium truncate">{user.email}</p>
                      {profile && (
                        <p className={`text-xs mt-0.5 ${profile.tier === 'pro' ? 'text-emerald-500' : 'text-gray-500'}`}>
                          {profile.tier === 'pro' ? 'Pro' : 'Free'} Plan
                        </p>
                      )}
                    </div>

                    {[
                      { href: '/dashboard', label: 'Dashboard' },
                      { href: '/scans', label: 'My Reports' },
                      { href: '/account', label: 'Account Settings' },
                      { href: '/settings', label: 'API Keys' },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? 'text-gray-50 bg-gray-800/50'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}

                    {profile?.tier !== 'pro' && (
                      <Link
                        href="/pricing"
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                      >
                        Upgrade to Pro
                      </Link>
                    )}

                    <button
                      onClick={async () => {
                        await signOut();
                        setMobileOpen(false);
                        const { toast } = await import('sonner');
                        toast.success('Signed out successfully');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-gray-800/30 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-3 pt-1">
                    <Link
                      href="/login"
                      prefetch={false}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 text-center text-sm font-medium text-gray-300 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      prefetch={false}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 text-center text-sm font-semibold bg-white text-gray-950 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
