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

      {}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            🗑️ Recycle bin
          </h1>
          <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '14px' }}>
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

      {}
      {!loading && documents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 24px',
          color: '#9CA3AF',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🗑️</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>
            Trash is empty
          </h3>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>
            Deleted documents appear here for 30 days
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'none',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
            }}
          >
            ← Back to dashboard
          </button>
        </div>
      )}

      {}
      {!loading && documents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {documents.map(doc => (
            <div
              key={doc._id}
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {}
              <div style={{
                fontSize: '28px',
                flexShrink: 0,
                opacity: 0.5,
              }}>
                📄
              </div>

              {}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {doc.title}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    Deleted {formatDeletedDate(doc.deletedAt)}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: doc.daysRemaining <= 3 ? '#EF4444' : '#9CA3AF',
                    fontWeight: doc.daysRemaining <= 3 ? '500' : '400',
                  }}>
                    {doc.daysRemaining} day{doc.daysRemaining !== 1 ? 's' : ''} until permanent deletion
                  </span>
                </div>
              </div>

              {}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleRestore(doc._id)}
                  style={{
                    padding: '7px 14px',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    border: 'none',
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
                    border: '1px solid #FECACA',
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
