import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import { useToast } from "../components/Toast";
import Button from "../components/Button";
import Input from "../components/Input";
function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    return newErrors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (formData.name === user.name && formData.email === user.email) {
      addToast("No changes to save", "info");
      return;
    }
    try {
      setLoading(true);
      const updated = await userService.updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      });
      updateUser({ name: updated.name, email: updated.email });
      addToast("Profile updated successfully", "success");
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>
          Profile
        </h1>
        <p style={{ color: "#6B7280", marginTop: "4px" }}>
          Manage your personal information
        </p>
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#4F46E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            fontWeight: "700",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {user?.name
            ?.split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <div>
          <p style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>
            {user?.name}
          </p>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "2px" }}>
            Member since {memberSince}
          </p>
        </div>
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "20px",
          }}
        >
          Personal information
        </h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            error={errors.name}
          />
          <Input
            label="Email address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            error={errors.email}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "8px",
            }}
          >
            <Button type="submit" loading={loading}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ProfilePage;