'use client';

import { useEffect, useState, useCallback } from 'react';

interface TVPairingScreenProps {
  code: string;
  expiresAt: string;
  onExpired: () => void;
}

export function TVPairingScreen({ code, expiresAt, onExpired }: TVPairingScreenProps) {
  const [progress, setProgress] = useState(100);
  const pairUrl = typeof window !== 'undefined'
    ? window.location.origin.replace(/^https?:\/\//, '') + '/tv/pair'
    : '/tv/pair';

  const updateProgress = useCallback(() => {
    const now = Date.now();
    const expires = new Date(expiresAt).getTime();
    const total = 10 * 60 * 1000; // 10 minutes
    const remaining = expires - now;

    if (remaining <= 0) {
      setProgress(0);
      onExpired();
      return;
    }

    setProgress((remaining / total) * 100);
  }, [expiresAt, onExpired]);

  useEffect(() => {
    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [updateProgress]);

  const chars = code.split('');

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-50">
      {/* Crisp logo */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-display tracking-tight text-primary">
          Crisp
        </h1>
      </div>

      {/* Title */}
      <h2 className="text-3xl font-semibold mb-4">Pair Your TV</h2>
      <p className="text-xl text-gray-400 mb-12">
        Go to <span className="text-primary font-medium">{pairUrl}</span> on your phone
      </p>

      {/* Code display */}
      <div className="flex gap-4 mb-12">
        {chars.map((char, i) => (
          <div
            key={i}
            className="w-20 h-[100px] flex items-center justify-center bg-gray-900 border-2 border-gray-700 rounded-2xl text-5xl font-bold font-display animate-code-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {char}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-lg text-gray-500 mb-16">
        Enter this code to connect your account
      </p>

      {/* Expiry progress bar */}
      <div className="w-80 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-3">
        Code expires in {Math.ceil((progress / 100) * 10)} min
      </p>
    </div>
  );
}
