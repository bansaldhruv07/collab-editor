function Alert({ message, type = "error" }) {
  if (!message) return null;
  const styles = {
    error: {
      background: "var(--danger-bg)",
      color: "var(--danger-text)",
      border: "1px solid var(--danger-border)",
    },
    success: {
      background: "var(--success-bg)",
      color: "var(--success-text)",
      border: "1px solid var(--success-border)",
    },
  };
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        marginBottom: "16px",
        fontWeight: "500",
        ...styles[type],
      }}
    >
      {message}
    </div>
  );
}
export default Alert;