import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { builtPages } from "./pages";

const site = JSON.parse(readFileSync("tests/fixtures/content/site.json", "utf8"));
const ORIGIN = "https://youripailloux.com";

// Every built page except the site's own non-content pages.
const pages = builtPages().filter((u) => !u.startsWith("/og/") && !u.startsWith("/portrait/") && u !== "/fixture-writing");

for (const url of pages) {
  test(`${url}: meta tags reference its own card, title and description follow the rules`, async ({ page, request }) => {
    await page.goto(url);
    const meta = (sel: string) => page.locator(sel).getAttribute("content");
    const slug = url === "/" ? "home" : url.replace(/^\/|\/$/g, "");
    const card = `${ORIGIN}/og/${slug}.png`;

    const title = await page.title();
    expect(title).toMatch(new RegExp(` — ${site.name}$`));
    const description = await meta('meta[name="description"]');
    if (url === "/") {
      expect(description).toBe(site.claim.layer1);
    } else {
      expect(description).toBe(await page.locator("[data-summary]").innerText());
    }
    expect(await meta('meta[property="og:image"]')).toBe(card);
    expect(await meta('meta[name="twitter:image"]')).toBe(card);
    expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(await meta('meta[property="og:title"]')).toBe(title);
    expect(await meta('meta[property="og:description"]')).toBe(description);

    const res = await request.get(`/og/${slug}.png`);
    expect(res.ok()).toBe(true);
    expect(res.headers()["content-type"]).toBe("image/png");
    const png = await res.body();
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
}

test("the page title is <page title> — <name>", async ({ page }) => {
  await page.goto("/fixture-dx-case");
  await expect(page).toHaveTitle(`Fixture DX case study — ${site.name}`);
});
