import type { APIRoute, GetStaticPaths } from "astro";
import { renderCard, pageCard } from "../../lib/card";
import { loadProof } from "../../lib/loadProof";
import { isPage } from "../../lib/proof";
import { loadSite } from "../../lib/site";

export const getStaticPaths: GetStaticPaths = async () =>
  (await loadProof()).filter(isPage).map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));

export const GET: APIRoute = async ({ props }) =>
  new Response(await renderCard(pageCard(props.entry, loadSite())), { headers: { "Content-Type": "image/png" } });
