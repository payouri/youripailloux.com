/** Pure rules for the proof collection: rank order, page set, "next" chain. */
import type { CollectionEntry } from "astro:content";

/** Derived from the zod schema in content.config.ts, so the two cannot drift apart. */
export type ProofData = CollectionEntry<"proof">["data"];
export type PageData = Exclude<ProofData, { kind: "shelf" }>;
export type Support = ProofData["support"];

export const supportLabel: Record<Support, string> = {
  platform: "Builds and operates the platform underneath",
  dx: "Runs DX like a product",
};

/** Slugs that belong to the site itself. */
const reserved = new Set(["index", "404", "robots.txt", "blog", "_astro"]);

export const isPage = <T extends ProofData>(e: T): e is Exclude<T, { kind: "shelf" }> => e.kind !== "shelf";

/** Published entries in rank order. Ranks and slugs must be unique. */
export function ordered<T extends ProofData>(entries: readonly T[]): T[] {
  const ranks = new Set<number>();
  const slugs = new Set<string>();
  for (const e of entries) {
    if (ranks.has(e.rank)) throw new Error(`proof: duplicate rank ${e.rank} ("${e.title}")`);
    ranks.add(e.rank);
    if (isPage(e)) {
      if (reserved.has(e.slug)) throw new Error(`proof: slug "${e.slug}" is reserved`);
      if (slugs.has(e.slug)) throw new Error(`proof: duplicate slug "${e.slug}"`);
      slugs.add(e.slug);
    }
  }
  return [...entries].sort((a, b) => a.rank - b.rank);
}

/** The next page in rank order, skipping shelf items and missing ranks. Undefined on the last. */
export function nextPage(list: readonly ProofData[], current: PageData): PageData | undefined {
  const pages = list.filter(isPage);
  return pages[pages.findIndex((e) => e.slug === current.slug) + 1];
}
