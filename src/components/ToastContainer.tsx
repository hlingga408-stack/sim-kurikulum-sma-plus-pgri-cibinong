import { useState, useEffect } from 'react';
import { ToastMessage } from '../types';
import { subscribeToToasts } from '../services/notificationService';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => [toast, ...prev.slice(0, 4)]);
      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 6000);
    });
    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border bg-white/95 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 text-slate-800"
          style={{
            borderColor:
              t.type === 'alert'
                ? '#f59e0b'
                : t.type === 'success'
                ? '#10b981'
                : t.type === 'warning'
                ? '#ef4444'
                : '#0284c7',
          }}
        >
          <div
            className={`p-2 rounded-lg shrink-0 ${
              t.type === 'alert'
                ? 'bg-amber-100 text-amber-700'
                : t.type === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : t.type === 'warning'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-sky-100 text-sky-700'
            }`}
          >
            {t.type === 'alert' && <Bell className="w-5 h-5 animate-bounce" />}
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {t.type === 'info' && <Info className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-slate-900 truncate">{t.title}</h4>
              <span className="text-[10px] text-slate-600 font-mono ml-2 shrink-0">{t.timestamp}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-3 leading-relaxed">{t.message}</p>
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-600 hover:text-slate-800 p-1 rounded-md transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
