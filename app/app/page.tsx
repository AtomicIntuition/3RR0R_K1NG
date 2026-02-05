'use client';

import { Scanner } from '@/components/Scanner';
import { Check } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 pb-16">
      <div className="w-full max-w-2xl mx-auto text-center">

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 leading-[1.1]">
          <span className="text-gray-50">Audit any website.</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
            Ship it better.
          </span>
        </h1>

        {/* One-liner */}
        <p className="text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
          50+ automated checks across security, performance, SEO, and
          accessibility — with AI&#8209;powered fixes you can deploy today.
        </p>

        {/* Scanner */}
        <Scanner className="w-full mb-8" autoFocus />

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-500 text-sm">
          {['Free to use', 'No signup required', 'Results in 30s'].map((text) => (
            <div key={text} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
