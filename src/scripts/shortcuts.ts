import { hitCounter, isTypingTarget, sequenceMatcher, stepIndex } from "../lib/keys";
import { prefersReducedMotion } from "./reduced-motion";

const REDACTION_HITS = 4;

/** What j/k walk through: the proof list's rows on home, a case study's sections (h2s) on a proof page. */
function targets(): HTMLElement[] {
  const rows = [...document.querySelectorAll<HTMLElement>("[data-proof-list] a.row__link, [data-proof-list] a.shelf__link")];
  if (rows.length > 0) return rows;
  const sections = [...document.querySelectorAll<HTMLElement>("[data-body] h2")];
  sections.forEach((h) => { if (!h.hasAttribute("tabindex")) h.tabIndex = -1; });
  return sections;
}

/** The section the reader is in: the last heading above the upper third of the viewport. */
function sectionInView(list: HTMLElement[]): number {
  const line = window.innerHeight * 0.33;
  let index = -1;
  list.forEach((h, i) => { if (h.getBoundingClientRect().top <= line) index = i; });
  return index;
}

function move(delta: 1 | -1) {
  const list = targets();
  const onList = list[0]?.matches("a");
  const active = document.activeElement;
  let current = list.findIndex((el) => el === active || el.contains(active));
  if (current < 0 && !onList) current = sectionInView(list);
  const next = list[stepIndex(current, delta, list.length)];
  if (!next) return;
  next.focus({ preventScroll: true });
  next.scrollIntoView({ block: onList ? "nearest" : "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/** The contact block owns the page's one toast; ask it to show a message. */
const say = (message: string) => window.dispatchEvent(new CustomEvent("site:toast", { detail: message }));

const panel = document.querySelector<HTMLDialogElement>("[data-shortcuts]");
const togglePanel = () => {
  if (!panel) return;
  if (panel.open) panel.close();
  else panel.showModal();
};
panel?.querySelector("[data-shortcuts-close]")?.addEventListener("click", () => panel.close());

const ship = sequenceMatcher("ship");
document.addEventListener("keydown", (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (isTypingTarget(e.target)) { ship.reset(); return; }
  if (e.key === "?") { e.preventDefault(); togglePanel(); return; }
  if (panel?.open) return; // the modal panel owns the keyboard (Esc closes it natively)
  if (e.key === "j" || e.key === "k") { e.preventDefault(); move(e.key === "j" ? 1 : -1); }
  if (e.key.length === 1 && ship.push(e.key)) say("Shipped. On your own, as promised.");
});

// Click a redaction four times and it talks back.
const redactionHits = hitCounter(REDACTION_HITS);
document.addEventListener("click", (e) => {
  const bar = (e.target as Element | null)?.closest<HTMLElement>("button.redaction");
  if (!bar || !redactionHits.hit(bar)) return;
  say("Nice try. It stays redacted.");
  if (!prefersReducedMotion()) {
    bar.removeAttribute("data-shake");
    void bar.offsetWidth;
    bar.setAttribute("data-shake", "");
  }
});

console.log(
  "%cHello, fellow developer.%c\nYou read the console, so you are my kind of user. Press ? for the shortcuts, or write to me: the address is at the bottom of the page.",
  "font-weight:700;color:#d6322b",
  "",
);
