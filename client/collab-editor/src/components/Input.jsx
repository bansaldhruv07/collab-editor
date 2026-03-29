function Input({ label, type = 'text', value, onChange, placeholder, error, name }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '8px',
          border: `1.5px solid ${error ? '#EF4444' : '#D1D5DB'}`,
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s',
          background: '#fff',
          color: '#111',
        }}
        onFocus={e => e.target.style.borderColor = '#4F46E5'}
        onBlur={e => e.target.style.borderColor = error ? '#EF4444' : '#D1D5DB'}
      />
      {error && (
        <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;