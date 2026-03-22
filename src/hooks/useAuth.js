/**
 * hooks/useAuth.js (WEB)
 *
 * Email is decoded from the JWT token itself (the 'sub' claim).
 * Spring Security sets the username/email as 'sub' by default.
 * This means we never need to store email separately — it's always
 * available as long as the token exists.
 */

import { useState } from "react";

const TOKEN_KEY = "edu_access_token";
const ROLE_KEY  = "edu_user_role";

// ── JWT decoder ──────────────────────────────────────────────────────────────
// Reads the payload from the middle segment of the JWT (no library needed).
// Spring Security puts the email/username as the 'sub' (subject) claim.
const decodeJwt = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
};

const getEmailFromToken = (token) => {
  if (!token) return null;
  const payload = decodeJwt(token);
  // Spring Security uses 'sub' as the subject — which is the email/username
  return payload?.sub || payload?.email || payload?.username || null;
};

// ─────────────────────────────────────────────────────────────────────────────

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem(TOKEN_KEY)
  );
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem(ROLE_KEY)?.trim().toUpperCase() === "ADMIN"
  );

  const saveSession = async (token, rol) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY,  rol ?? "STUDENT");
    setIsAuthenticated(true);
    setIsAdmin(rol?.trim().toUpperCase() === "ADMIN");
  };

  /**
   * Returns { token, rol, email } for API calls.
   * Email is decoded from JWT 'sub' claim — no separate storage needed.
   */
  const getAuthInfo = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const rol   = localStorage.getItem(ROLE_KEY);
    if (!token) return null;

    const email = getEmailFromToken(token);

    // Debug — remove once confirmed working
    console.log("getAuthInfo → email from JWT:", email);

    return { token, rol, email };
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return {
    isAuthenticated,
    isAdmin,
    saveSession,
    getAuthInfo,
    clearSession,
  };
};

export default useAuth;