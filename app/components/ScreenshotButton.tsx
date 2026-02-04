'use client';

import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { ShareableReport } from './ShareableReport';

interface RoastFix {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'security' | 'seo' | 'accessibility' | 'code_quality';
  title: string;
  description: string;
  effort: 'quick' | 'medium' | 'significant';
}

interface ScanData {
  url: string;
  scoreOverall: number;
  letterGrade?: string;
  scoringBreakdown?: {
    breakdown: Array<{
      category: string;
      score: number;
      weight: number;
    }>;
  };
  roastTitle?: string;
  roastBody?: string;
  id?: string;
  fixes?: RoastFix[];
}

interface ScreenshotButtonProps {
  scanData: ScanData;
  filename?: string;
  className?: string;
}

export function ScreenshotButton({
  scanData,
  filename = 'report',
  className,
}: ScreenshotButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = useCallback(async () => {
    setIsCapturing(true);

    try {
      // Create a container for the fixed-width report
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Render the ShareableReport component into the container
      const root = createRoot(container);
      root.render(
        <ShareableReport
          url={scanData.url}
          scoreOverall={scanData.scoreOverall}
          letterGrade={scanData.letterGrade}
          scoringBreakdown={scanData.scoringBreakdown}
          roastTitle={scanData.roastTitle}
          roastBody={scanData.roastBody}
          roastId={scanData.id}
          fixes={scanData.fixes}
        />
      );

      // Wait for render to complete (longer wait for text wrapping)
      await new Promise(resolve => setTimeout(resolve, 300));

      const element = container.querySelector('#shareable-report-fixed');
      if (!element) {
        throw new Error('Report element not found');
      }

      const canvas = await html2canvas(element as HTMLElement, {
        backgroundColor: '#09090B',
        scale: 2, // 2x for high quality (1200px output)
        useCORS: true,
        logging: false,
        width: 600,
        height: element.scrollHeight,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    } catch {
      // Screenshot generation failed
    } finally {
      setIsCapturing(false);
    }
  }, [scanData, filename]);

  return (
    <button
      onClick={captureScreenshot}
      disabled={isCapturing}
      className={`screenshot-ignore flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary/10 border border-primary/30 text-primary rounded-xl hover:bg-primary/20 transition-all disabled:opacity-50 ${className || ''}`}
      title="Download shareable screenshot"
    >
      {isCapturing ? (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
        {isCapturing ? 'Generating...' : 'Download'}
      </span>
    </button>
  );
}
