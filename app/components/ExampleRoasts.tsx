'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

interface ExampleReport {
  id: string;
  url: string;
  domain: string;
  score: number;
  letterGrade: string;
  roastTitle: string;
  persona?: string;
}

// Fallback example reports
const FALLBACK_REPORTS: ExampleReport[] = [
  {
    id: 'example-1',
    url: 'https://example.com',
    domain: 'example.com',
    score: 42,
    letterGrade: 'F',
    roastTitle: 'Critical security and performance issues detected',
  },
  {
    id: 'example-2',
    url: 'https://slow-site.com',
    domain: 'slow-site.com',
    score: 58,
    letterGrade: 'D+',
    roastTitle: 'Multiple security headers missing',
  },
  {
    id: 'example-3',
    url: 'https://almost-good.io',
    domain: 'almost-good.io',
    score: 76,
    letterGrade: 'C+',
    roastTitle: 'Good foundation with room for improvement',
  },
];

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-success';
  if (grade.startsWith('B')) return 'text-warning';
  if (grade.startsWith('C')) return 'text-warning-dark';
  return 'text-danger';
}

export function ExampleRoasts() {
  const [reports, setReports] = useState<ExampleReport[]>(FALLBACK_REPORTS);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchRecentReports() {
      try {
        const response = await fetch('/api/roasts/recent');
        if (response.ok) {
          const data = await response.json();
          if (data.roasts && data.roasts.length > 0) {
            setReports(data.roasts);
          }
        }
      } catch {
        // Use fallback reports
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentReports();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reports.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reports.length]);

  const currentReport = reports[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-center mb-4 text-gray-800">
        Recent Reports
      </h2>

      {/* Carousel */}
      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-card p-6 overflow-hidden">
        <div className="relative">
          {/* Report card */}
          <div className="flex items-start gap-4">
            {/* Score circle */}
            <div className={clsx(
              'flex-shrink-0 w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-xl',
              currentReport.score >= 70 ? 'border-success text-success' :
              currentReport.score >= 50 ? 'border-warning text-warning' :
              'border-danger text-danger'
            )}>
              {currentReport.score}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={clsx('text-2xl font-bold', getGradeColor(currentReport.letterGrade))}>
                  {currentReport.letterGrade}
                </span>
                <span className="text-sm text-gray-400">
                  {currentReport.domain}
                </span>
              </div>
              <p className="text-gray-600 font-medium text-sm line-clamp-2">
                "{currentReport.roastTitle}"
              </p>
              {currentReport.id && !currentReport.id.startsWith('example') && (
                <Link
                  href={`/scan/${currentReport.id}`}
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  View full report →
                </Link>
              )}
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-4">
            {reports.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={clsx(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-primary w-4'
                    : 'bg-gray-200 hover:bg-gray-300'
                )}
                aria-label={`Go to report ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        Real audits from our users. Your site could be next.
      </p>
    </div>
  );
}

// Alias for new naming convention
export const RecentReports = ExampleRoasts;
