import assert from "node:assert/strict";
import { test } from "node:test";
import { activeSectionIndex } from "../../src/lib/sections.ts";

test("above the first heading, the first section is active", () => {
  assert.equal(activeSectionIndex([500, 1200, 2000], 800, 0, 4000), 0);
});

test("the last heading above the upper third is active", () => {
  assert.equal(activeSectionIndex([-900, 100, 900], 800, 1000, 4000), 1);
});

test("at the foot, the last section is active even if its heading is below the line", () => {
  assert.equal(activeSectionIndex([-1500, -400, 600], 800, 3200, 4000), 2);
});

test("for j/k, above the first heading there is no section yet", () => {
  assert.equal(activeSectionIndex([500, 1200, 2000], 800, 0, 4000, -1), -1);
});

test("for j/k, a short page at its foot still starts before the first heading", () => {
  assert.equal(activeSectionIndex([500, 700], 800, 0, 800, -1), -1);
});

test("no headings, no section", () => {
  assert.equal(activeSectionIndex([], 800, 0, 800), -1);
});
