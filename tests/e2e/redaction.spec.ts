import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "tests/fixtures/content/proof";

/** What the fixtures say: for each page, its markers (in order) and its `redactions` map. */
const fixtures = readdirSync(dir)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => readFileSync(join(dir, f), "utf8"))
  .map((src) => {
    const slug = src.match(/^slug: (.+)$/m)?.[1];
    const front = src.split("---")[1];
    const map: Record<string, string> = {};
    const block = front.match(/^redactions:\n((?:  .+\n?)+)/m)?.[1] ?? "";
    for (const line of block.split("\n")) {
      const m = line.match(/^ {2}([^:]+): (.+)$/);
      if (m) map[m[1]] = m[2];
    }
    const fences = [...src.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => [...m[1].matchAll(/<redacted:([^>]+)>/g)].map((x) => x[1]));
    return { slug, map, fences };
  })
  .filter((f) => f.slug && f.fences.some((m) => m.length));

test("fixtures use at least three redaction categories inside code documents", () => {
  const used = new Set(fixtures.flatMap((f) => f.fences.flat()));
  expect(used.size).toBeGreaterThanOrEqual(3);
});

for (const fx of fixtures) {
  test.describe(`code documents on /${fx.slug}`, () => {
    test("each redaction is a focusable button labelled with its category", async ({ page }) => {
      await page.goto(`/${fx.slug}`);
      const labels = await page.locator("[data-code-doc] button.redaction").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
      expect(labels).toEqual(fx.fences.flat().map((c) => `redacted: ${c}`));
      for (const b of await page.locator("button.redaction").all()) {
        await b.focus();
        await expect(b).toBeFocused();
      }
    });

    test("every redaction has the same fixed width", async ({ page }) => {
      await page.goto(`/${fx.slug}`);
      const widths = await page.locator("button.redaction").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
      expect(widths.length).toBeGreaterThan(0);
      expect(new Set(widths.map((w) => Math.round(w * 10) / 10)).size).toBe(1);
    });

    test("hover and focus show the redaction category", async ({ page }) => {
      await page.goto(`/${fx.slug}`);
      const first = page.locator("button.redaction").first();
      const category = fx.fences.flat()[0];
      await expect(first.locator(".redaction__tip")).toBeHidden();
      await first.hover();
      await expect(first.locator(".redaction__tip")).toBeVisible();
      await expect(first.locator(".redaction__tip")).toHaveText(category);
      await page.mouse.move(0, 0);
      await expect(first.locator(".redaction__tip")).toBeHidden();
      await first.focus();
      await expect(first.locator(".redaction__tip")).toBeVisible();
    });

    test("header count and What was removed panel match the markers and the map", async ({ page }) => {
      await page.goto(`/${fx.slug}`);
      const docs = page.locator("[data-code-doc]");
      await expect(docs).toHaveCount(fx.fences.length);
      for (const [i, markers] of fx.fences.entries()) {
        const doc = docs.nth(i);
        await expect(doc.locator("[data-code-meta]")).toContainText("versions stripped");
        await expect(doc.locator("[data-code-meta]")).toContainText(`${markers.length} ${markers.length === 1 ? "value" : "values"} redacted`);
        const categories = [...new Set(markers)];
        await expect(doc.locator("[data-removed-category]")).toHaveText(categories);
        await expect(doc.locator(".code-doc__removed dd")).toHaveText(categories.map((c) => fx.map[c]));
        await expect(doc.locator(".code-doc__removed h3")).toHaveText("What was removed");
      }
    });
  });
}
