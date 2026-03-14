
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: "::",
        port: 8080,
        proxy: {
            "/api/auth": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
            "/api/stocks": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
            "/api": {
                target: "http://localhost:9000",
                changeOrigin: true,
            },
        },
    },
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
