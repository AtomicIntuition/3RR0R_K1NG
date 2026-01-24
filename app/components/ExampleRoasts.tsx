'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

interface ExampleRoast {
  id: string;
  url: string;
  domain: string;
  score: number;
  letterGrade: string;
  roastTitle: string;
  persona?: string;
}

// Fallback example roasts for when the API isn't available
const FALLBACK_ROASTS: ExampleRoast[] = [
  {
    id: 'example-1',
    url: 'https://example.com',
    domain: 'example.com',
    score: 42,
    letterGrade: 'F',
    roastTitle: 'WHO DEPLOYED THIS TO PRODUCTION?!',
    persona: 'hacker',
  },
  {
    id: 'example-2',
    url: 'https://slow-site.com',
    domain: 'slow-site.com',
    score: 58,
    letterGrade: 'D+',
    roastTitle: 'Your Firewall Has Feelings, And I Hurt Them',
    persona: 'gordon',
  },
  {
    id: 'example-3',
    url: 'https://almost-good.io',
    domain: 'almost-good.io',
    score: 76,
    letterGrade: 'C+',
    roastTitle: 'I Expected More From You',
    persona: 'parent',
  },
];

const PERSONA_EMOJI: Record<string, string> = {
  hacker: '💀',
  gordon: '👨‍🍳',
  parent: '😔',
  interviewer: '🤔',
  drill: '🎖️',
  meme: '🗿',
  therapist: '🛋️',
};

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-terminal';
  if (grade.startsWith('B')) return 'text-neon-yellow';
  if (grade.startsWith('C')) return 'text-neon-orange';
  return 'text-danger';
}

export function ExampleRoasts() {
  const [roasts, setRoasts] = useState<ExampleRoast[]>(FALLBACK_ROASTS);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchRecentRoasts() {
      try {
        const response = await fetch('/api/roasts/recent');
        if (response.ok) {
          const data = await response.json();
          if (data.roasts && data.roasts.length > 0) {
            setRoasts(data.roasts);
          }
        }
      } catch {
        // Use fallback roasts
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentRoasts();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % roasts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [roasts.length]);

  const currentRoast = roasts[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-center mb-4">
        <span className="text-terminal">&gt;</span> Recent Roasts
      </h2>

      {/* Carousel */}
      <div className="relative bg-void-50/50 rounded-lg border border-void-100 p-6 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
        </div>

        <div className="relative">
          {/* Roast card */}
          <div className="flex items-start gap-4">
            {/* Score circle */}
            <div className={clsx(
              'flex-shrink-0 w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-xl',
              currentRoast.score >= 70 ? 'border-terminal text-terminal' :
              currentRoast.score >= 50 ? 'border-neon-yellow text-neon-yellow' :
              'border-danger text-danger'
            )}>
              {currentRoast.score}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={clsx('text-2xl font-black', getGradeColor(currentRoast.letterGrade))}>
                  {currentRoast.letterGrade}
                </span>
                <span className="text-sm text-gray-500">
                  {currentRoast.domain}
                </span>
                {currentRoast.persona && (
                  <span className="text-sm" title={`Roasted by ${currentRoast.persona}`}>
                    {PERSONA_EMOJI[currentRoast.persona] || '💀'}
                  </span>
                )}
              </div>
              <p className="text-gray-300 font-medium text-sm line-clamp-2">
                "{currentRoast.roastTitle}"
              </p>
              {currentRoast.id && !currentRoast.id.startsWith('example') && (
                <Link
                  href={`/scan/${currentRoast.id}`}
                  className="text-xs text-terminal hover:underline mt-2 inline-block"
                >
                  View full roast →
                </Link>
              )}
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-4">
            {roasts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={clsx(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-terminal w-4'
                    : 'bg-void-100 hover:bg-terminal/50'
                )}
                aria-label={`Go to roast ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-3">
        Real scans from our users. Your site could be next.
      </p>
    </div>
  );
}
