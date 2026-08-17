import { defineConfig, devices } from "@playwright/test";

// Runs against the production build (`astro preview`) on a dedicated port (4322) so a running
// `astro dev` on 4321 is never reused; tests see exactly what ships, including the /blog/ base
// path and the absence of dev-only routes. In CI `dist/` already exists from the build step.
const PORT = 4322;
const URL = `http://localhost:${PORT}/blog/`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.CI
      ? `npm run preview -- --port ${PORT}`
      : `npm run build && npm run preview -- --port ${PORT}`,
    url: URL,
    // `astro preview` daemonizes when it detects an AI-agent environment; this env var forces the
    // foreground server so Playwright owns the process (otherwise it reports "exited early").
    env: { ASTRO_PREVIEW_BACKGROUND: "1" },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
