import { memo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
const DocumentCard = memo(function DocumentCard({ document, onDelete, onRename, onDuplicate, currentUserId }) {
  const navigate = useNavigate();
  const isOwner = document.owner?._id === currentUserId || document.owner === currentUserId;
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(document.title);
  const menuRef = useRef(null);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (newTitle.trim() && newTitle !== document.title) {
      onRename(document._id, newTitle.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setNewTitle(document.title);
      setIsRenaming(false);
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    window.document.addEventListener("mousedown", handleClickOutside);
    return () => window.document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div
      role="article"
      tabIndex={0}
      aria-label={`Document: ${document.title}, last updated ${formatDate(document.updatedAt)}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isRenaming && !showMenu) {
            navigate(`/document/${document._id}`);
          }
        }
      }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "20px",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onClick={() => {
        if (!isRenaming && !showMenu) {
          navigate(`/document/${document._id}`);
        }
      }}
    >
      <div
        style={{
          width: "42px",
          height: "48px",
          background: "var(--accent-subtle)",
          border: "1px solid var(--accent-border)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent-primary)",
          marginBottom: "14px",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      </div>
      {}
      {!isOwner && (
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          padding: '2px 8px',
          background: 'var(--accent-subtle)',
          color: 'var(--accent-primary)',
          borderRadius: '20px',
          fontWeight: '600',
          marginBottom: '6px',
        }}>
          Shared with you
        </span>
      )}
      {isRenaming ? (
        <form
          onSubmit={handleRenameSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              width: "100%",
              padding: "4px 8px",
              border: "1.5px solid var(--accent-primary)",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              outline: "none",
              marginBottom: "8px",
            }}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="submit"
              style={{
                padding: "4px 10px",
                background: "var(--accent-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRenaming(false);
                setNewTitle(document.title);
              }}
              style={{
                padding: "4px 10px",
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--text-primary)",
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {document.title}
        </h3>
      )}
      {!isRenaming && (
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Updated {formatDate(document.updatedAt)}
        </p>
      )}
      {!isRenaming && (
        <div ref={menuRef} style={{ position: "absolute", top: "14px", right: "14px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            aria-label="Document options"
            aria-haspopup="true"
            aria-expanded={showMenu}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: "4px",
              color: "var(--text-muted)",
              lineHeight: 1,
            }}
          >
            ···
          </button>
          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                right: 0,
                top: "28px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
                zIndex: 10,
                minWidth: "140px",
                overflow: "hidden",
              }}
            >
              {/* Duplicate */}
              <button
                onClick={() => {
                  onDuplicate(document._id);
                  setShowMenu(false);
                }}
                style={{ ...menuItemStyle, display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Duplicate
              </button>
              {isOwner && (
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  style={{ ...menuItemStyle, display: "flex", alignItems: "center", gap: "8px" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Rename
                </button>
              )}
              {/* Delete */}
              {isOwner && (
                <button
                  onClick={() => {
                    onDelete(document._id);
                    setShowMenu(false);
                  }}
                  style={{ ...menuItemStyle, display: "flex", alignItems: "center", gap: "8px", color: "var(--danger-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-bg)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              )}
              {}
              {!isOwner && (
                <div style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  No actions available
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "9px 14px",
  background: "transparent",
  border: "none",
  textAlign: "left",
  fontSize: "13px",
  cursor: "pointer",
  color: "var(--text-primary)",
};
export default DocumentCard;