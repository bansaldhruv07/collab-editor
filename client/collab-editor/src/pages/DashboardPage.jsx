import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import retryWithBackoff from '../utils/retry';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import documentService from "../services/documentService";
import DocumentCard from "../components/DocumentCard";
import NewDocumentModal from "../components/NewDocumentModal";
import Button from "../components/Button";
import Alert from "../components/Alert";
import { DocumentCardSkeleton } from "../components/Skeleton";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { useToast } from "../components/Toast";
import TemplatePicker from "../components/TemplatePicker";
import ProgressBar from "../components/ProgressBar";
import Onboarding from "../components/Onboarding";
function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { addToast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 400);
  useKeyboardShortcut("n", () => setShowTemplatePicker(true));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);
  useEffect(() => {
    fetchDocuments();
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    const shouldShow = localStorage.getItem("showOnboarding") === "true";
    if (shouldShow) {
      setShowOnboarding(true);
      localStorage.removeItem("showOnboarding");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setShowTemplatePicker(true);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);
  const fetchDocuments = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError("");
      const data = await retryWithBackoff(
        () => documentService.getDocuments({
          search: debouncedSearch || undefined,
          page: currentPage,
          limit: 20,
          forceRefresh,
        }),
        {
          maxAttempts: 3,
          retryOn: (error) => {
            const status = error.response?.status;
            return !status || status >= 500;
          },
          onRetry: (attempt) => {
            setError(`Connection issue. Retrying... (${attempt}/3)`);
          },
        }
      );
      setDocuments(data.documents);
      setPagination(data.pagination);
      setError("");
    } catch (err) {
      if (!navigator.onLine) {
        setError('You are offline. Your documents will load when you reconnect.');
      } else {
        setError("Failed to load documents. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage]);
  const handleCreate = async (template) => {
    try {
      const title =
        template.id === "blank" ? "Untitled Document" : template.name;
      const newDoc = await documentService.createDocument(title);
      if (template.content && template.id !== "blank") {
        await documentService.saveContent(
          newDoc._id,
          template.content,
          template.htmlContent,
        );
      }
      setShowTemplatePicker(false);
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      addToast("Failed to create document", "error");
    }
  };
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      addToast("Document moved to recycle bin", "success");
    } catch (err) {
      addToast("Failed to delete document", "error");
    }
  }, []);
  const handleRename = useCallback(
    async (id, title) => {
      try {
        const updated = await documentService.updateTitle(id, title);
        setDocuments((prev) =>
          prev.map((doc) =>
            doc._id === id ? { ...doc, title: updated.title } : doc,
          ),
        );
        addToast("Document renamed", "success");
      } catch (err) {
        addToast("Failed to rename document", "error");
      }
    },
    [addToast],
  );
  const handleDuplicate = useCallback(
    async (id) => {
      try {
        const newDoc = await documentService.duplicateDocument(id);
        setDocuments((prev) => [newDoc, ...prev]);
        addToast("Document duplicated", "success");
      } catch (err) {
        addToast("Failed to duplicate document", "error");
      }
    },
    [addToast],
  );
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <>
      <ProgressBar loading={loading} />
      <div style={{ minHeight: "100%", background: "transparent" }}>
      <main
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{ fontSize: "28px", fontWeight: "750", color: "var(--text-primary)", letterSpacing: "-0.025em" }}
            >
              My Documents
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: "4px", fontSize: "14px" }}>
              {searchQuery
                ? `${documents.length} result${documents.length !== 1 ? "s" : ""}`
                : documents.length > 0
                  ? `${documents.length} document${documents.length !== 1 ? "s" : ""}`
                  : "No documents yet"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => fetchDocuments(true)}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "14px",
                color: "var(--text-secondary)",
                transition: "all 0.15s ease",
              }}
              title="Refresh documents"
            >
              ↻ Refresh
            </button>
            <Button onClick={() => setShowTemplatePicker(true)}>
              + New Document
            </Button>
          </div>
        </div>
        <div style={{ marginBottom: "28px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title..."
            style={{
              width: "100%",
              maxWidth: "380px",
              padding: "10px 16px",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-sm)",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
          />
        </div>
        <Alert message={error} type="error" />
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {[...Array(6)].map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        )}
        {!loading && documents.length === 0 && !error && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 24px",
              textAlign: "center",
            }}
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              style={{ marginBottom: "24px", opacity: 0.6 }}
            >
              <rect
                x="20"
                y="10"
                width="80"
                height="100"
                rx="8"
                fill="#EEF2FF"
                stroke="#C7D2FE"
                strokeWidth="2"
              />
              <rect x="33" y="28" width="54" height="6" rx="3" fill="#A5B4FC" />
              <rect x="33" y="42" width="40" height="6" rx="3" fill="#C7D2FE" />
              <rect x="33" y="56" width="48" height="6" rx="3" fill="#C7D2FE" />
              <rect x="33" y="70" width="36" height="6" rx="3" fill="#C7D2FE" />
              <circle cx="88" cy="88" r="20" fill="#4F46E5" />
              <text
                x="88"
                y="94"
                textAnchor="middle"
                fill="white"
                fontSize="20"
                fontWeight="bold"
              >
                +
              </text>
            </svg>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              No documents yet
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "15px",
                marginBottom: "28px",
                maxWidth: "320px",
                lineHeight: "1.6",
              }}
            >
              Create your first document and start collaborating in real time
            </p>
            <Button onClick={() => setShowTemplatePicker(true)}>
              + Create your first document
            </Button>
          </div>
        )}
        {!loading && searchQuery && documents.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              color: "var(--text-secondary)",
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--bg-secondary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              color: "var(--text-muted)",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: "500" }}>
              No documents match "{searchQuery}"
            </p>
          </div>
        )}
        {!loading && documents.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onDelete={handleDelete}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                currentUserId={user?._id}
              />
            ))}
          </div>
        )}
        {pagination && pagination.pages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '32px',
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 14px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
                fontSize: '14px',
                color: 'var(--text-primary)',
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Page {currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() => setCurrentPage(prev =>
                Math.min(pagination.pages, prev + 1)
              )}
              disabled={currentPage === pagination.pages}
              style={{
                padding: '8px 14px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: currentPage === pagination.pages ? 'not-allowed' : 'pointer',
                opacity: currentPage === pagination.pages ? 0.5 : 1,
                fontSize: '14px',
                color: 'var(--text-primary)',
              }}
            >
              Next →
            </button>
          </div>
        )}
        {debouncedSearch && pagination && (
          <p style={{
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginTop: '16px',
          }}>
            {pagination.total === 0
              ? `No results for "${debouncedSearch}"`
              : `${pagination.total} result${pagination.total !== 1 ? 's' : ''} for "${debouncedSearch}"`
            }
          </p>
        )}
      </main>
      {showTemplatePicker && (
        <TemplatePicker
          onClose={() => setShowTemplatePicker(false)}
          onSelect={handleCreate}
        />
      )}
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
      </div>
    </>
  );
}
export default DashboardPage;