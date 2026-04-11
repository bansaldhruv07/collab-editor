function Button({ children, onClick, type = 'button', loading = false, variant = 'primary', fullWidth = false, disabled = false }) {
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    opacity: loading || disabled ? 0.7 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'background 0.2s, transform 0.1s',
  };
  const variants = {
    primary: {
      background: '#4F46E5',
      color: '#fff',
    },
    secondary: {
      background: '#f0f0f0',
      color: '#333',
    },
    danger: {
      background: '#EF4444',
      color: '#fff',
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
export default Button;
