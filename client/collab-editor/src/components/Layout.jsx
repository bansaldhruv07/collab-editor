import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function Layout({ children }) {
  const { user, logout } = useAuth();
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
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <nav
        style={{
          background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          to="/dashboard"
          style={{
            fontWeight: "700",
            fontSize: "18px",
            color: "#4F46E5",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📝 <span style={{ display: "inline" }}>CollabEditor</span>
        </Link>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "none",
              border: "1px solid #E5E7EB",
              borderRadius: "30px",
              padding: "6px 12px 6px 6px",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#C7D2FE")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#E5E7EB")
            }
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "#4F46E5",
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
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
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
                color: "#9CA3AF",
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
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                minWidth: "200px",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #F3F4F6",
                  background: "#F9FAFB",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user?.name}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9CA3AF",
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
                  style={{ borderTop: "1px solid #F3F4F6", margin: "6px 0" }}
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
                    color: "#DC2626",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FEF2F2")
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
      </nav>
      <main>{children}</main>
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
        background: isActive ? "#EEF2FF" : "none",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        color: isActive ? "#4F46E5" : "#374151",
        textAlign: "left",
        fontWeight: isActive ? "500" : "400",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "#F9FAFB";
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
