'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-cr0n-success" />,
  error: <XCircle className="h-4 w-4 text-cr0n-danger" />,
  warning: <AlertTriangle className="h-4 w-4 text-cr0n-warning" />,
  info: <Info className="h-4 w-4 text-cr0n-cyan" />,
}

const bgColors: Record<ToastType, string> = {
  success: 'border-cr0n-success/30',
  error: 'border-cr0n-danger/30',
  warning: 'border-cr0n-warning/30',
  info: 'border-cr0n-cyan/30',
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => removeToast(id), 4000)
    },
    [removeToast],
  )

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    warning: (msg) => addToast('warning', msg),
    info: (msg) => addToast('info', msg),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-xl border bg-surface/95 px-4 py-3 shadow-xl backdrop-blur-sm',
              'animate-[slide-up_0.2s_ease-out]',
              bgColors[t.type],
            )}
          >
            {icons[t.type]}
            <p className="text-sm text-gray-200">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 shrink-0 rounded p-0.5 text-subtle hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export { ToastProvider, useToast }
