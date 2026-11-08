import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { contentDir } from "./lib/config";

const base = {
  /** Orders the list and the "next" chain. Never displayed. */
  rank: z.number().int(),
  title: z.string().min(1),
  /** Written once: proof list, top of the page, link-preview description. */
  summary: z.string().min(1),
  support: z.enum(["platform", "dx"]),
  /** Redaction category -> one-line explanation. */
  redactions: z.record(z.string(), z.string()).default({}),
};

const page = {
  /** From frontmatter, never from the title. Flat at the site root. */
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase words joined by hyphens"),
  context: z.object({ employer: z.string().min(1), year: z.number().int() }).strict(),
  attribution: z.string().min(1),
};

const proofEntry = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("case-study"), ...base, ...page }).strict(),
  z
    .object({
      kind: z.literal("tool"),
      ...base,
      ...page,
      friction: z.string().min(1),
      users: z.string().min(1),
      repo: z.string().url(),
      adrs: z.array(z.object({ title: z.string().min(1), href: z.string().url() }).strict()).default([]),
    })
    .strict(),
  z
    .object({
      kind: z.literal("shelf"),
      ...base,
      /** The exact file, not a repo homepage. */
      href: z.string().url(),
      /** The file path shown on the row. */
      path: z.string().min(1),
    })
    .strict(),
]);

/**
 * Absence is the only publish state: an entry is published when its file exists.
 * No custom generateId: ids stay file-based, so two files sharing a slug both reach `ordered()`,
 * which throws. An id equal to the slug would make the glob loader overwrite one with a warning.
 */
const proof = defineCollection({
  loader: glob({
    base: `${contentDir}/proof`,
    pattern: "**/*.mdx",
  }),
  schema: proofEntry,
});

export const collections = { proof };
