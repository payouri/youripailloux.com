import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { builtPages } from "./pages";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});


test("home: j and k move focus down and up the proof list rows", async ({ page }) => {
  await page.goto("/");
  const links = page.locator("[data-proof-list] a.row__link, [data-proof-list] a.shelf__link");
  const n = await links.count();
  expect(n).toBeGreaterThan(2);
  await page.keyboard.press("j");
  await expect(links.nth(0)).toBeFocused();
  await page.keyboard.press("j");
  await expect(links.nth(1)).toBeFocused();
  await page.keyboard.press("k");
  await expect(links.nth(0)).toBeFocused();
  await page.keyboard.press("k");
  await expect(links.nth(0)).toBeFocused();
});

test("case study: j and k move between sections", async ({ page }) => {
  await page.goto("/fixture-dx-case");
  const h2s = page.locator("[data-body] h2");
  expect(await h2s.count()).toBeGreaterThan(1);
  await page.keyboard.press("j");
  await expect(h2s.nth(0)).toBeFocused();
  await page.keyboard.press("j");
  await expect(h2s.nth(1)).toBeFocused();
  await page.keyboard.press("k");
  await expect(h2s.nth(0)).toBeFocused();
});

test("? opens the shortcuts overlay and Escape dismisses it", async ({ page }) => {
  await page.goto("/");
  const panel = page.locator("[data-shortcuts]");
  await expect(panel).toBeHidden();
  await page.keyboard.press("?");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("j");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await page.keyboard.press("?");
  await expect(panel).toBeVisible();
  await page.keyboard.press("?");
  await expect(panel).toBeHidden();
});

test("shortcuts do not fire while typing in an input", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const input = document.createElement("input");
    input.id = "probe";
    input.setAttribute("aria-label", "probe");
    document.body.append(input);
  });
  await page.locator("#probe").focus();
  await page.keyboard.type("j?ship");
  await expect(page.locator("#probe")).toBeFocused();
  await expect(page.locator("[data-shortcuts]")).toBeHidden();
  await expect(page.locator("[data-toast]")).toBeHidden();
  expect(await page.locator("#probe").inputValue()).toBe("j?ship");
});

test("typing ship shows the toast, which then goes away", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.type("ship");
  await expect(page.locator("[data-toast]")).toBeVisible();
  await expect(page.locator("[data-toast]")).toContainText("Shipped");
  await expect(page.locator("[data-toast]")).toBeHidden({ timeout: 4000 });
});

test("clicking a redaction four times makes it talk back", async ({ page }) => {
  await page.goto("/fixture-platform-case");
  const bar = page.locator("button.redaction").first();
  for (let i = 0; i < 3; i++) await bar.click();
  await expect(page.locator("[data-toast]")).toBeHidden();
  await bar.click();
  await expect(page.locator("[data-toast]")).toContainText("stays redacted");
});

test("the console greeting is logged on load", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (m) => logs.push(m.text()));
  await page.goto("/");
  await expect.poll(() => logs.join("\n")).toContain("Hello, fellow developer");
});

for (const scheme of ["light", "dark"] as const) {
  for (const url of builtPages()) {
    test(`axe: overlay open on ${url} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      await page.keyboard.press("?");
      await expect(page.locator("[data-shortcuts]")).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
