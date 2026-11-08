import { noindex } from "../lib/config";

export function GET() {
  const body = noindex ? "User-agent: *\nDisallow: /\n" : "User-agent: *\nAllow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
