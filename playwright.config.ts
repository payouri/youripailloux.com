import { execSync } from "node:child_process";
import { defineConfig } from "@playwright/test";

/**
 * The harness: build the site from FIXTURE content (never real content) into
 * dist-test, serve that static output, and drive it with Chromium.
 */
const PORT = 4399;

// Build at config load so the page list the specs enumerate matches the output.
// Workers re-load this config, so only the main process builds.
if (process.env.TEST_WORKER_INDEX === undefined) {
  execSync("pnpm exec astro build", {
    stdio: "inherit",
    env: { ...process.env, CONTENT_DIR: "tests/fixtures/content", OUT_DIR: "dist-test", NOINDEX: "true" },
  });
}

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: `node tests/serve.mjs dist-test ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
});
