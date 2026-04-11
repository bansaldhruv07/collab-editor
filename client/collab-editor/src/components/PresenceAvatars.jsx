function PresenceAvatars({ users, currentUserId }) {
  if (!users || users.length === 0) return null;

  const otherUsers = users.filter(u => u.userId !== currentUserId);
  const MAX_VISIBLE = 3;
  const visible = otherUsers.slice(0, MAX_VISIBLE);
  const overflow = otherUsers.length - MAX_VISIBLE;
  const totalInRoom = users.length;

  if (otherUsers.length === 0) {

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#D1D5DB',
      }}>
        <div style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#D1D5DB',
        }} />
        Only you
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

      <span style={{
        fontSize: '12px',
        color: '#6B7280',
        whiteSpace: 'nowrap',
      }}>
        {totalInRoom} editing
      </span>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {visible.map((user, index) => (
          <div
            key={user.socketId}
            title={user.name}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: user.color,
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '600',
              color: '#fff',
              marginLeft: index === 0 ? '0' : '-8px',
              zIndex: visible.length - index,
              position: 'relative',
              cursor: 'default',
              transition: 'transform 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.zIndex = '99';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.zIndex = String(visible.length - index);
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}

        {overflow > 0 && (
          <div
            title={`${overflow} more`}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#E5E7EB',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '600',
              color: '#6B7280',
              marginLeft: '-8px',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            +{overflow}
          </div>
        )}
      </div>

      <div style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: '#22C55E',
        animation: 'pulse 2s infinite',
        flexShrink: 0,
      }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

export default PresenceAvatars;
