import { readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import type { APIRoute, GetStaticPaths } from "astro";
import { contentDir } from "../../lib/config";
import { loadSite } from "../../lib/site";

// The portrait lives in the content dir beside site.json; serve it at /portrait/<file>.
const types: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
};

export const getStaticPaths: GetStaticPaths = () => {
  const { portrait } = loadSite();
  return portrait ? [{ params: { file: portrait } }] : [];
};

export const GET: APIRoute = ({ params }) => {
  const file = params.file!;
  return new Response(readFileSync(resolve(contentDir, file)), {
    headers: { "Content-Type": types[extname(file).toLowerCase()] ?? "application/octet-stream" },
  });
};
