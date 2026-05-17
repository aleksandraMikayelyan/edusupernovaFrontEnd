/**
 * vite.config.js — Vite configuration for EduSupernova web
 *
 * Key settings:
 *   - React plugin with Fast Refresh
 *   - Dev server proxy → Spring Boot (localhost:8080)
 *     All /api/* calls from the frontend go to the backend without CORS issues in dev.
 *     In production, your hosting (Nginx, Vercel, etc.) handles this instead.
 *   - Build output → dist/
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // Allows: import X from "@/components/..." instead of "../../components/..."
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,    // default Vite dev port
    proxy: {
      // All /api calls forwarded to your Spring Boot backend
      "/api": {
        target:      "http://localhost:8080",
        changeOrigin: true,
        secure:       false,
      },
      // Static images served by Spring Boot (charts, diagrams, etc.)
      "/images": {
        target:      "http://localhost:8080",
        changeOrigin: true,
        secure:       false,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: true,   // useful for debugging production issues
  },
});