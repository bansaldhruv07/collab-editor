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
      background: "#F0FDF4",
      color: "#166534",
      border: "1px solid #BBF7D0",
      icon: "✓",
    },
    error: {
      background: "#FEF2F2",
      color: "#991B1B",
      border: "1px solid #FECACA",
      icon: "✕",
    },
    info: {
      background: "#EFF6FF",
      color: "#1E40AF",
      border: "1px solid #BFDBFE",
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
              gap: "10px",
              padding: "12px 16px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              animation: "slideIn 0.2s ease-out",
              cursor: "pointer",
              ...typeStyles[toast.type],
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span style={{ fontWeight: "700", fontSize: "14px" }}>
              {typeStyles[toast.type].icon}
            </span>
            <span style={{ fontSize: "14px", flex: 1 }}>{toast.message}</span>
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
