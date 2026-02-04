'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { RoastFix } from '@/types/scan';
import {
  AlertCircle,
  AlertTriangle,
  FileText,
  Lightbulb,
  Zap,
  Shield,
  Search,
  Accessibility,
  Code,
  Clock,
  Wrench,
  CheckCircle,
  Copy,
  TrendingUp,
} from 'lucide-react';

interface FixListProps {
  fixes: RoastFix[];
  className?: string;
}

const PRIORITY_CONFIG = {
  critical: {
    badge: 'bg-danger/10 text-danger border-danger/30',
    Icon: AlertCircle,
  },
  high: {
    badge: 'bg-warning/10 text-warning border-warning/30',
    Icon: AlertTriangle,
  },
  medium: {
    badge: 'bg-gray-700 text-gray-300 border-gray-600',
    Icon: FileText,
  },
  low: {
    badge: 'bg-gray-800 text-gray-400 border-gray-700',
    Icon: Lightbulb,
  },
};

const EFFORT_CONFIG = {
  quick: {
    text: 'Quick fix',
    color: 'text-success',
    Icon: Zap,
  },
  medium: {
    text: 'Moderate effort',
    color: 'text-warning',
    Icon: Clock,
  },
  significant: {
    text: 'Significant effort',
    color: 'text-danger',
    Icon: Wrench,
  },
};

const CATEGORY_ICONS = {
  performance: Zap,
  security: Shield,
  seo: Search,
  accessibility: Accessibility,
  code_quality: Code,
};

export function FixList({ fixes, className }: FixListProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  if (!fixes || fixes.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <p className="text-gray-400">No critical issues found. Nice work!</p>
      </div>
    );
  }

  const handleCopyAll = async () => {
    const markdown = fixes.map((fix, i) => {
      let line = `${i + 1}. **[${fix.priority.toUpperCase()}]** ${fix.title}\n`;
      line += `   ${fix.description}\n`;
      line += `   Effort: ${fix.effort} | Category: ${fix.category.replace('_', ' ')}`;
      if (fix.impact) line += `\n   Impact: ${fix.impact}`;
      return line;
    }).join('\n\n');

    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Clipboard write failed
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-50">
          Priority Fixes
        </h3>
        <span className="text-sm text-gray-400">
          {fixes.length} item{fixes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <ul className="space-y-3">
        {fixes.map((fix, index) => {
          const priorityConfig = PRIORITY_CONFIG[fix.priority];
          const effortConfig = EFFORT_CONFIG[fix.effort];
          const CategoryIcon = CATEGORY_ICONS[fix.category] || Code;
          const PriorityIcon = priorityConfig.Icon;
          const EffortIcon = effortConfig.Icon;

          return (
            <li
              key={index}
              className={clsx(
                'group p-4 rounded-xl bg-gray-900 border border-gray-800',
                'transition-all duration-200',
                'hover:border-gray-700'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Priority badge */}
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium uppercase shrink-0',
                      'border',
                      priorityConfig.badge
                    )}
                  >
                    <PriorityIcon size={14} />
                    <span>{fix.priority}</span>
                  </span>

                  {/* Title */}
                  <h4 className="font-medium text-gray-50 leading-tight pt-0.5">
                    {fix.title}
                  </h4>
                </div>

                {/* Category icon */}
                <div
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0"
                  title={fix.category.replace('_', ' ')}
                >
                  <CategoryIcon size={16} className="text-gray-400" />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-3 pl-0 sm:pl-[100px]">
                {fix.description}
              </p>

              {/* Impact */}
              {fix.impact && (
                <p className="text-sm text-emerald-400/80 mb-3 pl-0 sm:pl-[100px] flex items-center gap-1.5">
                  <TrendingUp size={14} className="shrink-0" />
                  <span>{fix.impact}</span>
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center gap-4 pl-0 sm:pl-[100px] text-xs">
                {/* Effort estimate */}
                <div className="flex items-center gap-1.5">
                  <EffortIcon size={14} className={effortConfig.color} />
                  <span className={effortConfig.color}>{effortConfig.text}</span>
                </div>

                {/* Category */}
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="capitalize">
                    {fix.category.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Copy all fixes button */}
      <button
        onClick={handleCopyAll}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-all"
      >
        <Copy size={14} />
        <span>{copiedAll ? 'Copied!' : 'Copy all fixes'}</span>
      </button>
    </div>
  );
}
