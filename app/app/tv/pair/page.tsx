'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TVPairPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paired, setPaired] = useState(false);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/login?redirect=/tv/pair');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      toast.error('Please enter a 6-character code');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tv/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, userId: user!.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to pair');
        return;
      }

      setPaired(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (paired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">TV Paired!</h1>
        <p className="text-gray-400 text-center">
          Your TV is now connected. You can close this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-2xl font-bold mb-2">Pair Your TV</h1>
      <p className="text-gray-400 mb-8 text-center">
        Enter the 6-character code shown on your TV screen
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center gap-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="XXXXXX"
          maxLength={6}
          autoFocus
          className="w-full text-center text-3xl font-bold font-mono tracking-[0.5em] py-4 px-6 bg-gray-900 border border-gray-700 rounded-xl text-gray-50 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />

        <button
          type="submit"
          disabled={submitting || code.trim().length !== 6}
          className="w-full py-3 px-6 bg-primary text-gray-950 font-semibold rounded-xl hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Pairing...' : 'Pair'}
        </button>
      </form>
    </div>
  );
}
