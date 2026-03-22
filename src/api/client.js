/**
 * api/client.js — Axios instance (single source of truth for HTTP)
 *
 * SOLID:
 *   SRP  — only responsible for creating/configuring the axios instance
 *   DIP  — all other modules depend on this abstraction, not on axios directly
 *
 * Auth token is injected via request interceptor so every module
 * gets it automatically — no more `const headers = { Authorization: ... }`
 * copy-pasted across every screen.
 */

import axios from "axios";

const TOKEN_KEY = "edu_access_token";

const client = axios.create({
  baseURL: "/api",         // Vite proxy forwards to Spring Boot :8080
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach JWT automatically ─────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — handle 401 globally ────────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;