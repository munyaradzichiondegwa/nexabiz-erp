import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

// Simple toast event system
const listeners: ((toast: Toast) => void)[] = []

export const toast = {
  success: (title: string, description?: string) => emit({ type: 'success', title, description }),
  error:   (title: string, description?: string) => emit({ type: 'error',   title, description }),
  warning: (title: string, description?: string) => emit({ type: 'warning', title, description }),
  info:    (title: string, description?: string) => emit({ type: 'info',    title, description }),
}

function emit(opts: Omit<Toast, 'id'>) {
  const t: Toast = { ...opts, id: crypto.randomUUID(), duration: opts.duration ?? 5000 }
  listeners.forEach((l) => l(t))
}

export function useToastSubscribe(cb: (t: Toast) => void) {
  useEffect(() => {
    listeners.push(cb)
    return () => { const i = listeners.indexOf(cb); if (i > -1) listeners.splice(i, 1) }
  }, [cb])
}

const icons = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

const colors = {
  success: 'border-green-200 bg-green-50 text-green-900',
  error:   'border-red-200 bg-red-50 text-red-900',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
  info:    'border-blue-200 bg-blue-50 text-blue-900',
}

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  useToastSubscribe(React.useCallback((t) => {
    setToasts((prev) => [t, ...prev].slice(0, 5))
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id))
    }, t.duration ?? 5000)
  }, []))

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div key={t.id} className={cn('flex items-start gap-3 rounded-lg border p-4 shadow-lg', colors[t.type])}>
            <Icon className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
              <X className="h-4 w-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
