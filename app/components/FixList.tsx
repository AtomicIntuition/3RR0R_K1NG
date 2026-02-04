'use client';

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
    badge: 'bg-primary/10 text-primary border-primary/30',
    Icon: FileText,
  },
  low: {
    badge: 'bg-gray-100 text-gray-500 border-gray-200',
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
  if (!fixes || fixes.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <p className="text-gray-500">No critical issues found. Nice work!</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Priority Fixes
        </h3>
        <span className="text-sm text-gray-500">
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
                'group p-4 rounded-xl bg-white border border-gray-200',
                'transition-all duration-200',
                'hover:border-gray-300 hover:shadow-sm'
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
                  <h4 className="font-medium text-gray-900 leading-tight pt-0.5">
                    {fix.title}
                  </h4>
                </div>

                {/* Category icon */}
                <div
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"
                  title={fix.category.replace('_', ' ')}
                >
                  <CategoryIcon size={16} className="text-gray-600" />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 pl-0 sm:pl-[100px]">
                {fix.description}
              </p>

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

              {/* Hover hint */}
              <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-gray-500">
                  <span className="text-primary font-medium">Tip:</span> Fixing {fix.priority} priority issues first will have the biggest impact on your score.
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
