import { useEffect, useState } from "react";
function TypingIndicator({ typingUsers }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(typingUsers.length > 0);
  }, [typingUsers]);
  if (!visible || typingUsers.length === 0) return null;
  const getMessage = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing`;
    }
    return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`;
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 16px",
        background: "#F9FAFB",
        borderTop: "1px solid #E5E7EB",
        fontSize: "13px",
        color: "#6B7280",
        minHeight: "32px",
      }}
    >
      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: typingUsers[0]?.color || "#4F46E5",
              animation: `typingBounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span>{getMessage()}</span>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
export default TypingIndicator;