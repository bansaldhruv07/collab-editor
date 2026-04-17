import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import CommandPalette from "./components/CommandPalette";
import useKeyboardShortcut from "./hooks/useKeyboardShortcut";
import KeyboardShortcutsModal from "./components/KeyboardShortcutsModal";
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EditorPage = lazy(() => import("./pages/EditorPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const TrashPage = lazy(() => import("./pages/TrashPage"));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
function PageLoader() {
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
          width: "36px",
          height: "36px",
          border: "3px solid #E5E7EB",
          borderTop: "3px solid #4F46E5",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
function AppContent() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  useKeyboardShortcut('k', () => {
    setShowCommandPalette(prev => !prev);
  });
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        setShowShortcuts(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <>
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </>
  );
}
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          {}
          <ErrorBoundary fullPage>
            <BrowserRouter>
              <AppContent />
              <OfflineBanner />
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          {}
                          <ErrorBoundary>
                            <DashboardPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/document/:id"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <EditorPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <ProfilePage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <SettingsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/trash"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <TrashPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Layout>
            </BrowserRouter>
          </ErrorBoundary>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
export default App;