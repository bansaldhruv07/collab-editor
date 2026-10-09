function KeyboardShortcutsModal({ onClose }) {
  const shortcuts = [
    {
      category: "Global",
      items: [
        { keys: ["Ctrl", "K"], description: "Open command palette" },
        { keys: ["Ctrl", "N"], description: "New document (on dashboard)" },
        { keys: ["?"], description: "Show keyboard shortcuts" },
      ],
    },
    {
      category: "Editor",
      items: [
        { keys: ["Ctrl", "S"], description: "Save document" },
        { keys: ["Ctrl", "B"], description: "Bold text" },
        { keys: ["Ctrl", "I"], description: "Italic text" },
        { keys: ["Ctrl", "Z"], description: "Undo" },
        { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
      ],
    },
  ];
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          borderRadius: "16px",
          padding: "32px",
          width: "100%",
          maxWidth: "480px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.3))",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Keyboard shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        {shortcuts.map((section) => (
          <div key={section.category} style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
              }}
            >
              {section.category}
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {section.items.map((shortcut, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    {shortcut.description}
                  </span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={i}
                        style={{
                          padding: "3px 8px",
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "5px",
                          fontSize: "12px",
                          color: "var(--text-primary)",
                          fontFamily: "inherit",
                          fontWeight: "500",
                        }}
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default KeyboardShortcutsModal;