import { Component } from "react";

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
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
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
        <div
          style={{
            minHeight: this.props.fullPage ? "100vh" : "200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            textAlign: "center",
            background: "var(--bg-primary)",
          }}
        >
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            color: "var(--danger-primary)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              maxWidth: "400px",
              lineHeight: "1.6",
              marginBottom: "24px",
            }}
          >
            An unexpected error occurred in this part of the app. Your work has
            been saved. Try refreshing or clicking the button below.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <details
              style={{
                marginBottom: "20px",
                maxWidth: "500px",
                textAlign: "left",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  marginBottom: "8px",
                }}
              >
                Error details (dev only)
              </summary>
              <pre
                style={{
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                {this.state.error.toString()}
                {"\n\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: "10px 20px",
                background: "var(--accent-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "9px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              style={{
                padding: "10px 20px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
                color: "var(--text-primary)",
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
