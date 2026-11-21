import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidthClass = 'max-w-lg',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-[#1a1d2e] border border-accent/28 rounded-3xl p-5 sm:p-6 w-full ${maxWidthClass} max-h-[88dvh] overflow-y-auto relative shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#252840] border border-accent/20 text-[#e8e0d0] flex items-center justify-center hover:bg-accent hover:text-accent-contrast transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
};
