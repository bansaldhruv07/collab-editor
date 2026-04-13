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
          background: "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {}
        <div
          style={{
            padding: "24px 28px 0",
            borderBottom: "1px solid #E5E7EB",
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
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                Choose a template
              </h2>
              <p
                style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}
              >
                Start with a structure or begin from scratch
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#9CA3AF",
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
                      ? "2px solid #4F46E5"
                      : "2px solid transparent",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: activeCategory === cat ? "600" : "400",
                  color: activeCategory === cat ? "#4F46E5" : "#6B7280",
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
                    selectedId === template.id ? "#EEF2FF" : "#F9FAFB",
                  border:
                    selectedId === template.id
                      ? "2px solid #4F46E5"
                      : "2px solid transparent",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (selectedId !== template.id) {
                    e.currentTarget.style.background = "#F3F4F6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedId !== template.id) {
                    e.currentTarget.style.background = "#F9FAFB";
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
                    color: "#111827",
                    marginBottom: "4px",
                  }}
                >
                  {template.name}
                </p>
                {}
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9CA3AF",
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
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            background: "#F9FAFB",
          }}
        >
          <div>
            <p
              style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}
            >
              {selectedTemplate?.icon} {selectedTemplate?.name}
            </p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
              {selectedTemplate?.description}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "9px 18px",
                background: "none",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
                color: "#374151",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(selectedTemplate)}
              style={{
                padding: "9px 20px",
                background: "#4F46E5",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
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