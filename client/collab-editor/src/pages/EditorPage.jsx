import { useState, useEffect, useRef, useCallback } from "react";
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
import VersionHistoryPanel from "../components/VersionHistoryPanel";
import DocumentStats from '../components/DocumentStats';
import useDebouncedCallback from '../hooks/useDebouncedCallback';
import ProgressBar from '../components/ProgressBar';
import TypingIndicator from '../components/TypingIndicator';
import CollaboratorAlert from '../components/CollaboratorAlert';
import ActivityFeedPanel from '../components/ActivityFeedPanel';
import saveQueue from '../services/saveQueue';
import SectionLockWarning from '../components/SectionLockWarning';
import ExportModal from '../components/ExportModal';
import { useTheme } from '../context/ThemeContext';
function EditorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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
  const { socket, isConnected } = useSocket();
  const { addToast } = useToast();
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [lastEditedBy, setLastEditedBy] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [sectionLocks, setSectionLocks] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const [collabAlerts, setCollabAlerts] = useState([]);
  const previousUsersRef = useRef([]);
  const typingTimerRef = useRef(null);
  useEffect(() => {
    fetchDocument();
  }, [id]);
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'unsaved' && editorRef.current) {
        const { delta, html } = editorRef.current.getContent();
        const token = localStorage.getItem('token');
        const payload = JSON.stringify({
          content: delta,
          htmlContent: html,
        });
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL}/documents/${id}/content?token=${token}`,
          new Blob([payload], { type: 'application/json' })
        );
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus, id]);
  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocument(id);
      setDocument(data);
      if (data.lastEditedBy) {
        setLastEditedBy(data.lastEditedBy);
      }
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
  }, [id, user._id]);
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join-document', id);
    socket.on('presence-update', (users) => {
      setTimeout(() => {
        const currentUserId = user?._id?.toString();
        const newUsers = users.filter(u =>
          u.userId !== currentUserId &&
          !previousUsersRef.current.some(p => p.userId === u.userId)
        );
        const leftUsers = previousUsersRef.current.filter(p =>
          p.userId !== currentUserId &&
          !users.some(u => u.userId === p.userId)
        );
        newUsers.forEach(u => {
          const alertId = `${u.userId}-${Date.now()}`;
          setCollabAlerts(prev => [
            ...prev,
            { id: alertId, type: 'join', name: u.name, color: u.color },
          ]);
        });
        leftUsers.forEach(u => {
          const alertId = `${u.userId}-${Date.now()}`;
          setCollabAlerts(prev => [
            ...prev,
            { id: alertId, type: 'leave', name: u.name, color: u.color },
          ]);
          setTypingUsers(prev => prev.filter(t => t.userId !== u.userId));
          if (editorRef.current) {
            editorRef.current.setCursor(u.userId, null, u.color, u.name);
            editorRef.current.setSelection(u.userId, null, u.color, u.name);
          }
        });
        previousUsersRef.current = users;
        setActiveUsers(users);
      }, 100);
    });
    socket.on('receive-changes', (delta) => {
      if (editorRef.current) {
        editorRef.current.applyDelta(delta);
      }
    });
    socket.on('cursor-update', ({ userId, name, color, range }) => {
      if (editorRef.current) {
        editorRef.current.setCursor(userId, range, color, name);
      }
    });
    socket.on('remote-selection', ({ userId, name, color, range }) => {
      if (editorRef.current) {
        editorRef.current.setSelection(userId, range, color, name);
      }
    });
    socket.on('user-typing', ({ userId, name, color }) => {
      setTypingUsers(prev => {
        if (prev.some(u => u.userId === userId)) return prev;
        return [...prev, { userId, name, color }];
      });
    });
    socket.on('user-stopped-typing', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });
    socket.on('document-saved', ({ savedAt, savedBy }) => {
      setSaveStatus('saved');
      setDocument(prev => prev ? { ...prev, updatedAt: savedAt } : prev);
    });
    socket.on('version-restored', ({ restoredBy }) => {
      fetchDocument();
      addToast(`Document restored by ${restoredBy}`, 'info');
    });
    socket.on('connect', () => {
      socket.emit('join-document', id);
      addToast('Reconnected', 'success');
    });
    socket.on('activity-update', () => {
    });
    socket.on('section-locked', ({ userId, name, color, lineIndex, lineText }) => {
      setSectionLocks(prev => {
        const filtered = prev.filter(l => l.userId !== userId);
        return [...filtered, { userId, name, color, lineIndex, lineText }];
      });
      setTimeout(() => {
        setSectionLocks(prev => prev.filter(l => l.userId !== userId));
      }, 5000);
    });
    socket.on('section-unlocked', ({ userId }) => {
      setSectionLocks(prev => prev.filter(l => l.userId !== userId));
    });
    return () => {
      socket.emit('leave-document', id);
      socket.off('presence-update');
      socket.off('receive-changes');
      socket.off('cursor-update');
      socket.off('remote-selection');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('document-saved');
      socket.off('version-restored');
      socket.off('connect');
      socket.off('activity-update');
      socket.off('section-locked');
      socket.off('section-unlocked');
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [socket, id, user, fetchDocument, addToast]);
  useEffect(() => {
    if (editorRef.current) {
      Object.entries(remoteCursors).forEach(([userId, data]) => {
        editorRef.current.setCursor(userId, data.range, data.color, data.name);
      });
    }
  }, [remoteCursors]);
  const handleCursorMove = useCallback((range) => {
    if (socket && id) {
      socket.emit('cursor-move', {
        documentId: id,
        range,
      });
    }
  }, [socket, id]);
  const handleSelectionChange = useCallback((range) => {
    if (socket && id) {
      socket.emit('selection-change', {
        documentId: id,
        range,
      });
    }
  }, [socket, id]);
  const handleAlertDismiss = useCallback((alertId) => {
    setCollabAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);
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
  const debouncedSave = useDebouncedCallback(
    async (deltaOrContents, html) => {
      if (!editorRef.current) return;
      const { delta: fullContent, html: fullHtml } = editorRef.current.getContent();
      if (socket && id) {
        socket.emit('save-document', {
          documentId: id,
          content: fullContent,
          htmlContent: fullHtml,
        });
      }
      try {
        setSaveStatus('saving');
        await documentService.saveContent(id, fullContent, fullHtml);
      } catch (err) {
        setSaveStatus('unsaved');
      }
    },
    2000
  );
  const handleChange = useCallback((delta, html) => {
    setSaveStatus('unsaved');
    if (editorRef.current) {
      const quill = editorRef.current.getQuill();
      if (quill) {
        const text = quill.getText().trim();
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        setWordCount(words);
      }
    }
    if (socket && id) {
      socket.emit('send-changes', { documentId: id, delta });
      socket.emit('typing-start', { documentId: id });
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      typingTimerRef.current = setTimeout(() => {
        socket.emit('typing-stop', { documentId: id });
      }, 2000);
    }
    debouncedSave(delta, html);
  }, [socket, id, debouncedSave]);
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
  const { resolvedTheme, toggleTheme } = useTheme();

  const saveIndicator = {
    saved: { text: "Saved", icon: "✓", color: "var(--success-text)", bg: "var(--success-bg)", border: "var(--success-border)" },
    saving: { text: "Saving...", icon: "⟳", color: "var(--text-muted)", bg: "var(--bg-secondary)", border: "var(--border-color)" },
    unsaved: { text: "Unsaved", icon: "●", color: "var(--warning-text)", bg: "var(--warning-bg)", border: "var(--warning-border)" },
  };
  const handleRestore = useCallback(async (newContent) => {
    await fetchDocument();
    if (socket && id) {
      socket.emit('restore-version', {
        documentId: id,
        content: newContent,
      });
    }
    addToast('Document restored to previous version', 'success');
  }, [socket, id, fetchDocument, addToast]);
  if (loading) {
    return (
      <>
        <ProgressBar loading={loading} />
        <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
          <div
            style={{
              height: "var(--nav-height, 56px)",
              background: "var(--bg-surface)",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                background: "var(--bg-hover)",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                width: "180px",
                height: "18px",
                background: "var(--bg-hover)",
                borderRadius: "4px",
              }}
            />
          </div>
          <EditorSkeleton />
        </div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <ProgressBar loading={loading} />
        <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          background: "var(--bg-secondary)",
        }}
      >
        <div style={{ fontSize: "40px" }}>⚠️</div>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)" }}>{error}</h2>
        <Button onClick={() => navigate("/dashboard")} variant="secondary">
          Back to Dashboard
        </Button>
        </div>
      </>
    );
  }
  return (
    <>
      <ProgressBar loading={loading} />
      <div
      style={{
        minHeight: "100vh",
        background: "var(--editor-canvas-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sleek, Non-AI Studio Header */}
      <nav
        style={{
          height: "var(--nav-height, 56px)",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          gap: "12px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        {/* Left: Breadcrumbs & Document Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
          <button
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
            title="Back to documents"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              padding: "6px 8px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>

          <span style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
            Documents <span style={{ margin: "0 6px" }}>/</span>
          </span>

          <div style={{ position: "relative", minWidth: "120px", maxWidth: "340px", flexShrink: 1 }}>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  borderBottom: "2px solid var(--accent-primary)",
                  outline: "none",
                  padding: "2px 4px",
                  background: "transparent",
                  width: "100%",
                  color: "var(--text-primary)",
                }}
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  cursor: "text",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  display: "inline-block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {document?.title}
              </span>
            )}
          </div>

          {/* Autosave status pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "600",
              color: saveIndicator[saveStatus].color,
              background: saveIndicator[saveStatus].bg,
              border: `1px solid ${saveIndicator[saveStatus].border}`,
              whiteSpace: "nowrap",
              marginLeft: "4px",
            }}
          >
            <span>{saveIndicator[saveStatus].icon}</span>
            <span>{saveIndicator[saveStatus].text}</span>
          </div>

          {/* Word count pill */}
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              marginLeft: "6px",
              display: window.innerWidth < 768 ? "none" : "inline",
            }}
          >
            {wordCount} words
          </span>
        </div>

        {/* Right Tools Cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <PresenceAvatars users={activeUsers} currentUserId={user?._id} />

          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              background: "none",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "6px 9px",
              cursor: "pointer",
              fontSize: "14px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {resolvedTheme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {/* Action cluster buttons */}
          <button
            onClick={() => {
              setShowVersionHistory(prev => !prev);
              setShowStats(false);
              setShowActivity(false);
            }}
            style={{
              padding: "6px 12px",
              background: showVersionHistory ? "var(--accent-subtle)" : "transparent",
              color: showVersionHistory ? "var(--accent-primary)" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: showVersionHistory ? "var(--accent-border)" : "var(--border-color)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "550",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease",
            }}
          >
            <span>History</span>
          </button>

          <button
            onClick={() => {
              setShowStats(prev => !prev);
              setShowVersionHistory(false);
              setShowActivity(false);
            }}
            style={{
              padding: "6px 12px",
              background: showStats ? "var(--accent-subtle)" : "transparent",
              color: showStats ? "var(--accent-primary)" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: showStats ? "var(--accent-border)" : "var(--border-color)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "550",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease",
            }}
          >
            <span>Stats</span>
          </button>

          <button
            onClick={() => {
              setShowActivity(prev => !prev);
              setShowVersionHistory(false);
              setShowStats(false);
            }}
            style={{
              padding: "6px 12px",
              background: showActivity ? "var(--accent-subtle)" : "transparent",
              color: showActivity ? "var(--accent-primary)" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: showActivity ? "var(--accent-border)" : "var(--border-color)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "550",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease",
            }}
          >
            <span>Activity</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            style={{
              padding: "6px 12px",
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "550",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease",
            }}
          >
            <span>Export</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            style={{
              padding: "6px 14px",
              background: "var(--accent-primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "var(--shadow-sm)",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            <span>Share</span>
          </button>

          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "var(--accent-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "650",
              color: "var(--accent-primary)",
              border: "1px solid var(--accent-border)",
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* Elevated Document Canvas Studio */}
      <div className="editor-workspace" style={{
        marginRight: (showVersionHistory || showStats || showActivity) ? (window.innerWidth < 768 ? '0' : '310px') : '0',
        transition: 'margin-right 0.25s ease',
      }}>
        <Editor
          ref={editorRef}
          documentId={id}
          initialContent={document?.content}
          onSave={handleSave}
          onChange={handleChange}
          onCursorMove={handleCursorMove}
          onSelectionChange={handleSelectionChange}
          wordCount={wordCount}
        />
      </div>

      <TypingIndicator typingUsers={typingUsers} />
      <SectionLockWarning locks={sectionLocks} />
      <CollaboratorAlert
        alerts={collabAlerts}
        onDismiss={handleAlertDismiss}
      />
      {showShareModal && (
        <ShareModal
          documentId={id}
          isOwner={isOwner}
          onClose={() => setShowShareModal(false)}
        />
      )}
      {showVersionHistory && (
        <VersionHistoryPanel
          documentId={id}
          isOwner={isOwner}
          onRestore={handleRestore}
          onClose={() => setShowVersionHistory(false)}
          showVersionHistory={showVersionHistory}
        />
      )}
      {showStats && (
        <DocumentStats
          quill={editorRef.current?.getQuill()}
          documentId={id}
          createdAt={document?.createdAt}
          updatedAt={document?.updatedAt}
          onClose={() => setShowStats(false)}
        />
      )}
      {showActivity && (
        <ActivityFeedPanel
          documentId={id}
          onClose={() => setShowActivity(false)}
        />
      )}
      {showExportModal && (
        <ExportModal
          title={document?.title || 'Untitled'}
          quill={editorRef.current?.getQuill()}
          onClose={() => setShowExportModal(false)}
        />
      )}
      </div>
    </>
  );
}
export default EditorPage;