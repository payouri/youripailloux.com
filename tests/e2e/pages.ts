import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const OUT_DIR = "dist-test";

/** Every HTML page in the built fixture site, as a URL path. New pages from later tickets are picked up automatically. */
export function builtPages(dir: string = OUT_DIR): string[] {
  const urls: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".html")) {
        const rel = relative(OUT_DIR, full).split(sep).join("/");
        urls.push(
          "/" + rel.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, ""),
        );
      }
    }
  };
  walk(dir);
  return urls.sort();
}
