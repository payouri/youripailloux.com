import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { builtPages } from "./pages";

const site = JSON.parse(readFileSync("tests/fixtures/content/site.json", "utf8"));

test.describe("copy button and toast", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("copy puts the email on the clipboard and shows a confirmation toast", async ({ page }) => {
    await page.goto("/");
    const toast = page.locator("[data-toast]");
    await expect(toast).toBeHidden();
    await page.getByRole("button", { name: "Copy" }).click();
    await expect(toast).toBeVisible();
    await expect(toast).toHaveText(/Copied/);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(site.email);
    await expect(toast).toBeHidden({ timeout: 5000 });
  });
});

test("the contact block shows Youri's local time in Europe/Paris", async ({ page }) => {
  // 2026-01-15 22:30 UTC is 23:30 in Paris (CET), so it is also the night message.
  await page.clock.install({ time: new Date("2026-01-15T22:30:00Z") });
  await page.goto("/");
  await expect(page.locator("[data-clock-time]")).toHaveText("23:30");
  await expect(page.locator("[data-clock-note]")).toContainText("night");
  await page.clock.runFor(60_000);
  await expect(page.locator("[data-clock-time]")).toHaveText("23:31");
});

test("daytime has no night message, and summer time is honoured", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-07-15T10:05:00Z") }); // CEST: 12:05
  await page.goto("/");
  await expect(page.locator("[data-clock-time]")).toHaveText("12:05");
  await expect(page.locator("[data-clock-note]")).toHaveText("");
});

test("the contact block carries the shortcuts hint", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".contact__hint kbd")).toHaveText("?");
});

test("a link in the contact block's data appears on every page, home and entry pages alike", async ({ page }) => {
  expect(site.links.length).toBeGreaterThan(0);
  const pages = builtPages().filter((u) => !u.endsWith(".txt"));
  expect(pages).toContain("/");
  for (const url of pages) {
    await page.goto(url);
    for (const link of site.links) {
      await expect(
        page.locator("[data-contact-block]").getByRole("link", { name: link.label }),
        `${url} shows ${link.label}`,
      ).toHaveAttribute("href", link.href);
    }
  }
});
