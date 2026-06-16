import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env file based on the current `mode` (development, production, etc.)
  // process.cwd() tells Vite to look for the .env file in your root directory
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          // Access the loaded variable using env.VARIABLE_NAME
          target: env.VITE_API_BASE_URL || "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  };
});
