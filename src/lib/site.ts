import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { contentDir } from "./config";

/** The site-level content file: `<content dir>/site.json`. */
export interface Site {
  name: string;
  role: string;
  claim: { layer1: string; layer2: string };
  about?: string;
  location: string;
  portrait?: string;
  email: string;
  linkedin: string;
  github: string;
  /** Extra contact-block links (e.g. Writing). Data, not markup: every page shows them. */
  links?: ContactLink[];
}

export interface ContactLink { label: string; href: string }

const required = [
  "name", "role", "claim.layer1", "claim.layer2", "location", "email", "linkedin", "github",
];

export function loadSite(dir: string = contentDir): Site {
  const file = resolve(dir, "site.json");
  const data = JSON.parse(readFileSync(file, "utf8"));
  for (const path of required) {
    const value = path.split(".").reduce((o: any, k) => o?.[k], data);
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`${file}: missing or empty "${path}"`);
    }
  }
  for (const [i, link] of (data.links ?? []).entries()) {
    if (typeof link?.label !== "string" || typeof link?.href !== "string" || !link.label.trim() || !link.href.trim()) {
      throw new Error(`${file}: "links[${i}]" needs a non-empty label and href`);
    }
  }
  return data as Site;
}
