import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
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
  plugins: [react(), babel({ presets: [reactCompilerPreset(), tailwindcss()] })],
});
