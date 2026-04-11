import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";
function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return setError("Email and password are required");
    }
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F9FAFB",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📝</div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>
            Welcome back
          </h1>
          <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "4px" }}>
            Sign in to your documents
          </p>
        </div>
        <Alert message={error} type="error" />
        <form onSubmit={handleSubmit}>
          <Input
            label="Email address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
          />
          <Button type="submit" loading={loading} fullWidth>
            Sign in
          </Button>
        </form>
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "14px",
            color: "#6B7280",
          }}
        >
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#4F46E5", fontWeight: "500" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
export default LoginPage;
