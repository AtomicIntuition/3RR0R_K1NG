'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ExecutiveSummary as ExecutiveSummaryType } from '@/types/scan';
import { Shield, AlertTriangle, Target } from 'lucide-react';

interface ExecutiveSummaryProps {
  body: string;
  score: number;
  className?: string;
}

function parseExecutiveSummary(body: string): ExecutiveSummaryType | null {
  try {
    const parsed = JSON.parse(body);
    if (parsed.keyStrength && parsed.biggestRisk && parsed.topPriority) {
      return parsed as ExecutiveSummaryType;
    }
    return null;
  } catch {
    return null;
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3, ease: 'easeOut' },
  }),
};

export function ExecutiveSummary({ body, score, className }: ExecutiveSummaryProps) {
  const summary = useMemo(() => parseExecutiveSummary(body), [body]);

  // Fallback: render plain text in a single card for existing scans
  if (!summary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-900 border border-gray-800 rounded-xl p-5 ${className || ''}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Analysis Summary</span>
        </div>
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{body}</p>
      </motion.div>
    );
  }

  const cards = [
    {
      key: 'keyStrength',
      label: 'KEY STRENGTH',
      content: summary.keyStrength,
      icon: Shield,
      borderColor: 'border-l-emerald-500',
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/5',
    },
    {
      key: 'biggestRisk',
      label: 'BIGGEST RISK',
      content: summary.biggestRisk,
      icon: AlertTriangle,
      borderColor: 'border-l-red-500',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/5',
    },
    {
      key: 'topPriority',
      label: 'TOP PRIORITY',
      content: summary.topPriority,
      icon: Target,
      borderColor: 'border-l-amber-500',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/5',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${className || ''}`}>
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className={`border-l-4 ${card.borderColor} ${card.bgColor} bg-gray-900 border border-gray-800 rounded-xl p-4`}
        >
          <div className="flex items-center gap-2 mb-3">
            <card.icon size={16} className={card.iconColor} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {card.label}
            </span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">{card.content}</p>
        </motion.div>
      ))}
    </div>
  );
}
