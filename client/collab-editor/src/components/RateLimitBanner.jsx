import { useState, useEffect } from 'react';

function RateLimitBanner({ retryAfter, onRetry }) {
  const [secondsLeft, setSecondsLeft] = useState(retryAfter || 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = minutes > 0
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`;

  return (
    <div style={{
      background: 'var(--warning-bg)',
      border: '1px solid var(--warning-border)',
      borderRadius: '10px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '16px 0',
    }}>
      <span style={{ fontSize: '20px', flexShrink: 0 }}>⏳</span>

      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--warning-text)',
          marginBottom: '2px',
        }}>
          Too many requests
        </p>
        <p style={{ fontSize: '13px', color: 'var(--warning-text)', opacity: 0.85 }}>
          {secondsLeft > 0
            ? `Please wait ${timeDisplay} before trying again`
            : 'You can try again now'}
        </p>
      </div>

      {secondsLeft === 0 && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            background: '#D97706',
            color: '#fff',
            border: 'none',
            borderRadius: '7px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

export default RateLimitBanner;
