import { useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

export type ToastTone = 'success' | 'error' | 'info'

interface ToastProps {
  message: string | null
  tone?: ToastTone
  duration?: number
  onDismiss?: () => void
}

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
} as const

export function Toast({
  message,
  tone = 'info',
  duration = 4000,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    if (!message || !onDismiss || tone === 'error' || duration <= 0) return
    const timeout = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timeout)
  }, [duration, message, onDismiss, tone])

  if (!message) return null

  const Icon = ICONS[tone]

  return (
    <div
      aria-atomic="true"
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={'toast toast--' + tone}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon aria-hidden="true" className="toast__icon" size={20} strokeWidth={2} />
      <p className="toast__message">{message}</p>
      {onDismiss ? (
        <button
          aria-label="Zamknij komunikat"
          className="button button--ghost toast__dismiss"
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" size={18} strokeWidth={2} />
        </button>
      ) : null}
    </div>
  )
}

export default Toast
