function SectionLockWarning({ locks }) {
  if (!locks || locks.length === 0) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      zIndex: 150,
      pointerEvents: 'none',
    }}>
      {locks.map(lock => (
        <div
          key={lock.userId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: '#fff',
            border: `1px solid ${lock.color}40`,
            borderLeft: `3px solid ${lock.color}`,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontSize: '13px',
            color: '#374151',
            animation: 'fadeInUp 0.2s ease-out',
          }}
        >
          
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: lock.color,
            flexShrink: 0,
          }} />
          <span>
            <strong>{lock.name}</strong>
            {' is also editing near '}
            <em style={{ color: '#6B7280' }}>
              "{lock.lineText || 'this section'}"
            </em>
          </span>
        </div>
      ))}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
export default SectionLockWarning;