import { useState, useEffect } from "react";
import documentService from "../services/documentService";
import { useToast } from "./Toast";
import Spinner from "./Spinner";
function VersionHistoryPanel({ documentId, isOwner, onRestore, onClose, showVersionHistory }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewVersion, setPreviewVersion] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { addToast } = useToast();
  const isMobile = window.innerWidth < 640;

  useEffect(() => {
    if (showVersionHistory) {
      fetchVersions();
    }
  }, [showVersionHistory]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const data = await documentService.getVersions(documentId);
      setVersions(data.versions);
    } catch (err) {
      addToast("Failed to load version history", "error");
    } finally {
      setLoading(false);
    }
  };
  const handlePreview = async (version) => {
    if (previewVersion?._id === version._id) {
      setPreviewVersion(null);
      return;
    }
    try {
      setPreviewLoading(true);
      const data = await documentService.getVersion(documentId, version._id);
      setPreviewVersion(data);
    } catch (err) {
      addToast("Failed to load version", "error");
    } finally {
      setPreviewLoading(false);
    }
  };
  const handleRestore = async (versionId) => {
    if (
      !window.confirm(
        "Restore this version? Your current content will be saved as a new version first.",
      )
    )
      return;
    try {
      setRestoring(true);
      const data = await documentService.restoreVersion(documentId, versionId);
      addToast("Version restored successfully", "success");
      onRestore(data.content);
      onClose();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to restore version",
        "error",
      );
    } finally {
      setRestoring(false);
    }
  };
  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div style={{
      position: 'fixed',
      right: isMobile ? 0 : 0,
      bottom: isMobile ? 0 : 0,
      top: isMobile ? 'auto' : 'var(--nav-height, 56px)',
      left: isMobile ? 0 : 'auto',
      width: isMobile ? '100%' : '320px',
      height: isMobile ? '65vh' : 'auto',
      background: 'var(--bg-surface)',
      borderLeft: isMobile ? 'none' : '1px solid var(--border-color)',
      borderTop: isMobile ? '1px solid var(--border-color)' : 'none',
      borderRadius: isMobile ? '16px 16px 0 0' : '0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      boxShadow: 'var(--shadow-xl)',
    }}>
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: "650", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Version history
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {versions.length} saved version{versions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close version history"
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
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {loading && <Spinner size={28} />}
        {!loading && versions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
            <p style={{ fontSize: "14px" }}>No versions yet</p>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>
              Versions are created each time you save
            </p>
          </div>
        )}
        {versions.map((version, index) => (
          <div
            key={version._id}
            style={{
              border:
                previewVersion?._id === version._id
                  ? "1.5px solid var(--accent-primary)"
                  : "1px solid var(--border-color)",
              borderRadius: "10px",
              marginBottom: "8px",
              overflow: "hidden",
              transition: "border-color 0.15s",
            }}
          >
            <div
              onClick={() => handlePreview(version)}
              style={{
                padding: "12px 14px",
                cursor: "pointer",
                background:
                  previewVersion?._id === version._id ? "var(--accent-subtle)" : "var(--bg-surface)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (previewVersion?._id !== version._id) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (previewVersion?._id !== version._id) {
                  e.currentTarget.style.background = "var(--bg-surface)";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      marginBottom: "3px",
                    }}
                  >
                    {version.label || `Version ${versions.length - index}`}
                    {index === 0 && (
                      <span
                        style={{
                          marginLeft: "6px",
                          fontSize: "10px",
                          padding: "1px 6px",
                          background: "var(--accent-subtle)",
                          color: "var(--accent-primary)",
                          borderRadius: "10px",
                          fontWeight: "600",
                        }}
                      >
                        Latest
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {version.savedBy?.name || "Unknown"} ·{" "}
                    {timeAgo(version.savedAt)}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-faint)",
                    transform:
                      previewVersion?._id === version._id
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  ▼
                </span>
              </div>
            </div>
            {previewVersion?._id === version._id && (
              <div
                style={{
                  borderTop: "1px solid var(--border-color)",
                  padding: "12px 14px",
                  background: "var(--bg-secondary)",
                }}
              >
                {previewLoading ? (
                  <Spinner size={20} />
                ) : (
                  <>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Preview
                    </p>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-primary)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        padding: "8px",
                        maxHeight: "100px",
                        overflow: "hidden",
                        lineHeight: "1.5",
                        marginBottom: "10px",
                        position: "relative",
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          previewVersion.htmlContent ||
                          '<em style="color:var(--text-faint)">No preview available</em>',
                      }}
                    />
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        marginBottom: "10px",
                      }}
                    >
                      Saved {formatFullDate(version.savedAt)}
                    </p>
                    {isOwner && (
                      <button
                        onClick={() => handleRestore(version._id)}
                        disabled={restoring}
                        style={{
                          width: "100%",
                          padding: "8px",
                          background: "var(--accent-primary)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: restoring ? "not-allowed" : "pointer",
                          opacity: restoring ? 0.7 : 1,
                        }}
                      >
                        {restoring ? "Restoring..." : "Restore this version"}
                      </button>
                    )}
                    {!isOwner && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          textAlign: "center",
                        }}
                      >
                        Only the owner can restore versions
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default VersionHistoryPanel;