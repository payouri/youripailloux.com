/** Pure rules for the proof collection: rank order, page set, "next" chain. */

export type Support = "platform" | "dx";
export type Kind = "case-study" | "tool" | "shelf";

export interface ProofBase {
  kind: Kind;
  rank: number;
  title: string;
  summary: string;
  support: Support;
  redactions: Record<string, string>;
}
export interface PageFields {
  slug: string;
  context: { employer: string; year: number };
  attribution: string;
}
export type CaseStudy = ProofBase & PageFields & { kind: "case-study" };
export type Tool = ProofBase &
  PageFields & {
    kind: "tool";
    friction: string;
    users: string;
    repo: string;
    adrs: { title: string; href: string }[];
  };
export type Shelf = ProofBase & { kind: "shelf"; href: string; path: string };
export type ProofData = CaseStudy | Tool | Shelf;
export type PageData = CaseStudy | Tool;

export const supportLabel: Record<Support, string> = {
  platform: "Builds and operates the platform underneath",
  dx: "Runs DX like a product",
};

/** Slugs that belong to the site itself. */
const reserved = new Set(["index", "404", "robots.txt", "blog", "_astro"]);

export const isPage = (e: ProofData): e is PageData => e.kind !== "shelf";

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
