'use client';

import { useState } from 'react';

interface LLMReportProps {
  report: string;
}

export function LLMReport({ report }: LLMReportProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-void-50 border border-void-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-void-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-bold text-gray-100">AI Fix Report</h3>
            <p className="text-sm text-gray-500">
              Copy this report and paste it into Claude, ChatGPT, or any AI assistant
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            copied
              ? 'bg-success/20 text-success border border-success/30'
              : 'bg-terminal/10 text-terminal border border-terminal/30 hover:bg-terminal/20'
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

      {/* Preview/Full Report Toggle */}
      <div className="p-4">
        <div className={`relative ${!expanded ? 'max-h-48 overflow-hidden' : ''}`}>
          <pre className="text-sm text-gray-400 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg">
            {report}
          </pre>
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-void-50 to-transparent" />
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm text-terminal hover:text-terminal-bright transition-colors"
        >
          {expanded ? '▲ Show less' : '▼ Show full report'}
        </button>
      </div>

      {/* Instructions */}
      <div className="px-4 pb-4">
        <div className="bg-black/20 border border-void-100 rounded-lg p-3">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-400">How to use:</strong> Click &quot;Copy for AI&quot;, then paste into your favorite AI assistant
            (Claude, ChatGPT, etc.) and ask it to fix the issues. The report includes exact CSS selectors,
            error messages, and prioritized fix instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
