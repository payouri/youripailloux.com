/**
 * Redacted artifacts (ADR 0003). The author writes `<redacted:category>` inline
 * in a code fence; the real value never exists here. This module turns each
 * marker into a fixed-width redaction button and reports the categories used.
 */
import type { Element, ElementContent } from "hast";
import type { ShikiTransformer } from "shiki";

/** Matches `<redacted:category>`; the category is free text without angle brackets. */
const MARKER = /<redacted:([^<>\n]+?)>/g;
/** Stands in for a marker while Shiki tokenises, so a marker is never split across tokens. */
const OPEN = "";
const CLOSE = "";
const SENTINEL = new RegExp(`${OPEN}(\\d+)${CLOSE}`, "g");

export interface RedactionSummary {
  /** Every marker in the fence. */
  count: number;
  /** Distinct categories, in order of first use. */
  categories: string[];
}

/** Fails when a category has no entry in the entry's `redactions` map. */
export function assertKnownCategories(categories: readonly string[], known: Record<string, string>): void {
  const unknown = [...new Set(categories)].filter((c) => !Object.hasOwn(known, c));
  if (unknown.length > 0) {
    throw new Error(
      `redaction: no entry in the frontmatter \`redactions\` map for ${unknown.map((c) => `"${c}"`).join(", ")}`,
    );
  }
}

export function summarise(markers: readonly string[]): RedactionSummary {
  return { count: markers.length, categories: [...new Set(markers)] };
}

/** The category of every marker in `code`, in order. */
export function findMarkers(code: string): string[] {
  return [...code.matchAll(MARKER)].map((m) => m[1].trim());
}

function button(category: string): Element {
  return {
    type: "element",
    tagName: "button",
    properties: { type: "button", className: ["redaction"], ariaLabel: `redacted: ${category}`, "data-category": category },
    children: [
      { type: "element", tagName: "span", properties: { className: ["redaction__label"], ariaHidden: "true" }, children: [{ type: "text", value: "redacted" }] },
      { type: "element", tagName: "span", properties: { className: ["redaction__tip"], ariaHidden: "true" }, children: [{ type: "text", value: category }] },
    ],
  };
}

function expand(nodes: ElementContent[], markers: readonly string[]): ElementContent[] {
  return nodes.flatMap((node): ElementContent[] => {
    if (node.type === "element") return [{ ...node, children: expand(node.children, markers) }];
    if (node.type !== "text" || !node.value.includes(OPEN)) return [node];
    const out: ElementContent[] = [];
    let last = 0;
    for (const m of node.value.matchAll(SENTINEL)) {
      if (m.index > last) out.push({ type: "text", value: node.value.slice(last, m.index) });
      out.push(button(markers[Number(m[1])]));
      last = m.index + m[0].length;
    }
    if (last < node.value.length) out.push({ type: "text", value: node.value.slice(last) });
    return out;
  });
}

/**
 * A Shiki transformer for one highlight call at a time. It writes the summary
 * on the `pre` as `data-redaction-count` and `data-redactions` (JSON), and the
 * fence's `title="..."` meta as `data-title`. Pass `redactions` to fail on an
 * unknown category right here.
 */
export function redactionTransformer(options: { redactions?: Record<string, string> } = {}): ShikiTransformer {
  let markers: string[] = [];
  return {
    name: "redactions",
    preprocess(code) {
      markers = findMarkers(code);
      if (options.redactions) assertKnownCategories(markers, options.redactions);
      let i = 0;
      return code.replace(MARKER, () => `${OPEN}${i++}${CLOSE}`);
    },
    code(node) {
      node.children = expand(node.children, markers);
    },
    pre(node) {
      const { count, categories } = summarise(markers);
      node.properties["data-redaction-count"] = count;
      node.properties["data-redactions"] = JSON.stringify(categories);
      const title = /title=(?:"([^"]*)"|'([^']*)'|(\S+))/.exec(this.options.meta?.__raw ?? "");
      if (title) node.properties["data-title"] = title[1] ?? title[2] ?? title[3];
    },
  };
}

/** Build-time check for one entry: every marker in its body has a category in its `redactions` map. */
export function checkEntryRedactions(title: string, body: string | undefined, known: Record<string, string>): void {
  try {
    assertKnownCategories(findMarkers(body ?? ""), known);
  } catch (e) {
    throw new Error(`"${title}": ${(e as Error).message}`);
  }
}
