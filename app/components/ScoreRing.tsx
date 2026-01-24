'use client';

import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { getScoreColor, getGrade } from '@/lib/scoring';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  showGrade?: boolean;
  animate?: boolean;
  className?: string;
}

const SIZES = {
  sm: { ring: 80, stroke: 6, text: 'text-xl', label: 'text-xs' },
  md: { ring: 120, stroke: 8, text: 'text-3xl', label: 'text-sm' },
  lg: { ring: 160, stroke: 10, text: 'text-4xl', label: 'text-base' },
  xl: { ring: 200, stroke: 12, text: 'text-5xl', label: 'text-lg' },
};

export function ScoreRing({
  score,
  size = 'md',
  label,
  showGrade = false,
  animate = true,
  className,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { ring, stroke, text, label: labelSize } = SIZES[size];
  const radius = (ring - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (displayScore / 100) * circumference;
  const offset = circumference - progress;

  useEffect(() => {
    if (!animate || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          // Animate score counting up
          const duration = 1500;
          const steps = 60;
          const increment = score / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= score) {
              setDisplayScore(score);
              clearInterval(interval);
            } else {
              setDisplayScore(Math.round(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animate, score, hasAnimated]);

  const colorClass = getScoreColor(displayScore);
  const grade = getGrade(displayScore);

  return (
    <div ref={ref} className={clsx('score-ring inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg width={ring} height={ring} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-void-100"
          />
          {/* Progress circle */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={clsx(colorClass, 'transition-all duration-1000 ease-out')}
            style={{
              filter: `drop-shadow(0 0 6px currentColor)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showGrade ? (
            <span className={clsx(text, 'font-bold', colorClass)}>{grade}</span>
          ) : (
            <span className={clsx(text, 'font-bold tabular-nums', colorClass)}>
              {displayScore}
            </span>
          )}
          {!showGrade && (
            <span className={clsx(labelSize, 'text-gray-500')}>/100</span>
          )}
        </div>
      </div>

      {label && (
        <span className={clsx(labelSize, 'mt-2 text-gray-400 font-medium')}>
          {label}
        </span>
      )}
    </div>
  );
}
