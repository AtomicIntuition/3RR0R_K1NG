'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { getGrade } from '@/lib/scoring';

interface ShareCardProps {
  scanId: string;
  url: string;
  score: number;
  className?: string;
}

export function ShareCard({ scanId, url, score, className }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/scan/${scanId}`
    : '';

  const grade = getGrade(score);
  const domain = new URL(url).hostname;

  const shareText = `I just got my website roasted by 3RROR_K1NG! ${domain} scored ${score}/100 (Grade: ${grade}). Check out the brutal truth:`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
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
    <div className={clsx('card p-6', className)}>
      <h3 className="text-lg font-bold text-gray-100 mb-4">
        <span className="text-terminal">&gt;</span> Share Your Roast
      </h3>

      <p className="text-sm text-gray-400 mb-6">
        Brave enough to share your results? Let the world see your score.
      </p>

      {/* Share URL input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="input flex-1 text-sm"
        />
        <button
          onClick={handleCopy}
          className={clsx(
            'px-4 py-2 rounded font-medium transition-all duration-200',
            copied
              ? 'bg-terminal text-void'
              : 'bg-void-100 text-gray-300 hover:bg-void-200'
          )}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Social share buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTwitterShare}
          className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] rounded hover:bg-[#1DA1F2]/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Share on X</span>
        </button>

        <button
          onClick={handleLinkedInShare}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-[#0A66C2] rounded hover:bg-[#0A66C2]/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span>Share on LinkedIn</span>
        </button>
      </div>

      {/* Preview card */}
      <div className="mt-6 p-4 bg-void-100 rounded-lg border border-void-200">
        <p className="text-xs text-gray-500 mb-2">Social preview:</p>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-void-200 rounded flex items-center justify-center text-2xl font-bold text-terminal">
            {grade}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-200 truncate">{domain}</p>
            <p className="text-sm text-gray-400">
              Scored {score}/100 on 3RROR_K1NG
            </p>
            <p className="text-xs text-gray-500 mt-1">3rror-k1ng.vercel.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}
