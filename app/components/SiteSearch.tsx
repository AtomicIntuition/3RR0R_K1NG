'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getGradeColor } from '@/lib/scoring';

interface SearchResult {
  id: string;
  url: string;
  domain: string;
  score: number;
  grade: string;
  roastTitle: string;
  scannedAt: string;
}

interface SiteSearchProps {
  className?: string;
}

export function SiteSearch({ className = '' }: SiteSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Search as user types
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a site that's been roasted..."
          className="w-full pl-10 pr-4 py-2.5 bg-void-50 border border-void-200 rounded-lg text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-terminal/50 transition-colors"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <svg className="w-4 h-4 text-terminal animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.length >= 3 || results.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-void-50 border border-void-200 rounded-lg shadow-xl overflow-hidden">
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/scan/${result.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-3 hover:bg-void-100 transition-colors border-b border-void-200 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200 truncate">
                        {result.domain}
                      </span>
                      <span className={`text-xs font-bold ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </div>
                    {result.roastTitle && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {result.roastTitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-lg font-bold text-gray-400">{result.score}</span>
                    <span className="text-xs text-gray-600">{formatTimeAgo(result.scannedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : hasSearched && !isLoading ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No roasts found for &quot;{query}&quot;</p>
              <p className="text-xs text-gray-600 mt-1">Be the first to scan it!</p>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500">Type at least 3 characters to search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
