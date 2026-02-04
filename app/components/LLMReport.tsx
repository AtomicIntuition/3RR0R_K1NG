'use client';

import { useState, useRef, useEffect } from 'react';

interface LLMReportProps {
  report: string;
}

export function LLMReport({ report }: LLMReportProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLPreElement>(null);
  const [needsExpand, setNeedsExpand] = useState(false);

  // Check if content overflows
  useEffect(() => {
    if (contentRef.current) {
      setNeedsExpand(contentRef.current.scrollHeight > 192); // 12rem = 192px
    }
  }, [report]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard copy failed
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">AI Fix Report</h3>
            <p className="text-sm text-gray-500">
              Copy this report and paste it into Claude, ChatGPT, or any AI assistant
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${
            copied
              ? 'bg-success/10 text-success border border-success/30'
              : 'bg-primary text-white hover:bg-primary-600 active:scale-95'
          }`}
        >
          {copied ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy for AI
            </span>
          )}
        </button>
      </div>

      {/* Report Content */}
      <div className="p-4">
        <div className={`relative ${!expanded && needsExpand ? 'max-h-48' : ''} overflow-hidden`}>
          <pre
            ref={contentRef}
            className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-xl leading-relaxed overflow-x-auto border border-gray-100"
          >
            {report}
          </pre>
          {!expanded && needsExpand && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>

        {needsExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-primary hover:text-primary-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {expanded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Show less
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show full report
              </>
            )}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="px-4 pb-4">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
          <p className="text-xs text-gray-500">
            <strong className="text-primary">How to use:</strong> Click &quot;Copy for AI&quot;, then paste into your favorite AI assistant
            (Claude, ChatGPT, etc.) and ask it to fix the issues. The report includes exact CSS selectors,
            error messages, and prioritized fix instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
