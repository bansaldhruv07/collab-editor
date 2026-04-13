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
  const saveIndicator = {
    saved: { text: "✓ Saved", color: "#16A34A" },
    saving: { text: "⟳ Saving...", color: "#9CA3AF" },
    unsaved: { text: "● Unsaved", color: "#D97706" },
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
        }}
      >
        <div style={{ fontSize: "48px" }}>⚠️</div>
        <h2 style={{ fontSize: "20px", color: "#374151" }}>{error}</h2>
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
        <button
          onClick={() => {
            setShowVersionHistory(prev => !prev);
            setShowStats(false);
            setShowActivity(false);
          }}
          style={{
            padding: "7px 16px",
            background: showVersionHistory ? "#EEF2FF" : "transparent",
            color: showVersionHistory ? "#4F46E5" : "#6B7280",
            border: "1px solid",
            borderColor: showVersionHistory ? "#C7D2FE" : "#E5E7EB",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          🕐 History
        </button>
        <button
          onClick={() => {
            setShowStats(prev => !prev);
            setShowVersionHistory(false);
            setShowActivity(false);
          }}
          style={{
            padding: '7px 16px',
            background: showStats ? '#EEF2FF' : 'transparent',
            color: showStats ? '#4F46E5' : '#6B7280',
            border: '1px solid',
            borderColor: showStats ? '#C7D2FE' : '#E5E7EB',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          📊 Stats
        </button>
        <button
          onClick={() => {
            setShowActivity(prev => !prev);
            setShowVersionHistory(false);
            setShowStats(false);
          }}
          style={{
            padding: '7px 16px',
            background: showActivity ? '#EEF2FF' : 'transparent',
            color: showActivity ? '#4F46E5' : '#6B7280',
            border: '1px solid',
            borderColor: showActivity ? '#C7D2FE' : '#E5E7EB',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          📋 Activity
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          style={{
            padding: '7px 14px',
            background: 'transparent',
            color: '#6B7280',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          ↓ Export
        </button>
        <PresenceAvatars users={activeUsers} currentUserId={user?._id} />
        {lastEditedBy && lastEditedBy._id !== user?._id && (
          <span style={{
            fontSize: '12px',
            color: '#9CA3AF',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            Last edit by{' '}
            <strong style={{ color: '#6B7280' }}>
              {lastEditedBy.name}
            </strong>
          </span>
        )}
        <div
          title="Keyboard shortcuts: Ctrl+S to save"
          style={{
            fontSize: "12px",
            color: "#9CA3AF",
            cursor: "default",
            display: window.innerWidth < 640 ? 'none' : 'flex',
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
        {!isConnected && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#92400E',
          }}>
            <div style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#F59E0B',
            }} />
            Reconnecting...
          </div>
        )}
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
      <div style={{
        flex: 1,
        maxWidth: '860px',
        width: '100%',
        margin: '0 auto',
        background: '#fff',
        marginRight: (showVersionHistory || showStats || showActivity) ? '300px' : '0',
        transition: 'margin-right 0.3s ease',
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
        />
      )}
      {showStats && (
        <DocumentStats
          quill={editorRef.current?.getQuill()}
          documentId={id}
          createdAt={document?.createdAt}
          updatedAt={document?.updatedAt}
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