import { getCollection } from "astro:content";
import { checkEntryRedactions } from "./redaction";
import { ordered, type ProofData } from "./proof";

/**
 * All published proof, in rank order. This is the only check that every
 * redaction category has an entry in its frontmatter map, so a route that
 * renders proof must load it through here, not through getEntry/getCollection.
 */
export async function loadProof(): Promise<(ProofData & { id: string })[]> {
  const entries = await getCollection("proof");
  for (const e of entries) checkEntryRedactions(e.data.title, e.body, e.data.redactions);
  return ordered(entries.map((e) => ({ ...e.data, id: e.id })));
}
