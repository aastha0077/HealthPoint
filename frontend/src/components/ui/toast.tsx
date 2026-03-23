import * as React from "react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  message: string
  variant?: "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
  className?: string
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ message, variant = "info", duration = 5000, onClose, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 300) // Wait for animation to complete
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [duration, onClose])

    const handleClose = () => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }

    const icons = {
      success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      error: <AlertCircle className="h-5 w-5 text-rose-500" />,
      warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
      info: <Info className="h-5 w-5 text-blue-500" />,
    }

    const variantStyles = {
      success: "bg-white border-emerald-100 shadow-emerald-100/50",
      error: "bg-white border-rose-100 shadow-rose-100/50",
      warning: "bg-white border-amber-100 shadow-amber-100/50",
      info: "bg-white border-blue-100 shadow-blue-100/50",
    }

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 rounded-2xl border p-4 shadow-2xl transition-all duration-300 ease-in-out min-w-[320px] max-w-md bg-white/80 backdrop-blur-xl",
          "animate-in slide-in-from-top-4 fade-in-0 sm:slide-in-from-right-4",
          !isVisible && "animate-out fade-out-0 scale-95",
          variantStyles[variant],
          className
        )}
      >
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
          variant === "success" && "bg-emerald-50",
          variant === "error" && "bg-rose-50",
          variant === "warning" && "bg-amber-50",
          variant === "info" && "bg-blue-50",
        )}>
          {icons[variant]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)

Toast.displayName = "Toast"

export { Toast }
