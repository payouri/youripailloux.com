import assert from "node:assert/strict";
import { test } from "node:test";
import { hitCounter, isTypingTarget, sequenceMatcher, stepIndex } from "../../src/lib/keys.ts";

test("typing targets are inputs, textareas, selects and contenteditable", () => {
  for (const tagName of ["INPUT", "TEXTAREA", "SELECT"]) assert.equal(isTypingTarget({ tagName }), true);
  assert.equal(isTypingTarget({ tagName: "DIV", isContentEditable: true }), true);
  assert.equal(isTypingTarget({ tagName: "A" }), false);
  assert.equal(isTypingTarget({ tagName: "BODY" }), false);
  assert.equal(isTypingTarget(null), false);
});

test("stepIndex moves, clamps at both ends and starts sensibly from nothing", () => {
  assert.equal(stepIndex(0, 1, 3), 1);
  assert.equal(stepIndex(2, 1, 3), 2);
  assert.equal(stepIndex(0, -1, 3), 0);
  assert.equal(stepIndex(2, -1, 3), 1);
  assert.equal(stepIndex(-1, 1, 3), 0);
  assert.equal(stepIndex(-1, -1, 3), 2);
  assert.equal(stepIndex(0, 1, 0), -1);
});

test("sequenceMatcher fires when the word is typed, even after stray keys, and then rearms", () => {
  const m = sequenceMatcher("ship");
  const type = (s: string) => [...s].map((c) => m.push(c)).includes(true);
  assert.equal(type("sh"), false);
  assert.equal(type("xship"), true);
  assert.equal(type("shi"), false);
  assert.equal(type("p"), true);
  m.reset();
  assert.equal(type("SHIP"), true);
});

test("hitCounter fires on the nth hit of the same key only", () => {
  const c = hitCounter(4);
  const a = {}, b = {};
  assert.deepEqual([c.hit(a), c.hit(b), c.hit(a), c.hit(a), c.hit(a)], [false, false, false, false, true]);
  assert.equal(c.hit(a), false);
});
