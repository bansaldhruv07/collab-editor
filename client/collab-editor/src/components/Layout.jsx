import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";

function Layout({ children }) {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  if (isAuthPage) return children;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-color)",
          padding: "0 24px",
          height: "var(--nav-height, 56px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <Link
          to="/dashboard"
          style={{
            fontWeight: "700",
            fontSize: "17px",
            color: "var(--accent-primary)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span style={{ display: "inline" }}>CollabEditor</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Quick Light/Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              background: "none",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "7px 10px",
              cursor: "pointer",
              fontSize: "15px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {resolvedTheme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <NotificationBell />

          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              aria-label="Open user menu"
              aria-expanded={showUserMenu}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "1px solid var(--border-color)",
                borderRadius: "30px",
                padding: "5px 10px 5px 5px",
                cursor: "pointer",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-color)")
              }
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--accent-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {getInitials(user?.name)}
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                ▼
              </span>
            </button>
            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  boxShadow: "var(--shadow-xl)",
                  minWidth: "210px",
                  overflow: "hidden",
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--border-color)",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {user?.name}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginTop: "2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.email}
                  </p>
                </div>
                <div style={{ padding: "6px" }}>
                  <MenuLink
                    to="/dashboard"
                    icon="📄"
                    label="My Documents"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <MenuLink
                    to="/trash"
                    icon="🗑️"
                    label="Recycle bin"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <MenuLink
                    to="/profile"
                    icon="👤"
                    label="Profile"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <MenuLink
                    to="/settings"
                    icon="⚙️"
                    label="Settings"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    style={{ borderTop: "1px solid var(--border-color)", margin: "6px 0" }}
                  />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "9px 12px",
                      background: "none",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "var(--danger-primary)",
                      textAlign: "left",
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--danger-bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main id="main-content">{children}</main>
    </div>
  );
}

function MenuLink({ to, icon, label, onClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <button
      onClick={() => {
        navigate(to);
        onClick?.();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        padding: "9px 12px",
        background: isActive ? "var(--accent-subtle)" : "none",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
        textAlign: "left",
        fontWeight: isActive ? "600" : "450",
        transition: "all 0.1s ease",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "none";
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default Layout;