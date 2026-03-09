import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7030",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
