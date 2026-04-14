/**
 * context/AuthContext.jsx — In-memory auth state (no localStorage)
 *
 * Token is held in React state only.
 * Page refresh = logout (by design, per AuthResponse contract).
 *
 * Provides:
 *   isAuthenticated, isAdmin, userId, username, rol
 *   saveSession(authResponse)  — call with the full AuthResponse object after login/register
 *   clearSession()             — call on logout
 */

import { createContext, useContext, useState, useCallback } from "react";
import { setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token,    setToken]    = useState(null);
  const [userId,   setUserId]   = useState(null);
  const [username, setUsername] = useState(null);
  const [rol,      setRol]      = useState(null);

  const isAuthenticated = !!token;
  const isAdmin         = rol?.trim().toUpperCase() === "ADMIN";

  /**
   * Call this with the raw AuthResponse object from the backend.
   * Reads: accessToken, rol, user.id, user.username
   */
  const saveSession = useCallback((authResponse) => {
    const { accessToken, rol: userRol, user } = authResponse;
    setToken(accessToken);
    setRol(userRol ?? "STUDENT");
    setUserId(user?.id   ?? null);
    setUsername(user?.username ?? null);
    setAuthToken(accessToken);   // tell axios interceptor
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setRol(null);
    setUserId(null);
    setUsername(null);
    setAuthToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAdmin,
      token,
      userId,
      username,
      rol,
      saveSession,
      clearSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
