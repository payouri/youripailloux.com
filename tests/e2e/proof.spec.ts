import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const site = JSON.parse(readFileSync("tests/fixtures/content/site.json", "utf8"));
const dir = "tests/fixtures/content/proof";
const field = (src: string, key: string) => src.match(new RegExp(`^${key}: (.+)$`, "m"))?.[1];
const entries = readdirSync(dir)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => readFileSync(join(dir, f), "utf8"))
  .map((src) => ({
    kind: field(src, "kind")!,
    rank: Number(field(src, "rank")),
    slug: field(src, "slug"),
    title: field(src, "title")!,
    summary: field(src, "summary")!,
    support: field(src, "support")!,
    href: field(src, "href"),
    path: field(src, "path"),
  }))
  .sort((a, b) => a.rank - b.rank);
const pages = entries.filter((e) => e.kind !== "shelf");

test("the fixtures leave a gap in the ranks", () => {
  const ranks = entries.map((e) => e.rank);
  expect(ranks.some((r, i) => i > 0 && r - ranks[i - 1] > 10)).toBe(true);
});

test("the proof list is one ranked list, case studies first, gap closed up", async ({ page }) => {
  await page.goto("/");
  const rows = page.locator("[data-proof-list] li");
  await expect(rows).toHaveCount(entries.length);
  expect(await rows.evaluateAll((els) => els.map((e) => e.getAttribute("data-kind")))).toEqual(
    entries.map((e) => e.kind),
  );
  await expect(page.locator("[data-proof-list] ol, [data-proof-list] h2, [data-proof-list] h3")).toHaveCount(0);
  const hrefs = await rows.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs).toEqual(entries.map((e) => (e.kind === "shelf" ? e.href : `/${e.slug}`)));
});

test("the proof list shows the summary and the icon for each kind", async ({ page }) => {
  await page.goto("/");
  for (const e of entries) {
    const row = page.locator("[data-proof-list] li", { hasText: e.summary });
    await expect(row).toHaveCount(1);
    const icon = e.kind === "tool" ? "package" : e.kind === "shelf" ? "file" : e.support === "platform" ? "layers" : "loop";
    await expect(row.locator(`svg[data-icon="${icon}"]`)).toHaveCount(1);
    if (e.kind === "shelf") await expect(row).toContainText(e.path!);
  }
});

test("rank is never displayed", async ({ page }) => {
  await page.goto("/");
  const text = await page.locator("[data-proof-list]").innerText();
  for (const e of entries) expect(text).not.toContain(String(e.rank));
});

for (const [i, e] of pages.entries()) {
  test(`/${e.slug} starts with the byline, shows the summary once at the top, and ends with the contact block`, async ({ page }) => {
    await page.goto(`/${e.slug}`);
    await expect(page.locator("main > :first-child")).toHaveAttribute("href", "/");
    await expect(page.locator("main > a.byline [data-byline]")).toHaveText(`${site.name} · ${site.role}`);
    await expect(page.locator("h1")).toHaveText(e.title);
    await expect(page.locator("[data-summary]")).toHaveText(e.summary);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", e.summary);
    await expect(page.locator("[data-context]")).toHaveText(/· \d{4}$/);
    await expect(page.locator("[data-attribution]")).toBeVisible();
    await expect(page.locator("body > :not(script)").last()).toHaveAttribute("data-contact-block", "");
    const order = await page.evaluate(() => {
      const y = (s: string) => document.querySelector(s)!.getBoundingClientRect().top;
      return [y("h1"), y("[data-context]"), y("[data-summary]"), y("[data-body]"), y("[data-attribution]"), y("[data-contact-block]")];
    });
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  test(`/${e.slug} next link ${pages[i + 1] ? "skips the missing rank" : "is absent on the last entry"}`, async ({ page }) => {
    await page.goto(`/${e.slug}`);
    const next = page.locator("[data-next]");
    if (pages[i + 1]) await expect(next).toHaveAttribute("href", `/${pages[i + 1].slug}`);
    else await expect(next).toHaveCount(0);
  });
}

test("a tool page shows its friction, users, ADRs and repo", async ({ page }) => {
  await page.goto("/fixture-tool");
  const facts = page.locator("[data-tool-facts]");
  await expect(facts).toContainText("FIXTURE friction it removes.");
  await expect(facts).toContainText("FIXTURE who uses it.");
  await expect(facts.getByRole("link", { name: "FIXTURE ADR one" })).toHaveAttribute("href", /docs\/adr\/0001-one\.md$/);
  await expect(facts.getByRole("link", { name: /fixture-tool$/ })).toHaveAttribute("href", "https://github.com/pat-fixture/fixture-tool");
  await page.goto("/fixture-dx-case");
  await expect(page.locator("[data-tool-facts]")).toHaveCount(0);
});

test("shelf items have no page of their own", async ({ request }) => {
  expect((await request.get("/shelf-one")).status()).toBe(404);
});
