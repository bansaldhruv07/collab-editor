function Button({ children, onClick, type = 'button', loading = false, variant = 'primary', fullWidth = false, disabled = false, style = {} }) {
  const baseStyle = {
    padding: '9px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '550',
    border: '1px solid transparent',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    opacity: loading || disabled ? 0.65 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: variant === 'primary' ? 'var(--shadow-sm)' : 'none',
  };
  const variants = {
    primary: {
      background: 'var(--accent-primary)',
      color: '#ffffff',
      borderColor: 'transparent',
    },
    secondary: {
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-color)',
    },
    danger: {
      background: 'var(--danger-primary)',
      color: '#ffffff',
      borderColor: 'transparent',
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={{ ...baseStyle, ...variants[variant], ...style }}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
export default Button;