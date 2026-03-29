import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <nav
        style={{
          background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          padding: "0 32px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: "700", fontSize: "18px", color: "#4F46E5" }}>
          📝 CollabEditor
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "#6B7280" }}>
            {user?.name}
          </span>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      <main
        style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827" }}>
            My Documents
          </h1>
          <p style={{ color: "#6B7280", marginTop: "4px" }}>
            Welcome back, {user?.name}! Your documents will appear here.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            border: "2px dashed #E5E7EB",
            borderRadius: "16px",
            padding: "60px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#374151" }}>
            No documents yet
          </h3>
          <p
            style={{ color: "#9CA3AF", marginTop: "8px", marginBottom: "24px" }}
          >
            Create your first document to get started
          </p>
          <Button>+ New Document</Button>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
