'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Copy, Check } from 'lucide-react';
import { getGrade } from '@/lib/scoring';

interface ShareCardProps {
  scanId: string;
  url: string;
  score: number;
  twitterRoast?: string;
  className?: string;
}

export function ShareCard({ scanId, url, score, twitterRoast, className }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/scan/${scanId}`
    : '';

  const grade = getGrade(score);
  const domain = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  const shareText = twitterRoast
    ? `${twitterRoast}\n\nAnalyze your site:`
    : `${domain} scored ${score}/100 (Grade: ${grade}). Full report:`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      <button
        onClick={handleCopy}
        className={clsx(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
          copied
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
            : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-gray-100'
        )}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>

      <button
        onClick={handleTwitterShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 hover:text-gray-100 transition-all"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>X</span>
      </button>

      <button
        onClick={handleLinkedInShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 hover:text-gray-100 transition-all"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        <span>LinkedIn</span>
      </button>
    </div>
  );
}
