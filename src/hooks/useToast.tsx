import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center justify-between w-80 p-4 rounded-lg shadow-lg border backdrop-blur-md text-sm font-medium
                ${toast.type === 'success' ? 'bg-green-500/90 border-green-600 text-white dark:bg-green-900/90' : ''}
                ${toast.type === 'error' ? 'bg-red-500/90 border-red-600 text-white dark:bg-red-900/90' : ''}
                ${toast.type === 'warning' ? 'bg-yellow-500/90 border-yellow-600 text-white dark:bg-yellow-900/90' : ''}
                ${toast.type === 'info' ? 'bg-slate-800/90 border-slate-700 text-white dark:bg-slate-900/90' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
                {toast.type === 'error' && <AlertTriangle className="h-5 w-5" />}
                {toast.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                {toast.type === 'info' && <Info className="h-5 w-5" />}
                <p>{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
