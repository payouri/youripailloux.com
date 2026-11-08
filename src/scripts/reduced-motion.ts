/**
 * The one reduced-motion gate. Every client module asks here before it moves
 * anything. (The tiny inline script in Base.astro's head runs before modules
 * load and asks the same media query; keep the two in step.)
 */
const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia(QUERY).matches;
  } catch {
    return true; // can't tell: the calm option
  }
}
