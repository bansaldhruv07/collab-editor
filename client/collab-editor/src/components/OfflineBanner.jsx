import { useState, useEffect, useCallback } from 'react';
function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    if (wasOffline) {
      setShowReconnected(true);
      setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
    }
  }, [wasOffline]);
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
    setShowReconnected(false);
  }, []);
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);
  if (isOnline && !showReconnected) return null;
  if (showReconnected) {
    return (
      <div style={{
        position: 'fixed',
        top: '68px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#F0FDF4',
        border: '1px solid #86EFAC',
        borderRadius: '8px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#166534',
        fontWeight: '500',
        zIndex: 200,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        <span>✓</span>
        Back online — your changes are syncing
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>
      </div>
    );
  }
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#1F2937',
      color: '#fff',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 9999,
    }}>
      <div style={{ position: 'relative', width: '20px', height: '20px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#EF4444',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }} />
      </div>
      <span>You're offline</span>
      <span style={{
        fontSize: '13px',
        color: '#9CA3AF',
        fontWeight: '400',
      }}>
        — Changes will sync when you reconnect
      </span>
    </div>
  );
}
export default OfflineBanner;