import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync("tests/fixtures/content/site.json", "utf8"));

test("home shows the byline and claim layer 1 from the site content file", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-byline]")).toHaveText(`${site.name} · ${site.role}`);
  await expect(page.locator("[data-claim-layer-1]")).toHaveText(site.claim.layer1);
  await expect(page.locator("a.byline")).toHaveAttribute("href", "/");
});

test("the home page ends with the contact block", async ({ page }) => {
  await page.goto("/");
  const last = page.locator("body > :not(script)").last();
  await expect(last).toHaveAttribute("data-contact-block", "");
  await expect(last.getByRole("link", { name: site.email })).toHaveAttribute("href", `mailto:${site.email}`);
  await expect(last.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", site.linkedin);
  await expect(last.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", site.github);
});

test("home first screen holds the claim in two separate layers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-claim-layer-1]")).toHaveText(site.claim.layer1);
  await expect(page.locator("[data-claim-layer-2]")).toHaveText(site.claim.layer2);
  expect(await page.locator("[data-claim-layer-1]").evaluate((el) => el.contains(document.querySelector("[data-claim-layer-2]")))).toBe(false);
});

test("the About shows the backstory, location and portrait after the landing", async ({ page }) => {
  await page.goto("/");
  const about = page.locator("[data-about]");
  await expect(about.locator("[data-backstory]")).toHaveText(site.about);
  await expect(about.locator("[data-backstory] a")).toHaveCount(0);
  await expect(about.locator("[data-location]")).toHaveText(site.location);
  const portrait = about.locator("[data-portrait]");
  await expect(portrait).toHaveAttribute("src", `/portrait/${site.portrait}`);
  expect(await portrait.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0 || new Promise((r) => { img.onload = () => r(true); img.onerror = () => r(false); }))).toBe(true);
  const order = await page.evaluate(() => {
    const a = document.querySelector("[data-claim-layer-1]")!, b = document.querySelector("[data-about]")!, c = document.querySelector("[data-contact-block]")!;
    return [a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING, b.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING];
  });
  expect(order.every(Boolean)).toBe(true);
});

test("fonts are self-hosted, Latin, and preloaded", async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).origin !== new URL(baseURL!).origin && !r.url().startsWith("data:")) {
      external.push(r.url());
    }
  });
  await page.goto("/");
  const preloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll((els) =>
    els.map((e) => (e as HTMLLinkElement).getAttribute("href")),
  );
  expect(preloads.length).toBeGreaterThan(0);
  for (const href of preloads) expect(href).toMatch(/^\/_astro\/.*latin-\d+-normal\..*\.woff2$/);
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => document.fonts.check('700 1rem "Atkinson Hyperlegible Next"'));
  expect(loaded).toBe(true);
  expect(external).toEqual([]);
});

test("no client router or framework runtime ships", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (r) => r.resourceType() === "script" && scripts.push(r.url()));
  await page.goto("/");
  // Only small first-party scripts (the contact block's copy, toast and clock; the shortcuts); nothing from a framework or router.
  // The analytics loader is small too; posthog-js itself is the one big script, loaded lazily as its own chunk (ADR 0004).
  for (const url of scripts) {
    expect(url).toMatch(/\/_astro\/(ContactBlock|Base|reduced-motion|analytics|module)[^/]*\.js$/);
    if (/\/_astro\/module/.test(url)) continue;
    const body = await (await page.request.get(url)).text();
    expect(body.length).toBeLessThan(4000);
    expect(body).not.toMatch(/react|vue|svelte|ClientRouter|astro:transitions/);
  }
});
