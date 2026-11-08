import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// The glob loader overwrites entries that share an id (warning only), which would hide a duplicate
// slug from ordered(). Ids must stay file-based, never derived from frontmatter.
test("the proof loader does not derive entry ids from the slug", () => {
  const src = readFileSync("src/content.config.ts", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(src, /generateId/);
});
