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
import useAuth from "./hooks/useAuth.js";

// ── Public screens ────────────────────────────────────────────────────────────
import Home      from "./screens/Home.jsx";
import LogIn     from "./screens/LogIn.jsx";
import Register  from "./screens/Register.jsx";

// ── Student screens ───────────────────────────────────────────────────────────
import UserInterface from "./screens/UserInterface.jsx";
import Units         from "./screens/Units.jsx";
import Test          from "./screens/Test.jsx";
import FeedbackPage  from "./screens/FeedbackPage.jsx";

// ── Admin screens ─────────────────────────────────────────────────────────────
import AdminInterface from "./screens/AdminInterface.jsx";

// ─── Auth guard ───────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/courses" replace />;

  return children;
};

// ─── Routes (must be inside AuthProvider) ────────────────────────────────────

const AppRoutes = () => (
  <Routes>

    {/* ── Public ── */}
    <Route path="/"         element={<Home />} />
    <Route path="/login"    element={<LogIn />} />
    <Route path="/register" element={<Register />} />

    {/* ── Student (protected) ── */}
    <Route path="/courses"  element={<ProtectedRoute><UserInterface /></ProtectedRoute>} />
    <Route path="/units"    element={<ProtectedRoute><Units /></ProtectedRoute>} />
    <Route path="/test"     element={<ProtectedRoute><Test /></ProtectedRoute>} />
    <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />

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
