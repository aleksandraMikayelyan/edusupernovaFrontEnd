import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setAuthToken } from "../api/client.js";

const SESSION_KEY      = "edu_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token,     setToken]     = useState(null);
  const [userId,    setUserId]    = useState(null);
  const [username,  setUsername]  = useState(null);
  const [email,     setEmail]     = useState(null);
  const [rol,       setRol]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token;
  const isAdmin         = rol?.trim().toUpperCase() === "ADMIN";

 useEffect(() => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      const { accessToken, rol: userRol, userId: uid, username: uname, email: storedEmail, loginAt } = JSON.parse(saved);
      if (loginAt && Date.now() - loginAt > SESSION_DURATION) {
        localStorage.removeItem(SESSION_KEY);
      } else if (accessToken) {
        setToken(accessToken);
        setRol(userRol ?? "STUDENT");
        setUserId(uid ?? null);
        setUsername(uname ?? null);
        setEmail(storedEmail ?? null);
        setAuthToken(accessToken);
      }
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
  } finally {
    setIsLoading(false);
  }
}, []);

const saveSession = useCallback((authResponse) => {
  const { accessToken, rol: userRol, user } = authResponse;
  setToken(accessToken);
  setRol(userRol ?? "STUDENT");
  setUserId(user?.id       ?? null);
  setUsername(user?.username ?? null);
  setEmail(user?.email     ?? null);
  setAuthToken(accessToken);
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    accessToken,
    rol:      userRol          ?? "STUDENT",
    userId:   user?.id         ?? null,
    username: user?.username   ?? null,
    email:    user?.email      ?? null,
    loginAt:  Date.now(),
  }));
}, []);

const clearSession = useCallback(() => {
  setToken(null);
  setRol(null);
  setUserId(null);
  setUsername(null);
  setEmail(null);
  setAuthToken(null);
  localStorage.removeItem(SESSION_KEY);  // ← changed
}, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAdmin,
      isLoading,
      token,
      userId,
      username,
      email,
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
