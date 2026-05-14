/**
 * main.jsx — Vite entry point
 *
 * Wraps the app in BrowserRouter so every component can use
 * useNavigate(), useLocation(), Link, etc.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "katex/dist/katex.min.css";
import App from "./App.jsx";
import "./index.css";   // Tailwind base styles

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);