import * as React from "react"
import { Toast } from "./toast"
import type { ToastProps } from "./toast"

interface ToastContextType {
  showToast: (props: Omit<ToastProps, "onClose">) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

interface ToastItem extends ToastProps {
  id: string
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const showToast = React.useCallback((props: Omit<ToastProps, "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastItem = {
      ...props,
      id,
      onClose: () => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }
    }
    setToasts(prev => [...prev, newToast])
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-3">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ 
              transform: `translateY(${index * 70}px)`,
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
