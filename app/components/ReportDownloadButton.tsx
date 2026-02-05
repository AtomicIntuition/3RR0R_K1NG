'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { AuditReport } from './AuditReport';
import { openPrintableReport } from './PrintableReport';
import type { Scan } from '@/types/scan';

interface ReportDownloadButtonProps {
  scan: Scan;
  className?: string;
}

export function ReportDownloadButton({ scan, className }: ReportDownloadButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  const handlePDF = useCallback(() => {
    setShowDropdown(false);
    openPrintableReport(scan);
  }, [scan]);

  const handlePNG = useCallback(async () => {
    setShowDropdown(false);
    setIsCapturing(true);

    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(<AuditReport scan={scan} />);

      await new Promise(resolve => setTimeout(resolve, 500));

      const element = container.querySelector('#audit-report-full');
      if (!element) throw new Error('Report element not found');

      const canvas = await html2canvas(element as HTMLElement, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
        logging: false,
        width: 800,
        height: element.scrollHeight,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const domain = scan.url
          .replace(/^https?:\/\//, '')
          .replace(/[^a-z0-9]/gi, '-')
          .slice(0, 30);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crisp-audit-${domain}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');

      root.unmount();
      document.body.removeChild(container);
    } catch {
      // Report generation failed silently
    } finally {
      setIsCapturing(false);
    }
  }, [scan]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Primary button - PDF */}
      <div className="flex items-center">
        <button
          onClick={handlePDF}
          disabled={isCapturing}
          className={`screenshot-ignore flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-l-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50 ${className || ''}`}
          title="Download PDF report"
        >
          {isCapturing ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span className="text-xs font-medium whitespace-nowrap">
            {isCapturing ? 'Generating...' : 'PDF'}
          </span>
        </button>

        {/* Dropdown toggle */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="screenshot-ignore flex items-center px-1.5 py-2 bg-emerald-500/10 border border-l-0 border-emerald-500/30 text-emerald-500 rounded-r-xl hover:bg-emerald-500/20 transition-all"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden min-w-[140px]">
          <button
            onClick={handlePDF}
            className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Save as PDF
          </button>
          <button
            onClick={handlePNG}
            disabled={isCapturing}
            className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Save as PNG
          </button>
        </div>
      )}
    </div>
  );
}
