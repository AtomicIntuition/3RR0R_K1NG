'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import clsx from 'clsx';

// Lazy load toast to reduce initial bundle
const showToast = (message: string) => {
  import('sonner').then(({ toast }) => toast.success(message));
};

// Loading placeholder component
const LoadingPlaceholder = () => (
  <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
);

// Guest links component
const GuestLinks = () => (
  <div className="flex items-center gap-3">
    <Link
      href="/login"
      className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors"
    >
      Sign In
    </Link>
    <Link
      href="/signup"
      className="text-sm px-4 py-2 bg-emerald-500 text-emerald-950 rounded-lg font-semibold hover:bg-emerald-400 transition-all duration-200"
    >
      Sign Up
    </Link>
  </div>
);

function UserMenuComponent() {
  const { user, profile, loading, profileLoading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch by only rendering auth-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return; // Only listen when menu is open

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  // Server-side and initial client render: show placeholder to prevent hydration mismatch
  if (!mounted) {
    return <LoadingPlaceholder />;
  }

  // Client-side: show loading state while auth is being determined
  if (loading) {
    return <LoadingPlaceholder />;
  }

  // Client-side: show guest links if not logged in
  if (!user) {
    return <GuestLinks />;
  }

  const tierColors = {
    anonymous: 'text-gray-500',
    free: 'text-gray-400',
    pro: 'text-emerald-500',
  };

  const tierLabels = {
    anonymous: 'Anonymous',
    free: 'Free',
    pro: 'Pro',
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200',
          isOpen ? 'bg-gray-800' : 'hover:bg-gray-800'
        )}
      >
        {/* Avatar with ring */}
        <div className="w-8 h-8 rounded-full bg-gray-800 ring-2 ring-emerald-500/20 flex items-center justify-center">
          <span className="text-sm font-semibold text-emerald-500">
            {user.email?.[0].toUpperCase() || '?'}
          </span>
        </div>

        {/* Tier badge */}
        {profile ? (
          <span className={clsx('text-xs font-medium', tierColors[profile.tier])}>
            {tierLabels[profile.tier]}
          </span>
        ) : profileLoading ? (
          <span className="w-8 h-4 bg-gray-800 rounded animate-pulse" />
        ) : null}

        {/* Dropdown arrow */}
        <svg
          className={clsx('w-4 h-4 text-gray-500 transition-transform duration-200', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-elevated z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900">
            <p className="text-sm text-gray-200 truncate font-medium">{user.email}</p>
            {profile && (
              <p className={clsx('text-xs mt-1', tierColors[profile.tier])}>
                {tierLabels[profile.tier]} Plan
                {profile.tier === 'pro' && ' - Priority Queue'}
              </p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-2">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/scans"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Reports
            </Link>

            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Account Settings
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              API Keys
            </Link>

            {profile?.tier !== 'pro' && (
              <Link
                href="/pricing"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Upgrade to Pro
              </Link>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-800 py-2">
            <button
              onClick={async () => {
                await signOut();
                setIsOpen(false);
                showToast('Signed out successfully');
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-800 hover:text-danger transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const UserMenu = memo(UserMenuComponent);
