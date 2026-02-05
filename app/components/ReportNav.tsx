'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { useScrollSpy } from '@/lib/useScrollSpy';
import {
  BarChart3, FileText, Wrench,
  Shield, Zap, Accessibility, Search, Code,
  Layers, Cpu, Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ReportNavProps {
  categoryScores?: Record<string, number | undefined>;
  hasSummary: boolean;
  hasFixes: boolean;
  hasTechStack: boolean;
  hasLLMReport: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  score?: number;
}

function scoreToColor(score?: number): string {
  if (score === undefined) return 'bg-gray-600';
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

export function ReportNav({ categoryScores, hasSummary, hasFixes, hasTechStack, hasLLMReport }: ReportNavProps) {
  const navItems = useMemo(() => {
    const items: NavItem[] = [
      { id: 'section-overview', label: 'Overview', icon: BarChart3 },
    ];

    if (hasSummary) {
      items.push({ id: 'section-summary', label: 'Summary', icon: FileText });
    }

    if (hasFixes) {
      items.push({ id: 'section-fixes', label: 'Fixes', icon: Wrench });
    }

    // Category sections
    if (categoryScores?.security !== undefined) {
      items.push({ id: 'category-security', label: 'Security', icon: Shield, score: categoryScores.security });
    }
    if (categoryScores?.performance !== undefined) {
      items.push({ id: 'category-performance', label: 'Performance', icon: Zap, score: categoryScores.performance });
    }
    if (categoryScores?.accessibility !== undefined) {
      items.push({ id: 'category-accessibility', label: 'A11y', icon: Accessibility, score: categoryScores.accessibility });
    }
    if (categoryScores?.seo !== undefined) {
      items.push({ id: 'category-seo', label: 'SEO', icon: Search, score: categoryScores.seo });
    }
    if (categoryScores?.codeQuality !== undefined) {
      items.push({ id: 'category-codeQuality', label: 'Code', icon: Code, score: categoryScores.codeQuality });
    }

    if (hasTechStack) {
      items.push({ id: 'section-techstack', label: 'Stack', icon: Layers });
    }

    if (hasLLMReport) {
      items.push({ id: 'section-ai', label: 'AI', icon: Sparkles });
    }

    return items;
  }, [categoryScores, hasSummary, hasFixes, hasTechStack, hasLLMReport]);

  const sectionIds = useMemo(() => navItems.map(item => item.id), [navItems]);
  const activeId = useScrollSpy(sectionIds);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (navItems.length === 0) return null;

  return (
    <>
      {/* Desktop: Fixed left sidebar */}
      <nav className="hidden xl:block fixed left-[max(1rem,calc((100vw-56rem)/2-11rem))] top-[120px] z-20 w-36">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-gray-800 text-gray-50'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
                )}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.score !== undefined && (
                  <span className={clsx('w-2 h-2 rounded-full ml-auto shrink-0', scoreToColor(item.score))} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile/tablet: Horizontal sticky pill bar */}
      <nav className="xl:hidden sticky top-[48px] z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/30">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0',
                  isActive
                    ? 'bg-gray-800 text-gray-50'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                <Icon size={12} className="shrink-0" />
                <span>{item.label}</span>
                {item.score !== undefined && (
                  <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', scoreToColor(item.score))} />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
