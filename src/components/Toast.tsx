import React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  type?: 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 border border-slate-700/80 text-white shadow-2xl backdrop-blur-md text-sm font-medium">
        {type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        )}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-1 p-0.5 text-slate-400 hover:text-white rounded-full transition-colors"
          aria-label="Close toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
