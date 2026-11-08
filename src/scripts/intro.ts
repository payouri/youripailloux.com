import { prefersReducedMotion } from "./reduced-motion";

/** sessionStorage key: the only state held across pages (ADR 0002). */
export const INTRO_KEY = "intro-played";
const RUN_MS = 1000;
const WIPE_MS = 560;

function markPlayed() {
  try { sessionStorage.setItem(INTRO_KEY, "1"); } catch { /* storage blocked: the head script already skipped */ }
}

/**
 * Plays the first-visit intro. The head script in Base.astro sets
 * `data-intro="pending"` on <html> only when it should play; this module
 * drives it and resolves once the layer starts leaving (or at once when there
 * is nothing to play), so reveals can begin.
 */
export function runIntro(): Promise<void> {
  const root = document.documentElement;
  const layer = document.querySelector<HTMLElement>("[data-intro-layer]");
  if (root.dataset.intro !== "pending" || !layer || prefersReducedMotion()) {
    root.dataset.intro = "done";
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let finished = false;
    let runTimer: number | undefined;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(runTimer);
      document.removeEventListener("keydown", finish);
      document.removeEventListener("pointerdown", finish);
      document.removeEventListener("click", finish);
      root.dataset.intro = "leaving";
      resolve();
      window.setTimeout(() => { root.dataset.intro = "done"; }, WIPE_MS);
    };

    markPlayed();
    root.dataset.intro = "playing";
    document.addEventListener("keydown", finish);
    document.addEventListener("pointerdown", finish);
    document.addEventListener("click", finish);
    runTimer = window.setTimeout(finish, RUN_MS);
  });
}
