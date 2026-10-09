import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}>

      <div style={{
        fontSize: '120px',
        fontWeight: '900',
        color: 'var(--border-color)',
        lineHeight: '1',
        marginBottom: '8px',
        letterSpacing: '-4px',
        userSelect: 'none',
      }}>
        404
      </div>

      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        background: 'var(--bg-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        color: 'var(--text-secondary)',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <h1 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '8px',
        letterSpacing: '-0.02em',
      }}>
        Page not found
      </h1>

      <p style={{
        fontSize: '15px',
        color: 'var(--text-secondary)',
        maxWidth: '400px',
        lineHeight: '1.6',
        marginBottom: '8px',
      }}>
        The page{' '}
        <code style={{
          background: 'var(--bg-secondary)',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '13px',
          color: 'var(--accent-primary)',
          border: '1px solid var(--border-color)',
        }}>
          {location.pathname}
        </code>
        {' '}doesn't exist or has been moved.
      </p>

      <p style={{
        fontSize: '13px',
        color: 'var(--text-muted)',
        marginBottom: '28px',
      }}>
        Redirecting to dashboard in {countdown}s...
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 24px',
            background: 'var(--accent-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Go to dashboard
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
