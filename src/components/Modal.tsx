"use client";

import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the modal
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        modalRef.current && 
        !modalRef.current.contains(e.target as Node) && 
        e.target === overlayRef.current
      ) {
        onClose();
      }
    };

    // Close on ESC key
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscKey);
      // Prevent scrolling of the body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black bg-opacity-50 backdrop-blur-sm"
      ref={overlayRef}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-3xl p-0 mx-4 bg-white rounded-lg shadow-xl animate-fadeIn animate-slideUp overflow-hidden"
        style={{
          animationDuration: '0.2s',
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto'
        }}
      >
        <div className="sticky top-0 flex items-center justify-end p-2 bg-white z-10">
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        
        <div className="p-5 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
} 