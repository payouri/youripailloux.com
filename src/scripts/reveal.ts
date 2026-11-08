import { prefersReducedMotion } from "./reduced-motion";

const STAGGER_MS = 70;

/**
 * Reveals `[data-reveal]` elements as they scroll into view. Under reduced
 * motion (or without IntersectionObserver) every element is in its final
 * state immediately.
 */
export function initReveals(): void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  const show = (el: HTMLElement) => el.setAttribute("data-revealed", "");

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .forEach((entry, i) => {
          const el = entry.target as HTMLElement;
          el.style.setProperty("--reveal-delay", `${i * STAGGER_MS}ms`);
          show(el);
          observer.unobserve(el);
        });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  targets.forEach((el) => observer.observe(el));
}
