'use client';

import Link from 'next/link';
import { UserMenu } from './UserMenu';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-void/80 backdrop-blur-sm border-b border-void-100">
      <Link href="/" className="text-xl font-bold text-terminal hover:text-terminal-bright transition-colors">
        3RROR_K1NG
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/pricing"
          className="text-sm text-gray-400 hover:text-terminal transition-colors"
        >
          Pricing
        </Link>
        <UserMenu />
      </div>
    </nav>
  );
}
