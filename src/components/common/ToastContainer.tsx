import React from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X, CloudCheck, Database } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCRM();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      id="toast-container"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        const bgClass = isSuccess 
          ? 'bg-[#152a22] text-[#e8f7f0] border-[#295c47]' 
          : isWarning 
          ? 'bg-[#2e1d10] text-[#fdf4eb] border-[#6b4724]' 
          : isError 
          ? 'bg-[#2d1217] text-[#fceeed] border-[#802330]'
          : 'bg-[#24171a] text-[#fdf8f5] border-[#4a2e34]';

        const iconColor = isSuccess 
          ? 'text-emerald-400' 
          : isWarning 
          ? 'text-amber-400' 
          : isError 
          ? 'text-rose-400' 
          : 'text-[#d4af37]';

        return (
          <div
            key={toast.id}
            id={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-top-3 fade-in ${bgClass}`}
            role="alert"
          >
            {/* Status Icon */}
            <div className={`mt-0.5 shrink-0 ${iconColor}`}>
              {isSuccess && <CheckCircle2 className="w-5 h-5" />}
              {isWarning && <AlertTriangle className="w-5 h-5" />}
              {isError && <AlertOctagon className="w-5 h-5" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif font-bold text-sm tracking-wide">
                  {toast.title}
                </span>

                {toast.source === 'supabase' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 border border-white/10">
                    <Database className="w-2.5 h-2.5" />
                    Supabase
                  </span>
                )}
                {toast.source === 'local' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-amber-200 border border-white/10">
                    Local Cache
                  </span>
                )}
              </div>

              <p className="text-xs opacity-90 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>

            {/* Close button */}
            <button
              id={`dismiss-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 text-white/50 hover:text-white rounded-md hover:bg-white/10 transition-colors"
              title="Dismiss notification"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
