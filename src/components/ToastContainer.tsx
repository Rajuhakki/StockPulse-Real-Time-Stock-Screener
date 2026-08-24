'use client';

import React from 'react';
import { useAlertStore } from '../store/useAlertStore';
import { Bell, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAlertStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-4 bg-slate-900/95 backdrop-blur-lg border border-emerald-500/50 rounded-xl shadow-2xl flex items-start justify-between gap-3 text-slate-100 animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-emerald-500/30"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-200 mt-0.5 font-medium">{toast.message}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
