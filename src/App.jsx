/**
 * App.jsx — Central router
 *
 * Route map:
 *   /              → Home       (public landing page)
 *   /login         → LogIn      (public)
 *   /register      → Register   (public)
 *   /courses       → UserInterface (protected — student dashboard)
 *   /units         → Units      (protected)
 *   /test          → Test       (protected)
 *   /feedback      → FeedbackPage (protected)
 *   /admin         → AdminInterface (protected, admin only)
 *   *              → redirect to /
 *
 * AuthProvider wraps everything so all screens share the same auth state.
 * ProtectedRoute reads from AuthContext — no more isolated useState copies.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import LoadingScreen from "./components/common/LoadingScreen.jsx";
import useAuth from "./hooks/useAuth.js";

// ── Public screens ────────────────────────────────────────────────────────────
import Home      from "./screens/auth/Home.jsx";
import LogIn     from "./screens/auth/LogIn.jsx";
import Register  from "./screens/auth/Register.jsx";

// ── Student screens ───────────────────────────────────────────────────────────
import UserInterface from "./screens/dashboard/UserInterface.jsx";
import Units         from "./screens/dashboard/Units.jsx";
import Test          from "./screens/test/Test.jsx";
import FeedbackPage     from "./screens/dashboard/FeedbackPage.jsx";
import Profile          from "./screens/dashboard/Profile.jsx";
import TestHistoryPage  from "./screens/dashboard/TestHistoryPage.jsx";
import Settings         from "./screens/dashboard/Settings.jsx";

// ── Admin screens ─────────────────────────────────────────────────────────────
import AdminInterface from "./screens/admin/AdminInterface.jsx";

// ─── Auth guards ──────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children, adminOnly = false, studentOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;  // ← was: return null
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/courses" replace />;
  if (studentOnly && isAdmin) return <Navigate to="/admin" replace />;

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;  // ← was: return null
  if (isAuthenticated) return <Navigate to={isAdmin ? "/admin" : "/courses"} replace />;

  return children;
};

// ─── Routes (must be inside AuthProvider) ────────────────────────────────────

const AppRoutes = () => (
  <Routes>

    {/* ── Public (redirect to dashboard if already logged in) ── */}
    <Route path="/"         element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
    <Route path="/login"    element={<PublicOnlyRoute><LogIn /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

    {/* ── Student (protected, admin blocked) ── */}
    <Route path="/courses"  element={<ProtectedRoute studentOnly><UserInterface /></ProtectedRoute>} />
    <Route path="/units"    element={<ProtectedRoute studentOnly><Units /></ProtectedRoute>} />
    <Route path="/test"     element={<ProtectedRoute studentOnly><Test /></ProtectedRoute>} />
    <Route path="/feedback" element={<ProtectedRoute studentOnly><FeedbackPage /></ProtectedRoute>} />
    <Route path="/profile"  element={<ProtectedRoute studentOnly><Profile /></ProtectedRoute>} />
    <Route path="/history"  element={<ProtectedRoute studentOnly><TestHistoryPage /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute studentOnly><Settings /></ProtectedRoute>} />

    {/* ── Admin (protected + role check) ── */}
    <Route path="/admin"    element={<ProtectedRoute adminOnly><AdminInterface /></ProtectedRoute>} />

    {/* ── Catch-all ── */}
    <Route path="*" element={<Navigate to="/" replace />} />

  </Routes>
);

// ─── App ──────────────────────────────────────────────────────────────────────

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
