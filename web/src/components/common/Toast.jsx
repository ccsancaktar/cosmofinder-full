import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";

let toastId = 0;

export class Toast {
  static success(message, duration = 3000) {
    Toast.show(message, "success", duration);
  }

  static error(message, duration = 3000) {
    Toast.show(message, "error", duration);
  }

  static warning(message, duration = 3000) {
    Toast.show(message, "warning", duration);
  }

  static info(message, duration = 3000) {
    Toast.show(message, "info", duration);
  }

  static show(message, type = "info", duration = 3000) {
    const event = new CustomEvent("toast", {
      detail: { id: toastId++, message, type, duration },
    });
    window.dispatchEvent(event);
  }
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: "bg-success text-white",
    error: "bg-error text-white",
    warning: "bg-warning text-dark-bg",
    info: "bg-blue-500 text-white",
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg shadow-card ${colors[toast.type]} animate-slide-up`}
    >
      {icons[toast.type]}
      <span>{toast.message}</span>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      setToasts((prev) => [...prev, event.detail]);
    };

    window.addEventListener("toast", handleToast);
    return () => window.removeEventListener("toast", handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}
