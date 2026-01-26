'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ReactNode, Suspense } from 'react';
import { Toaster } from 'sonner';
import { AuthToastHandler } from './AuthToastHandler';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Suspense fallback={null}>
        <AuthToastHandler />
      </Suspense>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            border: '1px solid #2d2d44',
            color: '#e4e4e7',
          },
          classNames: {
            success: 'border-emerald-500/30',
            error: 'border-red-500/30',
          },
        }}
        richColors
      />
    </AuthProvider>
  );
}
