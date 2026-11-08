import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { redactionTransformer } from "./src/lib/redaction.ts";

// Static output only (ADR 0001): no adapter, no client router, no framework runtime.
// OUT_DIR lets the test build live beside the real one.
export default defineConfig({
  output: "static",
  outDir: process.env.OUT_DIR || "dist",
  site: "https://youripailloux.com",
  // Redacted artifacts (ADR 0003): markers become buttons at highlight time.
  // Each entry's categories are checked against its frontmatter map in loadProof.
  markdown: {
    // wrap: no horizontal scroll box, so a redaction tooltip is never clipped.
    shikiConfig: { theme: "css-variables", wrap: true, transformers: [redactionTransformer()] },
  },
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
});
