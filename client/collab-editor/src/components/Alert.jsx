function Alert({ message, type = "error" }) {
  if (!message) return null;
  const styles = {
    error: {
      background: "#FEF2F2",
      color: "#DC2626",
      border: "1px solid #FECACA",
    },
    success: {
      background: "#F0FDF4",
      color: "#16A34A",
      border: "1px solid #BBF7D0",
    },
  };
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        marginBottom: "16px",
        ...styles[type],
      }}
    >
      {message}
    </div>
  );
}
export default Alert;