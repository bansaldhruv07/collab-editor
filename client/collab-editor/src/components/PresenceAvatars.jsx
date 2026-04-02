function PresenceAvatars({ users, currentUserId }) {
  if (!users || users.length === 0) return null;

  const otherUsers = users.filter((u) => u.userId !== currentUserId);

  const MAX_VISIBLE = 4;
  const visible = otherUsers.slice(0, MAX_VISIBLE);
  const overflow = otherUsers.length - MAX_VISIBLE;

  if (visible.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0px",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "#9CA3AF",
          marginRight: "8px",
          whiteSpace: "nowrap",
        }}
      >
        Also editing:
      </span>

      <div style={{ display: "flex", alignItems: "center" }}>
        {visible.map((user, index) => (
          <div
            key={user.socketId}
            title={user.name}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: user.color,
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "600",
              color: "#fff",
              marginLeft: index === 0 ? "0" : "-8px",
              zIndex: visible.length - index,
              position: "relative",
              cursor: "default",
              transition: "transform 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.zIndex = "99";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.zIndex = visible.length - index;
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}

        {overflow > 0 && (
          <div
            title={`${overflow} more people editing`}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#E5E7EB",
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "600",
              color: "#6B7280",
              marginLeft: "-8px",
              position: "relative",
              flexShrink: 0,
            }}
          >
            +{overflow}
          </div>
        )}
      </div>

      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#22C55E",
          marginLeft: "10px",
          animation: "pulse 2s infinite",
          flexShrink: 0,
        }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

export default PresenceAvatars;
