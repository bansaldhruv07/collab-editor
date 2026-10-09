import { useState, useEffect } from "react";
import documentService from "../services/documentService";
import Button from "./Button";
import Spinner from "./Spinner";
function ShareModal({ documentId, onClose, isOwner }) {
  const [collaborators, setCollaborators] = useState([]);
  const [owner, setOwner] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    fetchCollaborators();
  }, []);
  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const data = await documentService.getCollaborators(documentId);
      setOwner(data.owner);
      setCollaborators(data.collaborators);
    } catch (err) {
      setError("Failed to load collaborators");
    } finally {
      setLoading(false);
    }
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setAdding(true);
      setError("");
      setSuccess("");
      const data = await documentService.addCollaborator(
        documentId,
        email.trim(),
      );
      setCollaborators(data.collaborators);
      setEmail("");
      setSuccess(`Successfully added collaborator!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add collaborator");
    } finally {
      setAdding(false);
    }
  };
  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from this document?`)) return;
    try {
      setError("");
      await documentService.removeCollaborator(documentId, userId);
      setCollaborators((prev) => prev.filter((c) => c._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove collaborator");
    }
  };
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const avatarColors = [
    "#4F46E5",
    "#0891B2",
    "#059669",
    "#D97706",
    "#DC2626",
    "#7C3AED",
  ];
  const getAvatarColor = (name) => {
    const index = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
  };
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
      }}
    >
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: window.innerWidth < 640 ? '16px 16px 0 0' : '16px',
        padding: '32px',
        width: '100%',
        maxWidth: window.innerWidth < 640 ? '100%' : '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: window.innerWidth < 640 ? 'fixed' : 'relative',
        bottom: window.innerWidth < 640 ? 0 : 'auto',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              Share document
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Invite team members to collaborate in real time
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close share dialog"
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>
        {isOwner && (
          <form onSubmit={handleAdd} style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--text-secondary)",
                marginBottom: "8px",
              }}
            >
              Invite by email
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="colleague@example.com"
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
              />
              <Button type="submit" loading={adding} disabled={!email.trim()}>
                Invite
              </Button>
            </div>
            {error && (
              <p
                style={{ color: "#DC2626", fontSize: "13px", marginTop: "8px" }}
              >
                ⚠️ {error}
              </p>
            )}
            {success && (
              <p
                style={{ color: "#16A34A", fontSize: "13px", marginTop: "8px" }}
              >
                ✓ {success}
              </p>
            )}
          </form>
        )}
        <div style={{ borderTop: "1px solid #E5E7EB", marginBottom: "20px" }} />
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "16px",
          }}
        >
          People with access
        </h3>
        {loading ? (
          <Spinner size={28} />
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {owner && (
              <PersonRow
                name={owner.name}
                email={owner.email}
                role="Owner"
                initials={getInitials(owner.name)}
                color={getAvatarColor(owner.name)}
                showRemove={false}
              />
            )}
            {collaborators.length === 0 && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#9CA3AF",
                  textAlign: "center",
                  padding: "16px 0",
                }}
              >
                No collaborators yet. Invite someone above.
              </p>
            )}
            {collaborators.map((collab) => (
              <PersonRow
                key={collab._id}
                name={collab.name}
                email={collab.email}
                role="Editor"
                initials={getInitials(collab.name)}
                color={getAvatarColor(collab.name)}
                showRemove={isOwner}
                onRemove={() => handleRemove(collab._id, collab.name)}
              />
            ))}
          </div>
        )}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "var(--bg-secondary)",
            borderRadius: "10px",
            border: "1px solid var(--border-color)",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}
          >
            Share link
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              readOnly
              value={window.location.href}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                fontSize: "12px",
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                outline: "none",
              }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              style={{
                padding: "8px 14px",
                background: "var(--accent-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Copy link
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
            Only users granted access above can open and view this link
          </p>
        </div>
      </div>
    </div>
  );
}
function PersonRow({
  name,
  email,
  role,
  initials,
  color,
  showRemove,
  onRemove,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 0",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: "600",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--text-primary)",
            marginBottom: "1px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {email}
        </p>
      </div>
      <span
        style={{
          fontSize: "12px",
          padding: "3px 10px",
          borderRadius: "20px",
          background: role === "Owner" ? "var(--accent-subtle)" : "var(--success-bg)",
          color: role === "Owner" ? "var(--accent-primary)" : "var(--success-text)",
          fontWeight: "600",
          whiteSpace: "nowrap",
        }}
      >
        {role}
      </span>
      {showRemove && (
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            color: "#9CA3AF",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px",
            borderRadius: "4px",
            lineHeight: 1,
          }}
          title="Remove access"
          onMouseEnter={(e) => {
            e.target.style.color = "#EF4444";
            e.target.style.background = "#FEF2F2";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#9CA3AF";
            e.target.style.background = "none";
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
export default ShareModal;