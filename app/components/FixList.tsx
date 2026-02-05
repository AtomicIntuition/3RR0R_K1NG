'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { AuditFix } from '@/types/scan';
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
  ChevronDown,
} from 'lucide-react';

interface FixListProps {
  fixes: AuditFix[];
  className?: string;
}

type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type SortMode = 'priority' | 'quickwins' | 'category';

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const PRIORITY_CONFIG = {
  critical: {
    badge: 'bg-danger/10 text-danger border-danger/30',
    border: 'border-l-red-500',
    dot: 'bg-red-500',
    numberBg: 'bg-red-500/15 text-red-400',
    Icon: AlertCircle,
  },
  high: {
    badge: 'bg-warning/10 text-warning border-warning/30',
    border: 'border-l-orange-500',
    dot: 'bg-orange-500',
    numberBg: 'bg-orange-500/15 text-orange-400',
    Icon: AlertTriangle,
  },
  medium: {
    badge: 'bg-gray-700 text-gray-300 border-gray-600',
    border: 'border-l-yellow-500',
    dot: 'bg-yellow-500',
    numberBg: 'bg-yellow-500/15 text-yellow-400',
    Icon: FileText,
  },
  low: {
    badge: 'bg-gray-800 text-gray-400 border-gray-700',
    border: 'border-l-gray-500',
    dot: 'bg-gray-500',
    numberBg: 'bg-gray-700 text-gray-400',
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
    text: 'Moderate',
    color: 'text-warning',
    Icon: Clock,
  },
  significant: {
    text: 'Significant',
    color: 'text-danger',
    Icon: Wrench,
  },
};

const CATEGORY_ICONS: Record<string, typeof Zap> = {
  performance: Zap,
  security: Shield,
  seo: Search,
  accessibility: Accessibility,
  code_quality: Code,
};

export function FixList({ fixes, className }: FixListProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('priority');

  // Count by priority
  const priorityCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const fix of fixes) counts[fix.priority]++;
    return counts;
  }, [fixes]);

  // Count quick wins
  const quickWinCount = useMemo(() => fixes.filter(f => f.effort === 'quick').length, [fixes]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const fix of fixes) {
      counts[fix.category] = (counts[fix.category] || 0) + 1;
    }
    return counts;
  }, [fixes]);

  // Filter & sort
  const filteredFixes = useMemo(() => {
    let result = [...fixes];

    if (priorityFilter !== 'all') {
      result = result.filter(f => f.priority === priorityFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(f => f.category === categoryFilter);
    }

    switch (sortMode) {
      case 'quickwins':
        result.sort((a, b) => {
          const effortOrder: Record<string, number> = { quick: 0, medium: 1, significant: 2 };
          const diff = effortOrder[a.effort] - effortOrder[b.effort];
          if (diff !== 0) return diff;
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        });
        break;
      case 'category':
        result.sort((a, b) => {
          if (a.category !== b.category) return a.category.localeCompare(b.category);
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        });
        break;
      case 'priority':
      default:
        result.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        break;
    }

    return result;
  }, [fixes, priorityFilter, categoryFilter, sortMode]);

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

  const toggleExpand = (index: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

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
    } catch { /* noop */ }
  };

  const handleCopyOne = async (fix: AuditFix, index: number) => {
    const text = `[${fix.priority.toUpperCase()}] ${fix.title}\n${fix.description}${fix.impact ? `\nImpact: ${fix.impact}` : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch { /* noop */ }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-50 flex items-center gap-2">
          <div className="w-1 h-5 bg-emerald-500 rounded-full" />
          Priority Fixes
        </h3>
      </div>

      {/* 3A. Summary Stats Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        {(['critical', 'high', 'medium', 'low'] as const).map(p => {
          if (priorityCounts[p] === 0) return null;
          const config = PRIORITY_CONFIG[p];
          return (
            <span key={p} className="flex items-center gap-1.5 text-gray-400">
              <span className={clsx('w-2 h-2 rounded-full', config.dot)} />
              <span className="font-medium">{priorityCounts[p]}</span>
              <span className="capitalize">{p}</span>
            </span>
          );
        })}
        {quickWinCount > 0 && (
          <span className="flex items-center gap-1.5 text-emerald-400 ml-auto">
            <Zap size={12} />
            <span className="font-medium">{quickWinCount}</span>
            <span>quick win{quickWinCount !== 1 ? 's' : ''}</span>
          </span>
        )}
      </div>

      {/* 3B. Filter/Sort Controls */}
      <div className="space-y-2 mb-4">
        {/* Priority filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map(p => {
            const count = p === 'all' ? fixes.length : priorityCounts[p];
            if (p !== 'all' && count === 0) return null;
            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  priorityFilter === p
                    ? 'bg-gray-700 text-gray-100'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                )}
              >
                {p === 'all' ? 'All' : <span className="capitalize">{p}</span>}
                <span className="ml-1 text-gray-500">{count}</span>
              </button>
            );
          })}

          {/* Divider */}
          <span className="w-px h-4 bg-gray-800 mx-1" />

          {/* Category filters */}
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const Icon = CATEGORY_ICONS[cat] || Code;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                className={clsx(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                  categoryFilter === cat
                    ? 'bg-gray-700 text-gray-100'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                )}
                title={cat.replace('_', ' ')}
              >
                <Icon size={12} />
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-gray-600">Sort:</span>
          {([
            { key: 'priority' as SortMode, label: 'Priority' },
            { key: 'quickwins' as SortMode, label: 'Quick wins' },
            { key: 'category' as SortMode, label: 'Category' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortMode(key)}
              className={clsx(
                'px-2 py-0.5 rounded text-xs transition-colors',
                sortMode === key
                  ? 'text-emerald-400 font-medium'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 3C. Fix Cards */}
      <ul className="space-y-2">
        {filteredFixes.map((fix, index) => {
          const priorityConfig = PRIORITY_CONFIG[fix.priority];
          const effortConfig = EFFORT_CONFIG[fix.effort];
          const CategoryIcon = CATEGORY_ICONS[fix.category] || Code;
          const PriorityIcon = priorityConfig.Icon;
          const EffortIcon = effortConfig.Icon;
          const isExpanded = expandedIds.has(index);
          const originalIndex = fixes.indexOf(fix);

          return (
            <li
              key={`${fix.title}-${originalIndex}`}
              className={clsx(
                'rounded-xl bg-gray-900 border border-gray-800 border-l-4 overflow-hidden',
                'transition-all duration-200',
                'hover:border-gray-700',
                priorityConfig.border
              )}
            >
              {/* Collapsed row */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left"
              >
                {/* Number circle */}
                <span className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  priorityConfig.numberBg
                )}>
                  {originalIndex + 1}
                </span>

                {/* Priority badge */}
                <span
                  className={clsx(
                    'hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase shrink-0 border',
                    priorityConfig.badge
                  )}
                >
                  <PriorityIcon size={10} />
                  {fix.priority}
                </span>

                {/* Title */}
                <span className="font-medium text-gray-100 text-sm flex-1 min-w-0 truncate">
                  {fix.title}
                </span>

                {/* Category icon */}
                <div
                  className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center shrink-0"
                  title={fix.category.replace('_', ' ')}
                >
                  <CategoryIcon size={12} className="text-gray-500" />
                </div>

                {/* Effort badge */}
                <span className={clsx('hidden sm:flex items-center gap-1 text-[10px] shrink-0', effortConfig.color)}>
                  <EffortIcon size={10} />
                  {effortConfig.text}
                </span>

                {/* Expand chevron */}
                <ChevronDown
                  size={14}
                  className={clsx('text-gray-500 transition-transform shrink-0', isExpanded && 'rotate-180')}
                />
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-800/50 space-y-3">
                  {/* Mobile priority + effort */}
                  <div className="flex items-center gap-2 sm:hidden mt-3">
                    <span className={clsx(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase border',
                      priorityConfig.badge
                    )}>
                      <PriorityIcon size={10} />
                      {fix.priority}
                    </span>
                    <span className={clsx('flex items-center gap-1 text-[10px]', effortConfig.color)}>
                      <EffortIcon size={10} />
                      {effortConfig.text}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 leading-relaxed mt-3 sm:mt-2">
                    {fix.description}
                  </p>

                  {/* Impact */}
                  {fix.impact && (
                    <p className="text-sm text-emerald-400/80 flex items-start gap-1.5">
                      <TrendingUp size={14} className="shrink-0 mt-0.5" />
                      <span>{fix.impact}</span>
                    </p>
                  )}

                  {/* Footer meta */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-500 capitalize">
                      {fix.category.replace('_', ' ')}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyOne(fix, index); }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <Copy size={12} />
                      {copiedIndex === index ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filteredFixes.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-6">
          No fixes match the current filters.
        </p>
      )}

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
