
import { memo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const DocumentCard = memo(function DocumentCard({ document, onDelete, onRename, currentUserId }) {
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
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        padding: "20px",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
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
          width: "44px",
          height: "56px",
          background: "#EEF2FF",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          marginBottom: "14px",
        }}
      >
        📄
      </div>

      {}
      {!isOwner && (
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          padding: '2px 8px',
          background: '#EEF2FF',
          color: '#4F46E5',
          borderRadius: '20px',
          fontWeight: '500',
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
              border: "1.5px solid #4F46E5",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              outline: "none",
              marginBottom: "8px",
            }}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="submit"
              style={{
                padding: "4px 10px",
                background: "#4F46E5",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
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
                background: "#f0f0f0",
                color: "#333",
                border: "none",
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
            fontSize: "15px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "6px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {document.title}
        </h3>
      )}

      {!isRenaming && (
        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
          Updated {formatDate(document.updatedAt)}
        </p>
      )}

      {!isRenaming && (
        <div ref={menuRef} style={{ position: "absolute", top: "16px", right: "16px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation(); 
              setShowMenu((prev) => !prev);
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
              color: "#9CA3AF",
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
                top: "32px",
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                zIndex: 10,
                minWidth: "140px",
                overflow: "hidden",
              }}
            >
              {}
              {isOwner && (
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.target.style.background = "#F9FAFB")}
                  onMouseLeave={(e) =>
                    (e.target.style.background = "transparent")
                  }
                >
                  ✏️ Rename
                </button>
              )}
              {}
              {isOwner && (
                <button
                  onClick={() => {
                    onDelete(document._id);
                    setShowMenu(false);
                  }}
                  style={{ ...menuItemStyle, color: "#EF4444" }}
                  onMouseEnter={(e) => (e.target.style.background = "#FEF2F2")}
                  onMouseLeave={(e) =>
                    (e.target.style.background = "transparent")
                  }
                >
                  🗑️ Delete
                </button>
              )}
              {}
              {!isOwner && (
                <div style={{ padding: '10px 16px', fontSize: '13px', color: '#9CA3AF' }}>
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
  padding: "10px 16px",
  background: "transparent",
  border: "none",
  textAlign: "left",
  fontSize: "14px",
  cursor: "pointer",
  color: "#374151",
};

export default DocumentCard;
