import { useState, useCallback } from 'react';
import retryWithBackoff from '../utils/retry';

function RetryableRequest({
  fetch,
  children,
  loadingFallback,
  onSuccess,
}) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    retrying: false,
    attempt: 0,
    nextRetryIn: 0,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await retryWithBackoff(fetch, {
        maxAttempts: 3,
        onRetry: (attempt, delay) => {
          setState(prev => ({
            ...prev,
            retrying: true,
            attempt,
            nextRetryIn: Math.ceil(delay / 1000),
          }));
        },
      });

      setState({ loading: false, error: null, retrying: false, attempt: 0, nextRetryIn: 0 });
      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      setState({
        loading: false,
        error,
        retrying: false,
        attempt: 0,
        nextRetryIn: 0,
      });
    }
  }, [fetch, onSuccess]);

  if (state.loading || state.retrying) {
    return loadingFallback || (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#6B7280',
        fontSize: '14px',
      }}>
        {state.retrying
          ? `Retrying... (attempt ${state.attempt}/3, next in ${state.nextRetryIn}s)`
          : 'Loading...'}
      </div>
    );
  }

  if (state.error) {
    const isNetworkError = !state.error.response;
    const statusCode = state.error.response?.status;

    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>
          {isNetworkError ? '📡' : '⚠️'}
        </div>
        <p style={{
          fontSize: '15px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px',
        }}>
          {isNetworkError
            ? 'Connection failed'
            : statusCode >= 500
              ? 'Server error'
              : 'Request failed'}
        </p>
        <p style={{
          fontSize: '13px',
          color: '#9CA3AF',
          marginBottom: '20px',
        }}>
          {isNetworkError
            ? 'Check your internet connection and try again'
            : state.error.response?.data?.message || 'Something went wrong'}
        </p>
        <button
          onClick={execute}
          style={{
            padding: '9px 20px',
            background: '#4F46E5',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return children(execute);
}

export default RetryableRequest;
