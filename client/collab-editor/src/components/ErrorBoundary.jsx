import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      return (
        <div style={{
          minHeight: this.props.fullPage ? '100vh' : '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
          background: '#F9FAFB',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>

          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px',
          }}>
            Something went wrong
          </h2>

          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            maxWidth: '400px',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}>
            An unexpected error occurred in this part of the app.
            Your work has been saved. Try refreshing or clicking the button below.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <details style={{
              marginBottom: '20px',
              maxWidth: '500px',
              textAlign: 'left',
            }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '13px',
                color: '#9CA3AF',
                marginBottom: '8px',
              }}>
                Error details (dev only)
              </summary>
              <pre style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                overflow: 'auto',
                maxHeight: '200px',
              }}>
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                background: '#4F46E5',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#374151',
              }}
            >
              Go to dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
