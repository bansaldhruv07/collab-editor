import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";


function LoginPage() {
  return <div style={{ padding: "2rem" }}>Login Page — coming soon</div>;
}

function RegisterPage() {
  return <div style={{ padding: "2rem" }}>Register Page — coming soon</div>;
}

function DashboardPage() {
  return <div style={{ padding: "2rem" }}>Dashboard — coming soon</div>;
}

function EditorPage() {
  return <div style={{ padding: "2rem" }}>Editor — coming soon</div>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/:id"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
