import { useState, useCallback } from 'react';

function useApiCall(fn, options = {}) {
  const {
    onSuccess,
    onError,
    successMessage,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError('');
      const result = await fn(...args);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message
        || (err.isRateLimited ? 'Too many requests — please wait' : null)
        || (!navigator.onLine ? 'You are offline' : null)
        || 'Something went wrong';

      setError(message);
      if (onError) onError(err, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn, onSuccess, onError]);

  return { execute, loading, error, setError };
}

export default useApiCall;
