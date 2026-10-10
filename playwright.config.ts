import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./browser-tests",
  use: {
    baseURL: "http://127.0.0.1:3001",
    headless: true,
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: true,
  },
});
