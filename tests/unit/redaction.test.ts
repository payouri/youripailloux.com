import assert from "node:assert/strict";
import { test } from "node:test";
import { createHighlighter } from "shiki";
import { checkEntryRedactions, redactionTransformer } from "../../src/lib/redaction.ts";

const highlighter = await createHighlighter({ themes: ["github-light"], langs: ["yaml", "ts"] });
const render = (code: string, opts?: Parameters<typeof redactionTransformer>[0], lang = "yaml", meta = "") =>
  highlighter.codeToHtml(code, {
    lang,
    theme: "github-light",
    meta: { __raw: meta },
    transformers: [redactionTransformer(opts)],
  });

const fence = [
  "env:",
  "  TOKEN: <redacted:secret name>",
  "  HOST: <redacted:internal host>",
  "  OTHER: <redacted:secret name>",
].join("\n");

const buttons = (html: string) => [...html.matchAll(/<button [^>]*aria-label="([^"]*)"[^>]*>/g)].map((m) => m[1]);

test("a fence with markers yields one button per marker with the right aria-label", () => {
  assert.deepEqual(buttons(render(fence)), [
    "redacted: secret name",
    "redacted: internal host",
    "redacted: secret name",
  ]);
});

test("the generated count and category list match the markers", () => {
  const html = render(fence);
  assert.match(html, /data-redaction-count="3"/);
  assert.match(html, /data-redactions="\[&#x22;secret name&#x22;,&#x22;internal host&#x22;\]"/);
});

test("a marker inside a string is still a button, and the marker text never reaches the output", () => {
  const html = render('const url = "https://<redacted:internal host>/api";', undefined, "ts");
  assert.deepEqual(buttons(html), ["redacted: internal host"]);
  assert.doesNotMatch(html, /&#x3C;redacted|<redacted/);
});

test("a fence without markers has a zero count and no buttons", () => {
  const html = render("a: 1");
  assert.match(html, /data-redaction-count="0"/);
  assert.deepEqual(buttons(html), []);
});

test("a marker with an unknown category fails", () => {
  assert.throws(
    () => render(fence, { redactions: { "secret name": "x" } }),
    /no entry .*"internal host"/,
  );
});

test("known categories pass, and the fence title is exposed", () => {
  const html = render(fence, { redactions: { "secret name": "a", "internal host": "b" } }, "yaml", 'title="ci.yml"');
  assert.match(html, /data-title="ci.yml"/);
});

test("every button renders the same markup whatever the category or the removed value", () => {
  const html = render("a: <redacted:x>\nb: <redacted:a much longer category name>");
  const labels = [...html.matchAll(/<span class="redaction__label"[^>]*>([^<]*)</g)].map((m) => m[1]);
  assert.deepEqual(labels, ["redacted", "redacted"]);
});

test("an entry whose body uses a category missing from its map fails the build check", () => {
  const body = "```yaml\na: <redacted:secret name>\nb: <redacted:nope>\n```";
  assert.throws(() => checkEntryRedactions("Case", body, { "secret name": "x" }), /"Case".*"nope"/);
  assert.doesNotThrow(() => checkEntryRedactions("Case", body, { "secret name": "x", nope: "y" }));
});
