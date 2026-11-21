import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastItem } from '../types';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-88 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-[#1a1d2e]/95 backdrop-blur-md border border-accent/28 rounded-2xl shadow-xl animate-slideIn"
        >
          {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
          {t.type === 'error' && <AlertCircle size={18} className="text-red-400 shrink-0" />}
          {t.type === 'info' && <Info size={18} className="text-accent shrink-0" />}
          <span className="text-sm font-medium text-[#e8e0d0] leading-snug">{t.msg}</span>
        </div>
      ))}
    </div>
  );
};
