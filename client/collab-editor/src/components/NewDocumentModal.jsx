import { useState } from 'react';
import Button from './Button';
function NewDocumentModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onCreate(title || 'Untitled Document');
    setLoading(false);
  };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
          Create new document
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
          Give your document a name to get started
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Project Proposal"
            autoFocus
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1.5px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              marginBottom: '20px',
            }}
            onFocus={e => e.target.style.borderColor = '#4F46E5'}
            onBlur={e => e.target.style.borderColor = '#D1D5DB'}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default NewDocumentModal;
