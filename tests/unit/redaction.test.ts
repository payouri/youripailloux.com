import assert from "node:assert/strict";
import { test } from "node:test";
import { createHighlighter } from "shiki";
import { checkEntryRedactions, redactionTransformer } from "../../src/lib/redaction.ts";

const highlighter = await createHighlighter({
  themes: ["github-light"],
  langs: ["yaml", "ts", "json", "python", "sql", "hcl"],
});
const render = (code: string, lang = "yaml", meta = "") =>
  highlighter.codeToHtml(code, {
    lang,
    theme: "github-light",
    meta: { __raw: meta },
    transformers: [redactionTransformer()],
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
  const html = render('const url = "https://<redacted:internal host>/api";', "ts");
  assert.deepEqual(buttons(html), ["redacted: internal host"]);
  assert.doesNotMatch(html, /&#x3C;redacted|<redacted/);
});

test("a fence without markers has a zero count and no buttons", () => {
  const html = render("a: 1");
  assert.match(html, /data-redaction-count="0"/);
  assert.deepEqual(buttons(html), []);
});

const bare = [
  ["json", '{"port": <redacted:port>, "ids": [<redacted:id>, <redacted:id>]}'],
  ["ts", "const port = <redacted:port>;\nconst ids = [<redacted:id>, <redacted:id>];"],
  ["python", "port = <redacted:port>\nids = [<redacted:id>, <redacted:id>]"],
  ["sql", "SELECT * FROM <redacted:port> WHERE id IN (<redacted:id>, <redacted:id>)"],
  ["hcl", 'port = <redacted:port>\nids = [<redacted:id>, <redacted:id>]'],
] as const;

for (const [lang, code] of bare) {
  test(`a bare marker in ${lang} is a button even where the grammar splits its stand-in`, () => {
    const html = render(code, lang);
    assert.deepEqual(buttons(html), ["redacted: port", "redacted: id", "redacted: id"]);
    assert.doesNotMatch(html, /[\uE000\uE001]/);
    assert.doesNotMatch(html, />\d<\/span>/);
  });
}

test("the fence title is exposed", () => {
  const html = render(fence, "yaml", 'title="ci.yml"');
  assert.match(html, /data-title="ci.yml"/);
});

test("every button renders the same markup whatever the category or the removed value", () => {
  const html = render("a: <redacted:x>\nb: <redacted:a much longer category name>");
  const labels = [...html.matchAll(/<span class="redaction__label"[^>]*>([^<]*)</g)].map((m) => m[1]);
  assert.deepEqual(labels, ["redacted", "redacted"]);
});

test("an entry whose body uses a category missing from its map fails the build check (the only category guard)", () => {
  const body = "```yaml\na: <redacted:secret name>\nb: <redacted:nope>\n```";
  assert.throws(() => checkEntryRedactions("Case", body, { "secret name": "x" }), /"Case".*"nope"/);
  assert.doesNotThrow(() => checkEntryRedactions("Case", body, { "secret name": "x", nope: "y" }));
});
