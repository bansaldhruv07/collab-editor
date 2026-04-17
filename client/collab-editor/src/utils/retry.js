

const retryWithBackoff = async (
  fn,
  options = {}
) => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry = null,
    retryOn = (error) => {

      const status = error.response?.status;
      return !status || status >= 500;
    },
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!retryOn(error)) {
        throw error;
      }

      if (attempt === maxAttempts) {
        break;
      }

      const exponentialDelay = Math.min(
        baseDelay * Math.pow(2, attempt - 1),
        maxDelay
      );
      const jitter = Math.random() * 200;
      const delay = exponentialDelay + jitter;

      if (onRetry) {
        onRetry(attempt, delay, error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export default retryWithBackoff;
