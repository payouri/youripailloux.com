import { getCollection } from "astro:content";
import { ordered, type ProofData } from "./proof";

/** All published proof, in rank order. */
export async function loadProof(): Promise<ProofData[]> {
  const entries = await getCollection("proof");
  return ordered(entries.map((e) => ({ ...e.data, id: e.id }) as ProofData & { id: string }));
}
