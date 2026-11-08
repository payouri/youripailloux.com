import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = readFileSync("src/layouts/Base.astro", "utf8");

test("head script takes the intro key and media query from the script modules", () => {
  assert.doesNotMatch(base, /["']intro-played["']/);
  assert.doesNotMatch(base, /prefers-reduced-motion/);
  assert.match(base, /import \{ INTRO_KEY \} from "..\/scripts\/intro"/);
  assert.match(base, /import \{ QUERY \} from "..\/scripts\/reduced-motion"/);
  assert.match(base, /define:vars=\{\{ INTRO_KEY, QUERY \}\}/);
});

test("preloads Next 400/600/700 and Mono 400", () => {
  for (const f of [
    "atkinson-hyperlegible-next-latin-400-normal",
    "atkinson-hyperlegible-next-latin-600-normal",
    "atkinson-hyperlegible-next-latin-700-normal",
    "atkinson-hyperlegible-mono-latin-400-normal",
  ]) assert.match(base, new RegExp(f));
  assert.equal((base.match(/rel="preload"[^>]*as="font"/g) ?? []).length, 4);
});
