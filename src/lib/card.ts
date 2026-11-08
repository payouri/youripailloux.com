/**
 * Link-preview cards (DESIGN.md "Link-preview card"): 1200x630, light, Atkinson,
 * rendered at build time with Satori and resvg from the self-hosted font files.
 * Satori limits: flexbox only (no grid), every multi-child div is `display:flex`,
 * icons are inline SVG, colours are hex (no oklch).
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { supportLabel, type PageData, type Support } from "./proof";
import { CHILI_HEX } from "./palette";
import type { Site } from "./site";

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

/** The light palette from DESIGN.md, as sRGB hex. */
const c = {
  paper: "#fdf9f9", ink: "#1e1615", muted: "#59504f", faint: "#6c6463", rule: "#e4dedd", chili: CHILI_HEX,
};

export interface CardData {
  title: string;
  summary: string;
  /** Absent on home: the claim has no single support. */
  support?: Support;
  byline: string;
}

export const cardPath = (slug: string) => `/og/${slug}.png`;
export const homeCardPath = "/og/home.png";

export function pageCard(entry: PageData, site: Site): CardData {
  return { title: entry.title, summary: entry.summary, support: entry.support, byline: `${site.name} · ${site.role}` };
}
export function homeCard(site: Site): CardData {
  return { title: site.role, summary: site.claim.layer1, byline: site.name };
}

const iconPaths: Record<string, string[]> = {
  layers: ["M3 16.5 12 21l9-4.5", "M3 12.5 12 17l9-4.5", "M12 3 3 7.5 12 12l9-4.5z"],
  loop: ["M20 12a8 8 0 0 1-14 5.3", "M4 12a8 8 0 0 1 14-5.3", "M18.5 3v4h-4", "M5.5 21v-4h4"],
};
const iconFor = (s: Support) => (s === "platform" ? "layers" : "loop");

let fonts: { name: string; data: Buffer; weight: 400 | 700; style: "normal" }[] | undefined;
function loadFonts() {
  // Satori reads ttf/otf/woff, not woff2: use the .woff files shipped beside the woff2 the pages preload.
  const dir = createRequire(import.meta.url).resolve("@fontsource/atkinson-hyperlegible-next/package.json").replace(/package\.json$/, "files/");
  return (fonts ??= ([400, 700] as const).map((weight) => ({
    name: "Atkinson Hyperlegible Next",
    data: readFileSync(`${dir}atkinson-hyperlegible-next-latin-${weight}-normal.woff`),
    weight,
    style: "normal" as const,
  })));
}

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, props: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
});
const row = (style: Record<string, unknown>, ...children: unknown[]) =>
  el("div", { style: { display: "flex", ...style } }, ...children);

function icon(name: string) {
  return el("svg", {
    width: 36, height: 36, viewBox: "0 0 24 24", fill: "none", stroke: c.muted,
    "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round",
  }, ...iconPaths[name].map((d) => el("path", { d })));
}

/** The ✓ is not in the Latin font subset, so it is drawn as inline SVG. */
function check() {
  return el("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: c.faint, "stroke-width": 2.4, "stroke-linecap": "round", "stroke-linejoin": "round", style: { marginLeft: 8 } },
    el("path", { d: "m5 12.5 4.5 4.5L19 7.5" }));
}

export function cardTree(d: CardData): Node {
  const long = d.title.length > 40;
  return row(
    { width: CARD_WIDTH, height: CARD_HEIGHT, background: c.paper, color: c.ink, flexDirection: "column", padding: "64px 80px", fontFamily: "Atkinson Hyperlegible Next" },
    row({ alignItems: "center", fontSize: 26, fontWeight: 700, color: c.muted },
      row({ width: 14, height: 14, borderRadius: 7, background: c.chili, marginRight: 14 }),
      "youripailloux.com"),
    row({ flexDirection: "column", justifyContent: "center", width: 1040, height: 400 },
      d.support
        ? row({ alignItems: "center", marginBottom: 24, fontSize: 24, fontWeight: 700, color: c.muted },
            icon(iconFor(d.support)), row({ marginLeft: 14 }, supportLabel[d.support]))
        : null,
      row({ fontSize: long ? 60 : 76, fontWeight: 700, lineHeight: 1.06, letterSpacing: -2, marginBottom: 28, width: 1040 }, d.title),
      row({ fontSize: 30, lineHeight: 1.45, color: c.muted, width: 1040 }, d.summary.length > 170 ? `${d.summary.slice(0, 167).trimEnd()}…` : d.summary)),
    row({ width: 1040, justifyContent: "space-between", alignItems: "center", borderTop: `2px solid ${c.rule}`, paddingTop: 24, fontSize: 26, fontWeight: 700 },
      row({}, d.byline),
      row({ color: c.faint, alignItems: "center" }, ...["build", "test", "deploy"].map((w, i) => row({ alignItems: "center", marginLeft: i ? 24 : 0 }, w, check())))),
  );
}

/** Renders a card to a 1200x630 PNG. */
export async function renderCard(d: CardData): Promise<Uint8Array> {
  const svg = await satori(cardTree(d) as never, { width: CARD_WIDTH, height: CARD_HEIGHT, fonts: loadFonts() });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: CARD_WIDTH } }).render().asPng();
  return png;
}
