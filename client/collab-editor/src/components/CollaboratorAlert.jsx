import { useState, useEffect } from 'react';
function Alert({ alert, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(alert.id), 3500);
    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);
  const isJoin = alert.type === 'join';
  return (
    <div
      onClick={() => onDismiss(alert.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: '#fff',
        border: `1px solid ${isJoin ? '#BBF7D0' : '#E5E7EB'}`,
        borderLeft: `3px solid ${alert.color}`,
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        animation: 'alertSlideIn 0.25s ease-out',
        maxWidth: '280px',
      }}
    >
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: alert.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: '#fff',
        flexShrink: 0,
      }}>
        {alert.name?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p style={{
          fontSize: '13px',
          fontWeight: '500',
          color: '#111827',
          margin: 0,
        }}>
          {alert.name}
        </p>
        <p style={{
          fontSize: '12px',
          color: '#9CA3AF',
          margin: 0,
        }}>
          {isJoin ? 'joined the document' : 'left the document'}
        </p>
      </div>
      <span style={{
        marginLeft: 'auto',
        fontSize: '14px',
        flexShrink: 0,
      }}>
        {isJoin ? '👋' : '👋'}
      </span>
      <style>{`
        @keyframes alertSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
function CollaboratorAlert({ alerts, onDismiss }) {
  if (alerts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',   
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 200,
    }}>
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          alert={alert}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
export default CollaboratorAlert;
