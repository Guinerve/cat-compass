import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests", fullyParallel: false,
  use: { baseURL: "http://localhost:5195", trace: "retain-on-failure" },
  webServer: [
    { command: "npm run dev", url: "http://localhost:5195", reuseExistingServer: !process.env.CI, timeout: 30000 },
    { command: "npm run preview", url: "http://localhost:5197", reuseExistingServer: false, timeout: 30000 },
  ],
  projects: [{ name: "desktop", testMatch: "app.spec.ts", use: { ...devices["Desktop Chrome"] } }, { name: "phone", testMatch: "app.spec.ts", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } }, { name: "offline", testMatch: "offline.spec.ts", use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5197" } }],
});
