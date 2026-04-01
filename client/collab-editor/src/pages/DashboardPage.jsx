import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import documentService from '../services/documentService';
import DocumentCard from '../components/DocumentCard';
import NewDocumentModal from '../components/NewDocumentModal';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Alert from '../components/Alert';

function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (title) => {
    try {
      const newDoc = await documentService.createDocument(title);
      setShowModal(false);
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      setError('Failed to create document.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;

    try {
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  const handleRename = async (id, title) => {
    try {
      const updated = await documentService.updateTitle(id, title);
      setDocuments(prev =>
        prev.map(doc => doc._id === id ? { ...doc, title: updated.title } : doc)
      );
    } catch (err) {
      setError('Failed to rename document.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>

      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        padding: '0 32px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <span style={{ fontWeight: '700', fontSize: '18px', color: '#4F46E5' }}>
          📝 CollabEditor
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>
            {user?.name}
          </span>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
              My Documents
            </h1>
            <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '14px' }}>
              {documents.length > 0
                ? `${documents.length} document${documents.length !== 1 ? 's' : ''}`
                : 'No documents yet'}
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            + New Document
          </Button>
        </div>

        <Alert message={error} type="error" />

        {loading && <Spinner />}

        {!loading && documents.length === 0 && !error && (
          <div style={{
            background: '#fff',
            border: '2px dashed #E5E7EB',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📄</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>
              Create your first document
            </h3>
            <p style={{ color: '#9CA3AF', marginTop: '8px', marginBottom: '28px', fontSize: '15px' }}>
              Start writing and collaborating in real time
            </p>
            <Button onClick={() => setShowModal(true)}>
              + New Document
            </Button>
          </div>
        )}

        {!loading && documents.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            {documents.map(doc => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onDelete={handleDelete}
                onRename={handleRename}
                currentUserId={user?._id}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <NewDocumentModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default DashboardPage;