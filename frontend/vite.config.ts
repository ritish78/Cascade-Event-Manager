import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://eventmanagementbackend:5000",
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
