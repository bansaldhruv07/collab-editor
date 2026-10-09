import { useState } from 'react';
import exportService from '../services/exportService';
import { useToast } from './Toast';
const EXPORT_OPTIONS = [
  {
    id: 'text',
    label: 'Plain text',
    extension: '.txt',
    icon: '📄',
    description: 'Simple text without formatting',
  },
  {
    id: 'markdown',
    label: 'Markdown',
    extension: '.md',
    icon: '📝',
    description: 'Formatted text for developers',
  },
  {
    id: 'html',
    label: 'HTML',
    extension: '.html',
    icon: '🌐',
    description: 'Full webpage with styles',
  },
  {
    id: 'json',
    label: 'JSON (Delta)',
    extension: '.json',
    icon: '{ }',
    description: 'Raw editor format for re-import',
  },
];
function ExportModal({ title, quill, onClose }) {
  const [selected, setSelected] = useState('markdown');
  const [exporting, setExporting] = useState(false);
  const { addToast } = useToast();
  const handleExport = async () => {
    if (!quill) {
      addToast('Editor not ready', 'error');
      return;
    }
    try {
      setExporting(true);
      switch (selected) {
        case 'text':
          exportService.exportAsText(title, quill);
          break;
        case 'markdown':
          exportService.exportAsMarkdown(title, quill);
          break;
        case 'html':
          exportService.exportAsHTML(title, quill);
          break;
        case 'json':
          exportService.exportAsJSON(title, quill);
          break;
        default:
          break;
      }
      addToast('Download started', 'success');
      onClose();
    } catch (err) {
      addToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  const selectedOption = EXPORT_OPTIONS.find(o => o.id === selected);
  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
    >
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Export document
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Download "{title}" in your preferred format
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '24px',
        }}>
          {EXPORT_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              style={{
                padding: '14px',
                background: selected === option.id ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                border: selected === option.id
                  ? '2px solid var(--accent-primary)'
                  : '1px solid var(--border-color)',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>
                {option.icon}
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: selected === option.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                marginBottom: '2px',
              }}>
                {option.label}
              </p>
              <p style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                lineHeight: '1.3',
              }}>
                {option.description}
              </p>
            </button>
          ))}
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>File:</span>
          <span style={{
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
          }}>
            {title
              .replace(/[^a-zA-Z0-9\s-_]/g, '')
              .replace(/\s+/g, '-')
              .toLowerCase()
              .slice(0, 30)}
            {selectedOption?.extension}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: '10px 20px',
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: exporting ? 'not-allowed' : 'pointer',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? 'Exporting...' : `Download ${selectedOption?.extension}`}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ExportModal;