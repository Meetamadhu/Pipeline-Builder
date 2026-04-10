import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastVariant = 'success' | 'error';

interface ToastState {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastIdCounter = 0;

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = toastIdCounter++;
    setToasts((current) => [...current, { id, message, variant }]);

    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl px-8 py-4 text-base shadow-[0_0_40px_rgba(129,140,248,0.7)] border max-w-xl mx-4 bg-gradient-to-br from-[#281163]/95 to-[#4b21a8]/95 ${
              toast.variant === 'success'
                ? 'border-emerald-300 text-emerald-50'
                : 'border-rose-300 text-rose-50'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

