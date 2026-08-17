import { defineConfig, devices } from "@playwright/test";

// Runs against the production build (`astro preview`) so tests see exactly what ships,
// including the /blog/ base path and the absence of dev-only routes.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4321/blog/",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4321/blog/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
