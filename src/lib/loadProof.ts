import { getCollection } from "astro:content";
import { checkEntryRedactions } from "./redaction";
import { ordered, type ProofData } from "./proof";

/** All published proof, in rank order. */
export async function loadProof(): Promise<ProofData[]> {
  const entries = await getCollection("proof");
  for (const e of entries) checkEntryRedactions(e.data.title, e.body, e.data.redactions);
  return ordered(entries.map((e) => ({ ...e.data, id: e.id }) as ProofData & { id: string }));
}
