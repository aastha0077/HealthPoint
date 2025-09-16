import * as React from "react"
import { X } from "lucide-react"
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

    const variantStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    }

    const iconColors = {
      success: "text-green-500",
      error: "text-red-500",
      warning: "text-yellow-500",
      info: "text-blue-500",
    }

    if (!isVisible) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 rounded-xl border px-6 py-3 shadow-lg transition-all duration-300 ease-in-out min-w-96 max-w-2xl",
          "animate-in slide-in-from-top-2 fade-in-0",
          !isVisible && "animate-out slide-out-to-top-2 fade-out-0",
          variantStyles[variant],
          className
        )}
      >
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className={cn(
            "rounded-full p-1 hover:bg-black/5 transition-colors",
            iconColors[variant]
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)

Toast.displayName = "Toast"

export { Toast }
