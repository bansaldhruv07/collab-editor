import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
const ToastContext = createContext();
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const typeStyles = {
    success: {
      background: "var(--bg-surface)",
      color: "var(--success-text)",
      border: "1px solid var(--success-border)",
      icon: "✓",
    },
    error: {
      background: "var(--bg-surface)",
      color: "var(--danger-text)",
      border: "1px solid var(--danger-border)",
      icon: "✕",
    },
    info: {
      background: "var(--bg-surface)",
      color: "var(--accent-text)",
      border: "1px solid var(--accent-border)",
      icon: "ℹ",
    },
  };
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 1000,
          maxWidth: "360px",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "10px",
              boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.2))",
              animation: "slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              cursor: "pointer",
              ...typeStyles[toast.type],
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span style={{ fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>
              {typeStyles[toast.type].icon}
            </span>
            <span style={{ fontSize: "14px", flex: 1, color: "var(--text-primary)", fontWeight: "500" }}>
              {toast.message}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
export function useToast() {
  return useContext(ToastContext);
}