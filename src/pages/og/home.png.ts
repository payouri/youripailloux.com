import type { APIRoute } from "astro";
import { homeCard, renderCard } from "../../lib/card";
import { loadSite } from "../../lib/site";

export const GET: APIRoute = async () =>
  new Response((await renderCard(homeCard(loadSite()))) as BodyInit, { headers: { "Content-Type": "image/png" } });
