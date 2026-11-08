/** One source for the support icon geometry and the support-to-icon rule (ProofIcon.astro and the link-preview card). */
import type { Support } from "./proof";

export const iconPaths = {
  layers: ["M3 16.5 12 21l9-4.5", "M3 12.5 12 17l9-4.5", "M12 3 3 7.5 12 12l9-4.5z"],
  loop: ["M20 12a8 8 0 0 1-14 5.3", "M4 12a8 8 0 0 1 14-5.3", "M18.5 3v4h-4", "M5.5 21v-4h4"],
} as const satisfies Record<string, readonly string[]>;

export type SupportIconName = keyof typeof iconPaths;

export const supportIcon: Record<Support, SupportIconName> = { platform: "layers", dx: "loop" };

/** The "build test deploy" steps shown on the intro layer and the link-preview card. */
export const pipelineSteps = ["build", "test", "deploy"] as const;
