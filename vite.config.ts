import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { host: "0.0.0.0", port: 5195, strictPort: true },
  preview: { host: "0.0.0.0", port: 5195, strictPort: true },
  test: { environment: "node" },
});
