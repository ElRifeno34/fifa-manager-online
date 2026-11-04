'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastContextValue {
  show: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((message: string) => {
    if (timer.current) clearTimeout(timer.current)
    setToast({ id: Date.now(), message })
    timer.current = setTimeout(() => setToast(null), 1800)
  }, [])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const value = useMemo(() => ({ show }), [show])

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
            className="animate-in fade-in slide-in-from-bottom-2 rounded-full bg-overlay px-5 py-2.5 text-[0.9375rem] font-medium text-inverse shadow-lift duration-200 short:px-4 short:py-1.5 short:text-sm"
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
