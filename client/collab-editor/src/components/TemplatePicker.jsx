import { useState } from "react";
import templates from "../data/templates";
function TemplatePicker({ onSelect, onClose }) {
  const [selectedId, setSelectedId] = useState("blank");
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", ...new Set(templates.map((t) => t.category))];
  const filtered =
    activeCategory === "All"
      ? templates
      : templates.filter((t) => t.category === activeCategory);
  const selectedTemplate = templates.find((t) => t.id === selectedId);
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
        }}
      >
        {}
        <div
          style={{
            padding: "24px 28px 0",
            borderBottom: "1px solid var(--border-color)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "750",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                Choose a template
              </h2>
              <p
                style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}
              >
                Start with a structured outline or begin from scratch
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close templates"
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: "2px 6px",
              }}
            >
              ✕
            </button>
          </div>
          {}
          <div style={{ display: "flex", gap: "4px", paddingBottom: "1px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 16px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    activeCategory === cat
                      ? "2px solid var(--accent-primary)"
                      : "2px solid transparent",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: activeCategory === cat ? "650" : "450",
                  color: activeCategory === cat ? "var(--accent-primary)" : "var(--text-muted)",
                  borderRadius: "0",
                  transition: "color 0.15s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {}
        <div
          style={{
            padding: "20px 28px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '10px',
          }}>
            {filtered.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedId(template.id)}
                style={{
                  background:
                    selectedId === template.id ? "var(--accent-subtle)" : "var(--bg-secondary)",
                  border:
                    selectedId === template.id
                      ? "2px solid var(--accent-primary)"
                      : "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (selectedId !== template.id) {
                    e.currentTarget.style.background = "var(--bg-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedId !== template.id) {
                    e.currentTarget.style.background = "var(--bg-secondary)";
                  }
                }}
              >
                {}
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                  {template.icon}
                </div>
                {}
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {template.name}
                </p>
                {}
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    lineHeight: "1.4",
                  }}
                >
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>
        {}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            background: "var(--bg-secondary)",
          }}
        >
          <div>
            <p
              style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}
            >
              {selectedTemplate?.icon} {selectedTemplate?.name}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              {selectedTemplate?.description}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "9px 18px",
                background: "none",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(selectedTemplate)}
              style={{
                padding: "9px 20px",
                background: "var(--accent-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "550",
                cursor: "pointer",
              }}
            >
              Use template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default TemplatePicker;