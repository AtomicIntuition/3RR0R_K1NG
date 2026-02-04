'use client';

import { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';

interface RoastTextProps {
  title: string;
  body: string;
  score: number;
  persona?: string;
  className?: string;
}

export function RoastText({ title, body, score, className }: RoastTextProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [reportId, setReportId] = useState('------');

  useEffect(() => {
    setReportId(Math.random().toString(36).slice(2, 8).toUpperCase());
    const timer = setTimeout(() => setIsRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Determine severity based on score
  const getSeverityStyles = () => {
    if (score >= 85) {
      return {
        borderClass: 'border-success',
        bgClass: 'bg-success/5',
        titleColor: 'text-success',
        label: 'Excellent',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    }
    if (score >= 65) {
      return {
        borderClass: 'border-warning',
        bgClass: 'bg-warning/5',
        titleColor: 'text-warning',
        label: 'Needs Attention',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    }
    if (score >= 40) {
      return {
        borderClass: 'border-warning-dark',
        bgClass: 'bg-warning/5',
        titleColor: 'text-warning-dark',
        label: 'Significant Issues',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    }
    return {
      borderClass: 'border-danger',
      bgClass: 'bg-danger/5',
      titleColor: 'text-danger',
      label: 'Critical',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    };
  };

  const styles = getSeverityStyles();

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border p-4 sm:p-6',
        styles.borderClass,
        styles.bgClass,
        'transition-all duration-300',
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {/* Severity label */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span
          className={clsx(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
            'bg-white border',
            styles.borderClass,
            styles.titleColor
          )}
        >
          {styles.icon}
          <span>{styles.label}</span>
        </span>
        <span className="text-xs text-gray-400">Report ID: {reportId}</span>
      </div>

      {/* Title */}
      <h2 className={clsx('text-xl sm:text-2xl font-semibold mb-4', styles.titleColor)}>
        {title}
      </h2>

      {/* Body */}
      <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
        {body}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="text-xs text-gray-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Analyzed by Crisp</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-gray-400">Analysis Complete</span>
        </div>
      </div>
    </div>
  );
}

// Alias for new naming convention
export const ReportSummary = RoastText;
