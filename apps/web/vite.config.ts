import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@nexabiz/types": path.resolve(__dirname, "../../packages/types/src"),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/ws": {
          target: env.VITE_WS_URL || "ws://localhost:8000",
          ws: true,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: mode !== "production",
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react":  ["react", "react-dom", "react-router-dom"],
            "vendor-state":  ["@reduxjs/toolkit", "react-redux", "@tanstack/react-query"],
            "vendor-forms":  ["react-hook-form", "zod", "@hookform/resolvers"],
            "vendor-charts": ["recharts", "d3"],
            "vendor-ui":     ["lucide-react", "clsx", "tailwind-merge"],
            "vendor-dates":  ["date-fns"],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        reporter: ["text", "json", "html"],
        exclude: ["node_modules/", "src/test/"],
      },
    },
  }
})
