import { expect, test } from "@playwright/test";

const intro = "[data-intro-layer]";
const introShown = (page: import("@playwright/test").Page) =>
  page.locator(intro).evaluate((el) => getComputedStyle(el).display !== "none");

test("reduced motion: no intro, every revealed element in its final state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await introShown(page)).toBe(false);
  expect(await page.evaluate(() => document.documentElement.dataset.intro)).toBe("done");
  const targets = page.locator("[data-reveal]");
  expect(await targets.count()).toBeGreaterThan(0);
  for (const el of await targets.all()) {
    await expect(el).toHaveAttribute("data-revealed", "");
    expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(await el.evaluate((n) => getComputedStyle(n).transform)).toBe("none");
  }
});

test("the intro plays on first load and not on a second load in the same session", async ({ page }) => {
  await page.goto("/");
  expect(await introShown(page)).toBe(true);
  await expect(page.locator(intro)).toBeHidden({ timeout: 4000 });
  expect(await page.evaluate(() => sessionStorage.getItem("intro-played"))).toBe("1");
  await page.reload();
  expect(await introShown(page)).toBe(false);
});

test("any key skips the intro", async ({ page }) => {
  await page.goto("/");
  expect(await introShown(page)).toBe(true);
  await page.keyboard.press("x");
  await expect(page.locator(intro)).toBeHidden({ timeout: 1500 });
});

test("any click skips the intro", async ({ page }) => {
  await page.goto("/");
  expect(await introShown(page)).toBe(true);
  await page.mouse.click(10, 10);
  await expect(page.locator(intro)).toBeHidden({ timeout: 1500 });
});

test("reveals release as elements scroll into view", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("x");
  const row = page.locator(".row, .shelf").first();
  await expect(row).toHaveAttribute("data-revealed", "", { timeout: 4000 });
  await expect(row).toHaveCSS("opacity", "1", { timeout: 2000 });
});

test("proof-list titles and entry titles share a view-transition-name", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const row = page.locator(".row").first();
  const name = await row.locator(".row__title").evaluate((el) => getComputedStyle(el).getPropertyValue("view-transition-name"));
  expect(name).toMatch(/^title-/);
  await row.locator("a").click(); // a real page load: navigation works with or without View Transitions
  await expect(page.locator(".case__title")).toBeVisible();
  const entry = await page.locator(".case__title").evaluate((el) => getComputedStyle(el).getPropertyValue("view-transition-name"));
  expect(entry).toBe(name);
});

test("the built CSS opts in to cross-document view transitions", async ({ page }) => {
  await page.goto("/");
  const css = await page.evaluate(async () => {
    const hrefs = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((l) => l.href);
    return (await Promise.all(hrefs.map((h) => fetch(h).then((r) => r.text())))).join("\n");
  });
  expect(css).toMatch(/@view-transition\s*{\s*navigation:\s*auto/);
});

test("every interactive element shows a visible focus indicator", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const url of ["/", (await page.goto("/").then(() => page.locator(".row__link").first().getAttribute("href")))!]) {
    await page.goto(url);
    const count = await page.locator("a[href], button").count();
    for (let i = 0; i < count; i++) {
      await page.keyboard.press("Tab");
      const style = await page.evaluate(() => {
        const cs = getComputedStyle(document.activeElement!);
        return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
      });
      expect(style.style, `focus stop ${i} on ${url}`).not.toBe("none");
      expect(style.width).toBeGreaterThanOrEqual(2);
    }
  }
});
