import { expect, test } from "@playwright/test";
import { builtPages } from "./pages";

test("with noindex on, robots.txt disallows all", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toMatch(/User-agent: \*/);
  expect(body).toMatch(/^Disallow: \/$/m);
  expect(body).not.toMatch(/^Allow:/m);
});

for (const url of builtPages()) {
  test(`with noindex on, ${url} carries noindex`, async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
}
