import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: { viewport: { width: 1440, height: 1000 } },
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://127.0.0.1:5173/afterdrop/",
    reuseExistingServer: !process.env.CI,
  },
});
