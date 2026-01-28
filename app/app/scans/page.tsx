'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScansPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-terminal">Loading...</div>
    </div>
  );
}
