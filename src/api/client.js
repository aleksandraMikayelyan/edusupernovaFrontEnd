/**
 * api/client.js — Axios instance (single source of truth for HTTP)
 *
 * SOLID:
 *   SRP  — only responsible for creating/configuring the axios instance
 *   DIP  — all other modules depend on this abstraction, not on axios directly
 *
 * Token is held in module-level memory (not localStorage).
 * AuthContext calls setAuthToken() after login/register and on logout.
 * On page refresh _token resets to null → user must re-authenticate.
 */

import axios from "axios";

// ── In-memory token (never localStorage) ─────────────────────────────────────
let _token = null;

/** Called by AuthContext whenever the token changes (set or cleared). */
export const setAuthToken = (token) => { _token = token; };

// ─────────────────────────────────────────────────────────────────────────────

// In dev: Vite proxy forwards /api → localhost:8080 (no env var needed)
// In prod: set VITE_API_URL=https://your-backend.com in Vercel env settings
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach JWT automatically ─────────────────────────
client.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

// ── Response interceptor — extract ApiErrorDTO.message, handle 401 ─────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Extract the human-readable message from ApiErrorDTO
    const message =
      err.response?.data?.message ||
      err.response?.data?.error   ||
      (err.response ? `Server error ${err.response.status}` : "Network error");

    if (err.response?.status === 401) {
      _token = null;
      localStorage.removeItem("edu_session");
      window.location.href = "/";
    }

    // Re-throw as a plain Error so components just use err.message
    const error    = new Error(message);
    error.status   = err.response?.status;
    error.data     = err.response?.data;
    return Promise.reject(error);
  }
);

export default client;
