import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Static output only (ADR 0001): no adapter, no client router, no framework runtime.
// OUT_DIR lets the test build live beside the real one.
export default defineConfig({
  output: "static",
  outDir: process.env.OUT_DIR || "dist",
  site: "https://youripailloux.com",
  vite: { plugins: [tailwindcss()] },
});
