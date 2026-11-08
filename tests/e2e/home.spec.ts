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
  expect(scripts).toEqual([]);
});
