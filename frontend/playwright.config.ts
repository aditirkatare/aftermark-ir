import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1366, height: 768 },
    browserName: "chromium",
    channel: process.env.CI ? undefined : "msedge",
  },
  webServer: [
    {
      command: "npm run dev -- --port 5173 --strictPort",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev -- --port 5175 --strictPort",
      url: "http://127.0.0.1:5175",
      env: {
        VITE_ADAPTER: "http",
        VITE_API_BASE_URL: "http://127.0.0.1:5175/api",
      },
      reuseExistingServer: !process.env.CI,
    },
  ],
  reporter: "list",
});
