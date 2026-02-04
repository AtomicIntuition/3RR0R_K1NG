'use client';

import { motion } from 'framer-motion';
import { getCategoryDisplayName, SCORE_WEIGHTS, type CategoryScores } from '@/lib/scoring';

interface CategoryProgressBarProps {
  category: keyof CategoryScores;
  score: number;
  onClick?: () => void;
}

function getBarColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

function getBarGlow(score: number): string {
  if (score >= 90) return 'shadow-emerald-500/20';
  if (score >= 70) return 'shadow-yellow-500/20';
  if (score >= 50) return 'shadow-orange-500/20';
  return 'shadow-red-500/20';
}

function getTextColor(score: number): string {
  if (score >= 90) return 'text-emerald-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 50) return 'text-orange-500';
  return 'text-red-500';
}

export function CategoryProgressBar({ category, score, onClick }: CategoryProgressBarProps) {
  const displayName = getCategoryDisplayName(category);
  const weight = SCORE_WEIGHTS[category];
  const weightPercent = Math.round(weight * 100);

  return (
    <button
      onClick={onClick}
      className="w-full group flex items-center gap-3 py-1.5 hover:bg-gray-800/30 rounded-lg px-2 -mx-2 transition-colors"
    >
      <span className="text-sm text-gray-300 w-[100px] text-left truncate group-hover:text-gray-100 transition-colors">
        {displayName}
      </span>
      <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className={`h-full rounded-full ${getBarColor(score)} shadow-sm ${getBarGlow(score)}`}
        />
      </div>
      <span className={`text-sm font-semibold w-[40px] text-right tabular-nums ${getTextColor(score)}`}>
        {score}
      </span>
      <span className="text-[10px] text-gray-500 w-[32px] text-right">
        {weightPercent}%
      </span>
    </button>
  );
}
