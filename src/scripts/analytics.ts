import { EVENTS, posthogConfig, profileOf, type EventProps } from "../lib/analytics";

/** Set at build time. Without it (local dev, forks) the tracker never loads and every call is a no-op. */
const KEY = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;

type Client = { capture(event: string, props?: Record<string, unknown>): void };

// Loaded lazily so a slow or blocked tracker never holds up the page; any failure leaves a silent no-op.
const client: Promise<Client | null> = KEY
  ? import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(KEY, posthogConfig() as never);
        return posthog as Client;
      })
      .catch(() => null)
  : Promise.resolve(null);

/** Send one of the four custom events. Never throws and never blocks. */
export function track<E extends keyof EventProps>(event: E, props: EventProps[E]): void {
  client.then((c) => { try { c?.capture(event, props); } catch {} }).catch(() => {});
}

// Email: a click on the mailto link, the Copy button, or copying the address by hand.
const emailLink = (el: Element | null) => el?.closest<HTMLAnchorElement>("a[href^='mailto:']");
let lastCopy = 0;
const trackCopy = () => {
  lastCopy = Date.now();
  track(EVENTS.email, { method: "copy" });
};

function onClick(e: MouseEvent) {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;
  if (target.closest("[data-copy]")) { trackCopy(); return; }
  if (emailLink(target)) { track(EVENTS.email, { method: "click" }); return; }
  const profile = profileOf(target.closest<HTMLAnchorElement>("a[href]")?.href ?? "");
  if (profile) track(EVENTS.profile, { profile });
}
document.addEventListener("click", onClick);
document.addEventListener("auxclick", (e) => { if (e.button === 1) onClick(e); });

document.addEventListener("copy", () => {
  const address = document.querySelector<HTMLElement>("[data-copy]")?.dataset.copy;
  if (!address || Date.now() - lastCopy < 1000) return; // the button's own copy was already counted
  if ((window.getSelection()?.toString() ?? "").includes(address)) trackCopy();
});

// Case study read to the end: the attribution line closes a case study, so seeing it is reaching the end.
const study = document.querySelector<HTMLElement>("main[data-kind='case-study']");
const end = study?.querySelector("[data-attribution]");
if (study && end && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((en) => en.isIntersecting)) return;
    observer.disconnect();
    track(EVENTS.caseStudyRead, { slug: study.dataset.slug ?? "" });
  });
  observer.observe(end);
}
