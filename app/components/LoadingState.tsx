'use client';

import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  phase?: string;
  percentage?: number;
  completedAudits?: string[];
  currentPhase?: string;
  className?: string;
}

// SVG icons for each audit type
const AuditIcon = ({ type, className }: { type: string; className?: string }) => {
  const iconClass = clsx('w-5 h-5', className);

  switch (type) {
    case 'Security':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'SEO':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case 'Accessibility':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'Code Quality':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case 'Tech Stack':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'Resources':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'Deep Scan':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case 'Performance':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const ALL_AUDITS = ['Security', 'SEO', 'Accessibility', 'Code Quality', 'Tech Stack', 'Resources', 'Deep Scan', 'Performance'];

const DISPLAY_TO_PHASE: Record<string, string> = {
  'Security': 'security',
  'SEO': 'seo',
  'Accessibility': 'accessibility',
  'Code Quality': 'code_quality',
  'Tech Stack': 'tech_stack',
  'Resources': 'resources',
  'Deep Scan': 'extended_audits',
  'Performance': 'performance',
};

export function LoadingState({ phase, percentage = 0, completedAudits = [], currentPhase = '', className }: LoadingStateProps) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const isCurrentAudit = (auditName: string): boolean => {
    const phaseKey = DISPLAY_TO_PHASE[auditName];
    return phaseKey === currentPhase;
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center py-6 sm:py-10 w-full max-w-2xl mx-auto', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 font-display">
          Analyzing Website
        </h2>
        <p className="text-primary text-sm">{phase}</p>
      </motion.div>

      {/* Main Progress Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
          {/* Progress header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <span className="text-sm font-medium text-gray-600">Audit Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{percentage}%</span>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>

          {/* Current activity */}
          <div className="p-6">
            <div className="flex items-center justify-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              <span className="text-gray-600">
                {currentPhase === 'roast' ? 'Generating AI analysis...' :
                 currentPhase === 'complete' ? 'Finalizing report...' :
                 `Running ${currentPhase.replace('_', ' ')} audit...`}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Audit Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {ALL_AUDITS.map((audit) => {
            const isComplete = completedAudits.includes(audit);
            const isCurrent = isCurrentAudit(audit);

            return (
              <div
                key={audit}
                className={clsx(
                  'flex flex-col items-center p-3 rounded-xl border transition-all duration-300',
                  isComplete && 'bg-success/5 border-success/30',
                  isCurrent && 'bg-primary/5 border-primary/30 shadow-sm',
                  !isComplete && !isCurrent && 'bg-gray-50 border-gray-100 opacity-50'
                )}
              >
                <AuditIcon
                  type={audit}
                  className={clsx(
                    isComplete && 'text-success',
                    isCurrent && 'text-primary',
                    !isComplete && !isCurrent && 'text-gray-400'
                  )}
                />
                <span className={clsx(
                  'text-[9px] sm:text-[10px] font-medium text-center leading-tight mt-1',
                  isComplete && 'text-success',
                  isCurrent && 'text-primary',
                  !isComplete && !isCurrent && 'text-gray-400'
                )}>
                  {audit.split(' ')[0]}
                </span>
                {isComplete && (
                  <svg className="w-3 h-3 text-success mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isCurrent && (
                  <span className="relative flex h-2 w-2 mt-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Circular Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex items-center justify-center gap-4"
      >
        <div className="relative">
          {/* Ambient glow */}
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)`,
              transform: 'scale(1.5)',
            }}
          />
          <svg className="w-16 h-16 transform -rotate-90 relative" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="4 4"
              className="text-gray-200"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-primary transition-all duration-500 ease-premium"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm font-display">{percentage}%</span>
          </div>
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="text-sm font-semibold text-gray-700">{completedAudits.length} / 8 audits</p>
        </div>
      </motion.div>
    </div>
  );
}
