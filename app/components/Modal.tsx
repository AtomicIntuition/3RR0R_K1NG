'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={clsx(
          'relative w-full max-w-md bg-void-50 border border-void-200 rounded-lg shadow-2xl',
          'animate-in zoom-in-95 slide-in-from-bottom-4 duration-300',
          className
        )}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
