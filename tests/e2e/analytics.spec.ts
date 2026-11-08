import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { builtPages } from "./pages";

const site = JSON.parse(readFileSync("tests/fixtures/content/site.json", "utf8"));

type Captured = { event: string; properties: Record<string, unknown> };

/** Answer /ingest ourselves and collect every event the page sends there. Other requests to it are recorded as paths. */
async function spy(page: Page) {
  const events: Captured[] = [];
  const paths: string[] = [];
  await page.route("**/ingest/**", async (route) => {
    const req = route.request();
    paths.push(new URL(req.url()).pathname);
    const raw = req.postData() ?? "";
    let body: unknown = null;
    try { body = JSON.parse(raw); } catch {
      try { body = JSON.parse(Buffer.from(decodeURIComponent(raw.replace(/^data=/, "")), "base64").toString()); } catch {}
    }
    for (const e of ([] as Captured[]).concat((body as { batch?: Captured[] })?.batch ?? (body as Captured) ?? [])) {
      if (e && typeof e.event === "string") events.push(e);
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  return {
    events,
    paths,
    names: () => events.map((e) => e.event),
    /** Wait for an event, then give any stray extra event time to show up. */
    async settle(name: string, count = 1) {
      await expect.poll(() => events.filter((e) => e.event === name).length).toBe(count);
      await page.waitForTimeout(400);
    },
  };
}

// PostHog drops events from clients that look like automation, so present as an ordinary desktop Chrome.
test.use({ userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false });
    Object.defineProperty(Navigator.prototype, "userAgentData", { get: () => ({ brands: [{ brand: "Chromium", version: "130" }] }) });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("a page load sends one pageview with the referrer, and the console egg, and nothing else", async ({ page }) => {
  const s = await spy(page);
  await page.goto("/", { referer: "https://news.example/story" });
  await s.settle("$pageview");
  await s.settle("easter_egg_triggered");
  expect(s.names().sort()).toEqual(["$pageview", "easter_egg_triggered"]);
  expect(s.events.find((e) => e.event === "$pageview")!.properties.$referrer).toBe("https://news.example/story");
  expect(s.events.find((e) => e.event === "easter_egg_triggered")!.properties.egg).toBe("console");
});

test("email: clicking the address and the Copy button each send one event", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const s = await spy(page);
  await page.goto("/");
  await s.settle("$pageview");
  // Don't navigate to mailto:.
  await page.evaluate(() => document.querySelector("[data-email]")!.addEventListener("click", (e) => e.preventDefault()));
  await page.locator("[data-email]").click();
  await s.settle("email_contacted", 1);
  await page.getByRole("button", { name: "Copy" }).click();
  await s.settle("email_contacted", 2);
  const mail = s.events.filter((e) => e.event === "email_contacted").map((e) => e.properties.method);
  expect(mail).toEqual(["click", "copy"]);
  expect(s.names().filter((n) => n !== "$pageview" && n !== "easter_egg_triggered")).toEqual(["email_contacted", "email_contacted"]);
});

test("email: copying the selected address by hand counts once as a copy", async ({ page }) => {
  const s = await spy(page);
  await page.goto("/");
  await s.settle("$pageview");
  await page.locator("[data-email]").selectText();
  await page.keyboard.press("ControlOrMeta+c");
  await s.settle("email_contacted", 1);
  expect(s.events.find((e) => e.event === "email_contacted")!.properties.method).toBe("copy");
});

test("LinkedIn and GitHub clicks each send one event naming the profile", async ({ page }) => {
  const s = await spy(page);
  await page.goto("/");
  await s.settle("$pageview");
  // Keep the page on the site; the links point off-site.
  await page.route(/linkedin\.com|github\.com/, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
  for (const [name, href] of [["linkedin", site.linkedin], ["github", site.github]]) {
    await page.goto("/");
    await page.locator(`a[href="${href}"]`).click();
    await expect.poll(() => s.events.filter((e) => e.event === "profile_link_clicked" && e.properties.profile === name).length).toBe(1);
  }
  expect(s.events.filter((e) => e.event === "profile_link_clicked")).toHaveLength(2);
});

test("GitHub links that are not the profile (shelf rows, tool Source, ADRs) send no profile event", async ({ page }) => {
  const s = await spy(page);
  await page.route(/github\.com/, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
  for (const url of ["/", "/fixture-tool"]) {
    await page.goto(url);
    await s.settle("$pageview", url === "/" ? 1 : 2);
    const links = page.locator("a[href*='github.com']:not([data-profile])");
    expect(await links.count()).toBeGreaterThan(0);
    await links.first().click();
    await page.waitForTimeout(400);
  }
  expect(s.names()).not.toContain("profile_link_clicked");
});

test("email: a failed Copy button press is not counted", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) } });
    document.execCommand = () => false;
  });
  const s = await spy(page);
  await page.goto("/");
  await s.settle("$pageview");
  await page.getByRole("button", { name: "Copy" }).click();
  await expect(page.locator("[data-toast]")).toContainText("Couldn't copy");
  await page.waitForTimeout(400);
  expect(s.names()).not.toContain("email_contacted");
});

test("a case study sends case_study_read only once its end is reached", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 400 });
  const s = await spy(page);
  await page.goto("/fixture-dx-case");
  await s.settle("$pageview");
  expect(s.names()).not.toContain("case_study_read");
  await page.keyboard.press("PageDown");
  await page.waitForTimeout(300);
  expect(s.names()).not.toContain("case_study_read");
  await page.locator("[data-attribution]").scrollIntoViewIfNeeded();
  await s.settle("case_study_read");
  expect(s.events.find((e) => e.event === "case_study_read")!.properties.slug).toBe("fixture-dx-case");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator("[data-attribution]").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(s.names().filter((n) => n === "case_study_read")).toHaveLength(1);
});

test("the home page and a tool page never send case_study_read", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 400 });
  const s = await spy(page);
  for (const url of ["/", "/fixture-tool"]) {
    await page.goto(url);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
  }
  expect(s.names()).not.toContain("case_study_read");
});

test("easter eggs: ship and four redaction clicks each send an event naming the egg", async ({ page }) => {
  const s = await spy(page);
  await page.goto("/fixture-platform-case");
  await s.settle("$pageview");
  await page.keyboard.type("ship");
  await expect.poll(() => s.events.some((e) => e.properties.egg === "ship")).toBe(true);
  const bar = page.locator("button.redaction").first();
  for (let i = 0; i < 3; i++) await bar.click();
  await page.waitForTimeout(300);
  expect(s.events.some((e) => e.properties.egg === "redaction")).toBe(false);
  await bar.click();
  await expect.poll(() => s.events.some((e) => e.properties.egg === "redaction")).toBe(true);
});

test("no other event is ever sent, however the page is used", async ({ page }) => {
  const s = await spy(page);
  await page.goto("/fixture-dx-case");
  await s.settle("$pageview");
  await page.mouse.move(100, 100);
  await page.mouse.click(100, 100);
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("j");
  await page.keyboard.press("?");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const allowed = ["$pageview", "case_study_read", "email_contacted", "profile_link_clicked", "easter_egg_triggered"];
  expect(s.names().filter((n) => !allowed.includes(n))).toEqual([]);
  // Nothing but capture requests: no flags, no recorder, no remote config.
  expect(s.paths.filter((p) => !/^\/ingest\/(e|i\/v0\/e)\/?$/.test(p))).toEqual([]);
});

test("no cookies and no analytics storage, even after every event has fired", async ({ page, context }) => {
  const s = await spy(page);
  await page.goto("/fixture-dx-case");
  await s.settle("$pageview");
  await page.keyboard.type("ship");
  await page.locator("[data-attribution]").scrollIntoViewIfNeeded();
  await s.settle("case_study_read");
  expect(await context.cookies()).toEqual([]);
  const stored = await page.evaluate(() => {
    const keys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
    const dbs = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
    return dbs.then((d) => ({ keys, dbs: d.map((x) => x.name) }));
  });
  expect(stored.keys.filter((k) => /ph_|posthog|distinct/i.test(k))).toEqual([]);
  expect(stored.dbs.filter((n) => /ph|posthog/i.test(String(n)))).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe("");
});

test.describe("with the tracker blocked", () => {
  test("every page loads, with no page error, and its interactions work", async ({ page, context }) => {
    await context.route("**/ingest/**", (r) => r.abort());
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const url of builtPages()) {
      const res = await page.goto(url);
      expect(res?.status(), url).toBe(200);
    }
    await page.goto("/");
    await page.keyboard.press("?");
    await expect(page.locator("[data-shortcuts]")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.keyboard.type("ship");
    await expect(page.locator("[data-toast]")).toContainText("Shipped");
    await page.goto("/fixture-platform-case");
    const bar = page.locator("button.redaction").first();
    for (let i = 0; i < 4; i++) await bar.click();
    await expect(page.locator("[data-toast]")).toContainText("stays redacted");
    expect(errors).toEqual([]);
  });

  test("the tracker bundle failing to load changes nothing either", async ({ page }) => {
    await page.route("**/_astro/module.*.js", (r) => r.abort()); // the lazily loaded posthog-js chunk
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.keyboard.type("ship");
    await expect(page.locator("[data-toast]")).toContainText("Shipped");
    expect(errors).toEqual([]);
  });
});
