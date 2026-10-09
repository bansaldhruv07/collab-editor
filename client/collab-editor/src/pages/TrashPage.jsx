import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '../services/documentService';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

function TrashPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const data = await documentService.getTrash();
      setDocuments(data.documents);
    } catch (err) {
      addToast('Failed to load trash', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await documentService.restoreDocument(id);
      setDocuments(prev => prev.filter(d => d._id !== id));
      addToast('Document restored', 'success');
    } catch (err) {
      addToast('Failed to restore document', 'error');
    }
  };

  const handlePermanentDelete = async (id, title) => {
    if (!window.confirm(
      `Permanently delete "${title}"? This cannot be undone.`
    )) return;

    try {
      await documentService.permanentDelete(id);
      setDocuments(prev => prev.filter(d => d._id !== id));
      addToast('Document permanently deleted', 'success');
    } catch (err) {
      addToast('Failed to delete document', 'error');
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm(
      'Permanently delete all documents in trash? This cannot be undone.'
    )) return;

    try {
      await Promise.all(
        documents.map(doc => documentService.permanentDelete(doc._id))
      );
      setDocuments([]);
      addToast('Trash emptied', 'success');
    } catch (err) {
      addToast('Failed to empty trash', 'error');
    }
  };

  const formatDeletedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Recycle bin
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Documents are permanently deleted after 30 days
          </p>
        </div>
        {documents.length > 0 && (
          <Button variant="danger" onClick={handleEmptyTrash}>
            Empty trash
          </Button>
        )}
      </div>

      {loading && <Spinner />}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 24px',
          color: 'var(--text-muted)',
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border-color)',
          borderRadius: '16px',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'var(--bg-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--text-muted)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Trash is empty
          </h3>
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Deleted documents appear here for 30 days
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--text-primary)',
              fontWeight: '500',
            }}
          >
            ← Back to dashboard
          </button>
        </div>
      )}

      {/* Document List */}
      {!loading && documents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {documents.map(doc => (
            <div
              key={doc._id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--text-secondary)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {doc.title}
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Deleted {formatDeletedDate(doc.deletedAt)}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: doc.daysRemaining <= 3 ? '#EF4444' : 'var(--text-muted)',
                    fontWeight: doc.daysRemaining <= 3 ? '500' : '400',
                  }}>
                    {doc.daysRemaining} day{doc.daysRemaining !== 1 ? 's' : ''} until permanent deletion
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleRestore(doc._id)}
                  style={{
                    padding: '7px 14px',
                    background: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(79, 70, 229, 0.2)',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(doc._id, doc.title)}
                  style={{
                    padding: '7px 14px',
                    background: 'none',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '7px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Delete forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrashPage;
