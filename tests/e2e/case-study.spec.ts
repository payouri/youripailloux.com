import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { builtPages } from "./pages";

// The case-study prose layer: margin notes, ADR blocks and the section map.
const wide = { width: 1280, height: 900 };
const phone = { width: 390, height: 844 };

async function headingsAndLinks(page: Page) {
  return page.evaluate(() => {
    const h2s = [...document.querySelectorAll<HTMLElement>("[data-body] h2")];
    const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-section-link]")];
    return {
      headings: h2s.map((h) => ({ id: h.id, text: h.textContent?.trim() ?? "" })),
      links: links.map((a) => ({ href: a.getAttribute("href"), text: a.textContent?.trim() ?? "" })),
    };
  });
}

test.describe("wide viewport", () => {
  test.use({ viewport: wide });

  test("the section map lists exactly the body's h2s, and each link jumps to its heading", async ({ page }) => {
    for (const url of ["/fixture-dx-case", "/fixture-platform-case"]) {
      await page.goto(url);
      const { headings, links } = await headingsAndLinks(page);
      expect(headings.length).toBeGreaterThan(0);
      expect(links).toEqual(headings.map((h) => ({ href: `#${h.id}`, text: h.text })));
      await expect(page.locator("[data-section-map]")).toBeVisible();
      for (const h of headings) {
        await page.locator(`[data-section-link="${h.id}"]`).click();
        await expect.poll(() => page.locator(`#${h.id}`).evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
        await expect.poll(() => page.locator(`#${h.id}`).evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(120);
      }
    }
  });

  test("the section-map dot follows the section in view while scrolling", async ({ page }) => {
    await page.goto("/fixture-dx-case");
    const links = page.locator("[data-section-link]");
    const dot = page.locator("[data-section-dot]");
    const centre = (loc: ReturnType<Page["locator"]>) =>
      loc.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      });
    const expectDotOn = async (index: number) => {
      await expect(links.nth(index)).toHaveAttribute("aria-current", "location");
      await expect.poll(async () => Math.abs((await centre(dot)) - (await centre(links.nth(index))))).toBeLessThan(6);
    };
    await expectDotOn(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expectDotOn(1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expectDotOn(0);
  });

  test("margin notes sit in the right margin, clear of the text column", async ({ page }) => {
    await page.goto("/fixture-dx-case");
    const notes = page.locator("[data-margin-note]");
    await expect(notes).toHaveCount(2);
    const prose = await page.locator("[data-body]").boundingBox();
    for (const note of await notes.all()) {
      await expect(note).toBeVisible();
      expect(await note.evaluate((el) => getComputedStyle(el).float)).toBe("right");
      const box = (await note.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(prose!.x + prose!.width + 16);
      expect(box.x + box.width).toBeLessThanOrEqual(wide.width);
    }
  });

  test("the text column is 40rem with the 17px body measure", async ({ page }) => {
    await page.goto("/fixture-dx-case");
    const prose = (await page.locator("[data-body]").boundingBox())!;
    expect(prose.width).toBeLessThanOrEqual(641);
    const p = page.locator("[data-body] p").first();
    expect(await p.evaluate((el) => getComputedStyle(el).fontSize)).toBe("17px");
    expect(await p.evaluate((el) => getComputedStyle(el).lineHeight)).toBe("28.05px");
  });

  test("the body takes 1.72 line height in dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/fixture-dx-case");
    const p = page.locator("[data-body] p").first();
    expect(await p.evaluate((el) => getComputedStyle(el).lineHeight)).toBe("29.24px");
  });
});

test.describe("phone viewport", () => {
  test.use({ viewport: phone });

  test("margin notes are inline panels, and nothing is lost", async ({ page }) => {
    await page.goto("/fixture-dx-case");
    const notes = page.locator("[data-margin-note]");
    await expect(notes).toHaveCount(2);
    for (const note of await notes.all()) {
      await expect(note).toBeVisible();
      expect(await note.evaluate((el) => getComputedStyle(el).float)).toBe("none");
      const box = (await note.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(phone.width);
    }
    await expect(page.locator("[data-margin-note]").first()).toContainText("FIXTURE margin note");
    await expect(page.locator("[data-margin-note]").first()).toContainText("Where the number comes from.");
  });

  test("the section map is hidden and the page does not scroll sideways", async ({ page }) => {
    await page.goto("/fixture-dx-case");
    await expect(page.locator("[data-section-map]")).toBeHidden();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("the ADR block fits the phone width", async ({ page }) => {
    await page.goto("/fixture-platform-case");
    const adr = page.locator("[data-adr]");
    await expect(adr).toBeVisible();
    const box = (await adr.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(phone.width);
  });
});

test("an ADR block shows its number, title, status and passage", async ({ page }) => {
  await page.goto("/fixture-platform-case");
  const adr = page.locator("[data-adr]");
  await expect(adr).toHaveCount(1);
  await expect(adr.locator(".adr__number")).toHaveText("ADR 0003");
  await expect(adr.locator(".adr__title")).toHaveText("FIXTURE ADR three");
  await expect(adr.locator("[data-adr-status]")).toHaveText("Accepted");
  await expect(adr.locator("[data-adr-passage]")).toContainText("FIXTURE passage quoted from the decision record.");
});

test("the section map is generated per page from that page's h2s", async ({ page }) => {
  for (const [url, count] of [["/fixture-dx-case", 2], ["/fixture-platform-case", 2], ["/fixture-tool", 1]] as const) {
    await page.goto(url);
    await expect(page.locator("[data-section-map] [data-section-link]")).toHaveCount(count);
  }
});

for (const scheme of ["light", "dark"] as const) {
  for (const url of builtPages()) {
    test(`axe: no WCAG 2.2 AA violations on ${url} at phone width (${scheme})`, async ({ page }) => {
      await page.setViewportSize(phone);
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

// DESIGN.md "The Two Temperatures Rule" and "The Monospace Is Literal Rule": chili never
// appears inside proof, and mono is for literal code only, never for labels.
async function chiliInkColour(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-chili-ink)";
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  });
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`proof links at rest (${scheme})`, () => {
    test.use({ colorScheme: scheme });

    test("a link inside a case-study paragraph is not chili", async ({ page }) => {
      await page.goto("/fixture-dx-case");
      const chili = await chiliInkColour(page);
      const colour = await page.locator("[data-body] p").first().evaluate((p) => {
        const a = document.createElement("a");
        a.href = "https://example.com/rfc";
        a.textContent = "RFC";
        p.append(a);
        return getComputedStyle(a).color;
      });
      expect(colour).not.toBe(chili);
    });

    test("every link on a tool page is not chili", async ({ page }) => {
      await page.goto("/fixture-tool");
      const links = page.locator(".tool a");
      expect(await links.count()).toBeGreaterThan(0);
      const chili = await chiliInkColour(page);
      for (const a of await links.all()) {
        expect(await a.evaluate((el) => getComputedStyle(el).color)).not.toBe(chili);
      }
    });
  });
}

test("redaction category labels in 'What was removed' are not monospace", async ({ page }) => {
  await page.goto("/fixture-dx-case");
  const labels = page.locator("[data-removed-category]");
  await expect(labels).toHaveCount(2);
  for (const dt of await labels.all()) {
    expect(await dt.evaluate((el) => getComputedStyle(el).fontFamily)).not.toMatch(/mono/i);
  }
});
