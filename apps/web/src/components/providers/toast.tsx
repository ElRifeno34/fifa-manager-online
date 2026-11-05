import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastAction } from "./hooks";

interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((message: string, action?: ToastAction) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, action });
    // Toasts with an action stay longer so there is time to use it.
    timer.current = setTimeout(() => setToast(null), action ? 5000 : 2200);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-16 z-[60] flex justify-center px-4 short:bottom-4"
      >
        {toast && (
          <div
            key={toast.id}
            className="layer pointer-events-auto flex items-center gap-4 rounded-full border-l-4 border-club-rule bg-overlay py-2 pl-4 pr-2 text-[0.9375rem] font-medium text-inverse animate-in fade-in slide-in-from-bottom-2 duration-150 short:py-1.5 short:text-sm"
          >
            <span className="py-0.5">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onAction();
                  dismiss();
                }}
                className="caps h-8 rounded-md border border-inverse/40 px-3 text-inverse transition-colors duration-150 hover:bg-inverse/15"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
