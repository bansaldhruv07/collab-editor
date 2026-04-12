import { useState, useEffect } from 'react';
import documentService from '../services/documentService';
import Spinner from './Spinner';
const ACTIVITY_LABELS = {
  document_created: 'created this document',
  document_edited: 'edited the document',
  document_saved: 'saved the document',
  title_changed: (meta) => `renamed to "${meta?.newTitle}"`,
  collaborator_added: (meta) => `added ${meta?.collaboratorName} as collaborator`,
  collaborator_removed: (meta) => `removed ${meta?.collaboratorName}`,
  version_restored: 'restored a previous version',
  document_viewed: 'viewed the document',
};
const ACTIVITY_ICONS = {
  document_created: '✨',
  document_edited: '✏️',
  document_saved: '💾',
  title_changed: '🏷️',
  collaborator_added: '👥',
  collaborator_removed: '👤',
  version_restored: '↩️',
  document_viewed: '👁️',
};
function ActivityFeedPanel({ documentId, onClose }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    fetchActivity();
  }, [documentId]);
  const fetchActivity = async () => {
    try {
      setLoading(true);
      const data = await documentService.getActivity(documentId);
      setActivities(data.activity);
    } catch (err) {
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };
  const getLabel = (activity) => {
    const label = ACTIVITY_LABELS[activity.type];
    if (typeof label === 'function') {
      return label(activity.metadata);
    }
    return label || activity.type;
  };
  const timeAgo = (dateString) => {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, );
  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: '60px',
      bottom: 0,
      width: '300px',
      background: '#fff',
      borderLeft: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
    }}>
      
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
            Activity
          </h3>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
            Document history
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchActivity}
            title="Refresh"
            style={{
              background: 'none',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '5px 8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#6B7280',
            }}
          >
            ↻
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#9CA3AF',
            }}
          >
            ✕
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loading && <Spinner size={28} />}
        {error && (
          <p style={{ color: '#EF4444', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </p>
        )}
        {!loading && activities.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
            <p style={{ fontSize: '14px' }}>No activity yet</p>
          </div>
        )}
        
        {Object.entries(groupedActivities).map(([date, items]) => (
          <div key={date} style={{ marginBottom: '20px' }}>
            
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px',
              paddingBottom: '6px',
              borderBottom: '1px solid #F3F4F6',
            }}>
              {date}
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
              {items.map((activity, index) => (
                <div
                  key={activity._id || index}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    flexShrink: 0,
                  }}>
                    {ACTIVITY_ICONS[activity.type] || '📝'}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px',
                      color: '#111827',
                      lineHeight: '1.4',
                      margin: 0,
                    }}>
                      <strong>{activity.userName}</strong>
                      {' '}
                      {getLabel(activity)}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: '#9CA3AF',
                      marginTop: '2px',
                    }}>
                      {timeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ActivityFeedPanel;