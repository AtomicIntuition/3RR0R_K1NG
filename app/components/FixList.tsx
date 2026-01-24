'use client';

import clsx from 'clsx';
import type { RoastFix } from '@/types/scan';

interface FixListProps {
  fixes: RoastFix[];
  className?: string;
}

const PRIORITY_STYLES = {
  critical: {
    badge: 'bg-danger/20 text-danger border-danger/50',
    icon: '🚨',
    glow: 'hover:shadow-danger/10',
  },
  high: {
    badge: 'bg-neon-orange/20 text-neon-orange border-neon-orange/50',
    icon: '⚠️',
    glow: 'hover:shadow-neon-orange/10',
  },
  medium: {
    badge: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50',
    icon: '📝',
    glow: 'hover:shadow-neon-yellow/10',
  },
  low: {
    badge: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50',
    icon: '💡',
    glow: 'hover:shadow-neon-cyan/10',
  },
};

const EFFORT_LABELS = {
  quick: { text: '~15 min', color: 'text-terminal' },
  medium: { text: '~1 hour', color: 'text-neon-yellow' },
  significant: { text: '~1 day+', color: 'text-neon-orange' },
};

const CATEGORY_ICONS = {
  performance: '⚡',
  security: '🛡️',
  seo: '🔍',
  accessibility: '♿',
  code_quality: '🧹',
};

export function FixList({ fixes, className }: FixListProps) {
  if (!fixes || fixes.length === 0) {
    return (
      <div className={clsx('text-center py-8 text-gray-500', className)}>
        <span className="text-4xl mb-4 block">🎉</span>
        <p>No critical issues found. Nice work!</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-100">
          <span className="text-terminal">&gt;</span> Priority Fixes
        </h3>
        <span className="text-xs text-gray-500 font-mono">
          {fixes.length} item{fixes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <ul className="space-y-3">
        {fixes.map((fix, index) => {
          const priorityStyle = PRIORITY_STYLES[fix.priority];
          const effortLabel = EFFORT_LABELS[fix.effort];
          const categoryIcon = CATEGORY_ICONS[fix.category];

          return (
            <li
              key={index}
              className={clsx(
                'group p-4 rounded-lg bg-void-50 border border-void-100',
                'transition-all duration-200',
                'hover:border-void-200',
                'hover:shadow-lg',
                priorityStyle.glow
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Priority badge */}
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono uppercase shrink-0',
                      'border',
                      priorityStyle.badge
                    )}
                  >
                    <span>{priorityStyle.icon}</span>
                    <span>{fix.priority}</span>
                  </span>

                  {/* Title */}
                  <h4 className="font-medium text-gray-200 leading-tight">
                    {fix.title}
                  </h4>
                </div>

                {/* Category icon */}
                <span
                  className="text-lg shrink-0"
                  title={fix.category.replace('_', ' ')}
                >
                  {categoryIcon}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-3 pl-0 sm:pl-[72px]">
                {fix.description}
              </p>

              {/* Footer */}
              <div className="flex items-center gap-4 pl-0 sm:pl-[72px] text-xs">
                {/* Effort estimate */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Effort:</span>
                  <span className={effortLabel.color}>{effortLabel.text}</span>
                </div>

                {/* Category */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Category:</span>
                  <span className="text-gray-400 capitalize">
                    {fix.category.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Hover hint */}
              <div className="mt-3 pt-3 border-t border-void-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-gray-500">
                  <span className="text-terminal">Tip:</span> Fixing {fix.priority} priority issues first will have the biggest impact on your score.
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
