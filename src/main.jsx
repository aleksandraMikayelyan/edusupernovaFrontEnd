/**
 * main.jsx — Vite entry point
 *
 * Wraps the app in BrowserRouter so every component can use
 * useNavigate(), useLocation(), Link, etc.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";   // Tailwind base styles

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);