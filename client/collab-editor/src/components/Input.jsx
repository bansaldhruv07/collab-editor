function Input({ label, type = 'text', value, onChange, placeholder, error, name, id }) {
  const inputId = id || name;

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: '550',
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '8px',
          border: `1px solid ${error ? 'var(--danger-primary)' : 'var(--border-color)'}`,
          fontSize: '14px',
          outline: 'none',
          transition: 'all 0.15s ease',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--danger-primary)' : 'var(--border-color)'}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          style={{ color: 'var(--danger-primary)', fontSize: '12px', marginTop: '4px' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
export default Input;