'use client';

import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { AuditReport } from './AuditReport';
import type { Scan } from '@/types/scan';

interface ReportDownloadButtonProps {
  scan: Scan;
  className?: string;
}

export function ReportDownloadButton({ scan, className }: ReportDownloadButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureReport = useCallback(async () => {
    setIsCapturing(true);

    try {
      // Create off-screen container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Render AuditReport into the container
      const root = createRoot(container);
      root.render(<AuditReport scan={scan} />);

      // Wait for render to settle (longer report needs more time)
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = container.querySelector('#audit-report-full');
      if (!element) {
        throw new Error('Report element not found');
      }

      const canvas = await html2canvas(element as HTMLElement, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
        logging: false,
        width: 800,
        height: element.scrollHeight,
      });

      // Convert to blob and download
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

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    } catch {
      // Report generation failed silently
    } finally {
      setIsCapturing(false);
    }
  }, [scan]);

  return (
    <button
      onClick={captureReport}
      disabled={isCapturing}
      className={`screenshot-ignore flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50 ${className || ''}`}
      title="Download full professional audit report"
    >
      {isCapturing ? (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
        {isCapturing ? 'Generating...' : 'Full Report'}
      </span>
    </button>
  );
}
