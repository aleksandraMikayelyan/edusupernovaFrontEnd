import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setAuthToken } from "../api/client.js";

const SESSION_KEY = "edu_session";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token,     setToken]     = useState(null);
  const [userId,    setUserId]    = useState(null);
  const [username,  setUsername]  = useState(null);
  const [rol,       setRol]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token;
  const isAdmin         = rol?.trim().toUpperCase() === "ADMIN";

  // Rehydrate session from sessionStorage on every page load / refresh
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const { accessToken, rol: userRol, userId: uid, username: uname } = JSON.parse(saved);
        if (accessToken) {
          setToken(accessToken);
          setRol(userRol ?? "STUDENT");
          setUserId(uid ?? null);
          setUsername(uname ?? null);
          setAuthToken(accessToken);
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = useCallback((authResponse) => {
    const { accessToken, rol: userRol, user } = authResponse;
    setToken(accessToken);
    setRol(userRol ?? "STUDENT");
    setUserId(user?.id   ?? null);
    setUsername(user?.username ?? null);
    setAuthToken(accessToken);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      accessToken,
      rol:      userRol      ?? "STUDENT",
      userId:   user?.id     ?? null,
      username: user?.username ?? null,
    }));
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setRol(null);
    setUserId(null);
    setUsername(null);
    setAuthToken(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAdmin,
      isLoading,
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
