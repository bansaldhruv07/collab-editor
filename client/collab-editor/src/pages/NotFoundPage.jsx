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
        color: '#E5E7EB',
        lineHeight: '1',
        marginBottom: '8px',
        letterSpacing: '-4px',
        userSelect: 'none',
      }}>
        404
      </div>

      <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>

      <h1 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '8px',
      }}>
        Page not found
      </h1>

      <p style={{
        fontSize: '15px',
        color: '#6B7280',
        maxWidth: '400px',
        lineHeight: '1.6',
        marginBottom: '8px',
      }}>
        The page{' '}
        <code style={{
          background: '#F3F4F6',
          padding: '1px 6px',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#374151',
        }}>
          {location.pathname}
        </code>
        {' '}doesn't exist or has been moved.
      </p>

      <p style={{
        fontSize: '13px',
        color: '#9CA3AF',
        marginBottom: '28px',
      }}>
        Redirecting to dashboard in {countdown}s...
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 24px',
            background: '#4F46E5',
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
            background: 'none',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            color: '#374151',
          }}
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
