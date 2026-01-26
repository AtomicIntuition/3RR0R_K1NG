'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export function AuthToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, profileLoading, authEvent } = useAuth();
  const hasShownToast = useRef(false);
  const hasShownWelcome = useRef(false);

  useEffect(() => {
    const auth = searchParams.get('auth');
    const error = searchParams.get('error');
    const deleted = searchParams.get('deleted');

    // Handle account deleted message
    if (deleted === 'true' && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Account deleted', { description: 'Your account has been permanently deleted.' });
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('deleted');
      router.replace(newUrl.pathname + newUrl.search);
    }

    // Handle auth errors from OAuth
    if (error && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error('Sign in failed', { description: decodeURIComponent(error) });
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      router.replace(newUrl.pathname + newUrl.search);
    }

    // Handle successful OAuth auth - wait for profile to load
    if (auth === 'success' && user && !profileLoading && profile && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      toast.success('Welcome back!', { description: `Signed in as ${user.email}` });
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('auth');
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, user, profile, profileLoading, router]);

  // Reset the ref when user signs out
  useEffect(() => {
    if (!user) {
      hasShownWelcome.current = false;
    }
  }, [user]);

  return null;
}
