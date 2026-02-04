'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { useAuth } from '@/lib/auth-context';

const STORAGE_KEY = 'exit_intent_scan_shown';
const EXAMPLE_URLS = ['stripe.com', 'notion.com', 'linear.app', 'vercel.com'];

interface ExitIntentScanProps {
  onScanUrl?: (url: string) => void;
}

export function ExitIntentScan({ onScanUrl }: ExitIntentScanProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(EXAMPLE_URLS[0]);

  // Check if already shown this session
  const wasShown = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  }, []);

  const markAsShown = useCallback(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  // Handle mouse leave detection
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse leaves toward the top (closing tab intent)
    // Don't show to logged in users (they already have access)
    // Don't show if already shown this session
    if (e.clientY <= 0 && !user && !wasShown()) {
      setIsOpen(true);
      markAsShown();
      document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [user, wasShown, markAsShown]);

  useEffect(() => {
    // Don't add listener if user is logged in or already shown
    if (user || wasShown()) return;

    // Wait 5 seconds before enabling exit intent
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave, user, wasShown]);

  const handleTryScan = () => {
    setIsOpen(false);
    if (onScanUrl) {
      onScanUrl(selectedUrl);
    } else {
      // Fallback: scroll to top and focus the scanner input
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="URL"]') as HTMLInputElement;
        if (input) {
          input.value = selectedUrl;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }
      }, 500);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Don't render for logged in users
  if (user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton={true}
      closeOnOutsideClick={true}
      closeOnEscape={true}
      className="max-w-md"
    >
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4 font-bold text-danger">
            WAIT
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Try one scan free
          </h2>

          <p className="text-gray-500 text-sm">
            See how your favorite site scores. No signup required.
          </p>
        </div>

        {/* URL Selection */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-3 text-center">Pick a site to analyze:</p>
          <div className="grid grid-cols-2 gap-2">
            {EXAMPLE_URLS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelectedUrl(url)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedUrl === url
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {url}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleTryScan}
          className="w-full px-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors active:scale-[0.98]"
        >
          Scan {selectedUrl}
        </button>

        {/* Subtext */}
        <p className="text-center text-xs text-gray-500 mt-4">
          2 free scans per hour. Create a free account for more.
        </p>
      </div>
    </Modal>
  );
}
