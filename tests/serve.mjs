// Minimal static file server for the built output (dist-test by default).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.argv[2] || "dist-test";
const port = Number(process.argv[3] || 4399);
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8", ".json": "application/json", ".xml": "application/xml",
};

async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  for (const candidate of [clean, join(clean, "index.html"), clean + ".html"]) {
    const file = join(root, candidate);
    try { if ((await stat(file)).isFile()) return file; } catch {}
  }
}

createServer(async (req, res) => {
  const file = await resolveFile(new URL(req.url, "http://x").pathname);
  if (!file) { res.writeHead(404).end("not found"); return; }
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
  res.end(await readFile(file));
}).listen(port, () => console.log(`serving ${root} on ${port}`));
