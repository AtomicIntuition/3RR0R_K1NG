'use client';

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

interface ScreenshotButtonProps {
  targetId: string;
  filename?: string;
  className?: string;
}

export function ScreenshotButton({ targetId, filename = 'roast', className }: ScreenshotButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = useCallback(async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      console.error('Target element not found:', targetId);
      return;
    }

    setIsCapturing(true);

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0a0f',
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
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
    } catch (error) {
      console.error('Screenshot failed:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [targetId, filename]);

  return (
    <button
      onClick={captureScreenshot}
      disabled={isCapturing}
      className={`flex items-center gap-2 px-4 py-2 bg-terminal/10 border border-terminal/30 text-terminal rounded hover:bg-terminal/20 transition-colors disabled:opacity-50 ${className || ''}`}
      title="Screenshot this roast"
    >
      {isCapturing ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
      <span>{isCapturing ? 'Capturing...' : 'Screenshot'}</span>
    </button>
  );
}
