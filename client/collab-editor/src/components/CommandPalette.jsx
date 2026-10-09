import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '../services/documentService';
function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const staticCommands = [
    {
      id: 'new-doc',
      label: 'New document',
      icon: '📄',
      shortcut: 'Ctrl+N',
      action: () => { navigate('/dashboard'); onClose(); },
      category: 'Actions',
    },
    {
      id: 'go-dashboard',
      label: 'Go to Dashboard',
      icon: '🏠',
      action: () => { navigate('/dashboard'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'go-profile',
      label: 'Go to Profile',
      icon: '👤',
      action: () => { navigate('/profile'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'go-settings',
      label: 'Go to Settings',
      icon: '⚙️',
      action: () => { navigate('/settings'); onClose(); },
      category: 'Navigation',
    },
  ];
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!query.trim()) {
      setResults(staticCommands);
      setSelectedIndex(0);
      return;
    }
    const searchDocuments = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocuments({
          search: query,
          limit: 5,
        });
        const docResults = data.documents.map(doc => ({
          id: doc._id,
          label: doc.title,
          icon: '📄',
          subtitle: `Last edited ${new Date(doc.updatedAt)
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          action: () => { navigate(`/document/${doc._id}`); onClose(); },
          category: 'Documents',
        }));
        const filteredCommands = staticCommands.filter(cmd =>
          cmd.label.toLowerCase().includes(query.toLowerCase())
        );
        setResults([...docResults, ...filteredCommands]);
        setSelectedIndex(0);
      } catch (err) {
        setResults(staticCommands);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(searchDocuments, 200);
    return () => clearTimeout(timer);
  }, [query]);
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action();
        }
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  }, [results, selectedIndex, onClose]);
  const groupedResults = results.reduce((groups, result) => {
    const cat = result.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(result);
    return groups;
  }, {});
  let globalIndex = 0;
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        zIndex: 1000,
      }}
    >
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        margin: '0 20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documents or type a command..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--text-primary)',
              background: 'transparent',
            }}
          />
          {loading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid var(--border-color)',
              borderTop: '2px solid var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }} />
          )}
          <kbd style={{
            padding: '2px 6px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}>
            Esc
          </kbd>
        </div>
        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
          {results.length === 0 && !loading && (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}>
              No results for "{query}"
            </div>
          )}
          {Object.entries(groupedResults).map(([category, items]) => (
            <div key={category}>
              <div style={{
                padding: '8px 20px 4px',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {category}
              </div>
              {items.map((item) => {
                const itemIndex = globalIndex++;
                const isSelected = itemIndex === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 20px',
                      background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                  >
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '14px',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontWeight: isSelected ? '600' : '450',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.label}
                      </p>
                      {item.subtitle && (
                        <p style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          margin: 0,
                          marginTop: '1px',
                        }}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    {item.shortcut && (
                      <kbd style={{
                        padding: '2px 6px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                      }}>
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <span style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                      }}>
                        ↵
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{
          padding: '8px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          gap: '16px',
        }}>
          {[
            { key: '↑↓', label: 'navigate' },
            { key: '↵', label: 'select' },
            { key: 'Esc', label: 'close' },
          ].map(hint => (
            <div key={hint.key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <kbd style={{
                padding: '1px 5px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '3px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
              }}>
                {hint.key}
              </kbd>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {hint.label}
              </span>
            </div>
          ))}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
export default CommandPalette;