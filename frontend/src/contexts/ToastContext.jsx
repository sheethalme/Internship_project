import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, dismiss }) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    order: '🍳',
    coin: '🪙',
  };

  const colors = {
    success: 'border-green-500/40 bg-green-500/10',
    error: 'border-red-500/40 bg-red-500/10',
    warning: 'border-yellow-500/40 bg-yellow-500/10',
    info: 'border-blue-500/40 bg-blue-500/10',
    order: 'border-gold-500/40 bg-gold-500/10',
    coin: 'border-gold-500/40 bg-gold-500/10',
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-glass text-sm font-medium text-white cursor-pointer max-w-xs ${colors[t.type] || colors.info}`}
        >
          <span className="text-base">{icons[t.type] || icons.info}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
