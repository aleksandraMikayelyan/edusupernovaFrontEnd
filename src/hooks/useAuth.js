/**
 * hooks/useAuth.js — thin re-export for backwards compatibility.
 *
 * All auth state now lives in AuthContext (in-memory, no localStorage).
 * Import from here OR directly from context/AuthContext — both work.
 */

export { useAuth as default, useAuth } from "../context/AuthContext.jsx";
