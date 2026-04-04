import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import documentService from "../services/documentService";
import Editor from "../components/Editor";
import { EditorSkeleton } from "../components/Skeleton";
import Button from "../components/Button";
import ShareModal from "../components/ShareModal";
import { useSocket } from "../context/SocketContext";
import PresenceAvatars from "../components/PresenceAvatars";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { useToast } from "../components/Toast";

function EditorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const titleInputRef = useRef(null);
  const editorRef = useRef(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const { socket } = useSocket();
  const { addToast } = useToast();

  useEffect(() => {
    fetchDocument();
  }, [id]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocument(id);
      setDocument(data);
      setTitleValue(data.title);
      setIsOwner(data.owner._id === user._id || data.owner === user._id);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You do not have access to this document.");
      } else if (err.response?.status === 404) {
        setError("Document not found.");
      } else {
        setError("Failed to load document.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join-document", id);

    socket.on("presence-update", (users) => {
      setTimeout(() => setActiveUsers(users), 100);
    });

    return () => {
      socket.emit("leave-document", id);
      socket.off("presence-update");
    };
  }, [socket, id]);

  const handleSave = async (content, htmlContent) => {
    try {
      setSaveStatus("saving");
      await documentService.saveContent(id, content, htmlContent);
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("unsaved");
      addToast("Failed to save document", "error");
    }
  };

  useKeyboardShortcut("s", async () => {
    if (editorRef.current) {
      const { delta, html } = editorRef.current.getContent();
      await handleSave(delta, html);
      addToast("Document saved", "success");
    }
  });

  const handleChange = (delta, html) => {
    setSaveStatus("unsaved");
  };

  const handleTitleSave = async () => {
    if (!titleValue.trim()) {
      setTitleValue(document.title);
      setIsEditingTitle(false);
      return;
    }

    if (titleValue === document.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await documentService.updateTitle(id, titleValue.trim());
      setDocument((prev) => ({ ...prev, title: titleValue.trim() }));
    } catch (err) {
      setTitleValue(document.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") handleTitleSave();
    if (e.key === "Escape") {
      setTitleValue(document.title);
      setIsEditingTitle(false);
    }
  };

  const saveIndicator = {
    saved: { text: "✓ Saved", color: "#16A34A" },
    saving: { text: "⟳ Saving...", color: "#9CA3AF" },
    unsaved: { text: "● Unsaved", color: "#D97706" },
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        <div
          style={{
            height: "60px",
            background: "#fff",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#f0f0f0",
              borderRadius: "6px",
            }}
          />
          <div
            style={{
              width: "200px",
              height: "20px",
              background: "#f0f0f0",
              borderRadius: "6px",
            }}
          />
        </div>
        <EditorSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "48px" }}>⚠️</div>
        <h2 style={{ fontSize: "20px", color: "#374151" }}>{error}</h2>
        <Button onClick={() => navigate("/dashboard")} variant="secondary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          height: "60px",
          background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: "16px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#6B7280",
            padding: "4px 8px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
          }}
          title="Back to dashboard"
        >
          ←
        </button>

        <span style={{ fontWeight: "700", color: "#4F46E5", fontSize: "16px" }}>
          📝
        </span>

        <div style={{ flex: 1 }}>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              style={{
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
                borderBottom: "2px solid #4F46E5",
                outline: "none",
                padding: "2px 4px",
                background: "transparent",
                width: "300px",
                color: "#111827",
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename"
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#111827",
                cursor: "text",
                padding: "2px 4px",
                borderRadius: "4px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#F3F4F6")}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              {document?.title}
            </span>
          )}
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          style={{
            padding: "7px 16px",
            background: "#4F46E5",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          👥 Share
        </button>
        <PresenceAvatars users={activeUsers} currentUserId={user?._id} />

        <div
          title="Keyboard shortcuts: Ctrl+S to save"
          style={{
            fontSize: "12px",
            color: "#9CA3AF",
            cursor: "default",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <kbd
            style={{
              padding: "2px 6px",
              background: "#F3F4F6",
              border: "1px solid #D1D5DB",
              borderRadius: "4px",
              fontSize: "11px",
              color: "#374151",
              fontFamily: "monospace",
            }}
          >
            Ctrl+S
          </kbd>
          <span style={{ fontSize: "11px" }}>to save</span>
        </div>
        <span
          style={{
            fontSize: "13px",
            color: saveIndicator[saveStatus].color,
            fontWeight: "500",
            minWidth: "80px",
            textAlign: "right",
          }}
        >
          {saveIndicator[saveStatus].text}
        </span>

        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: "600",
            color: "#4F46E5",
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </nav>

      <div
        style={{
          flex: 1,
          maxWidth: "860px",
          width: "100%",
          margin: "0 auto",
          padding: "0",
          background: "#fff",
        }}
      >
        <Editor
          ref={editorRef}
          documentId={id}
          initialContent={document?.content}
          onSave={handleSave}
          onChange={handleChange}
        />
      </div>

      {showShareModal && (
        <ShareModal
          documentId={id}
          isOwner={isOwner}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

export default EditorPage;
