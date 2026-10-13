import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [react(), VitePWA({
    registerType: "prompt", injectRegister: false,
    includeAssets: ["icon-192.png", "icon-512.png"],
    manifest: { name: "Cat Compass", short_name: "Cat Compass", description: "Feeding plans, health notes, weights and reminders for your cat. Records stay on your device.", theme_color: "#246653", background_color: "#f7f6f2", display: "standalone", start_url: "./", scope: "./", icons: [{ src: "icon-192.png", sizes: "192x192", type: "image/png" }, { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }] },
    workbox: { globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"], navigateFallback: "index.html", cleanupOutdatedCaches: true },
  })],
  server: { host: "0.0.0.0", port: 5195, strictPort: true },
  preview: { host: "0.0.0.0", port: 5197, strictPort: true },
  test: { environment: "node", exclude: ["node_modules/**", "dist/**", "release/**", "tests/**"] },
});
