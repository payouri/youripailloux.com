/** Which section the reader is in. One rule, shared by the section map and the j/k shortcuts. */

/**
 * The active section: the last heading whose top has passed the upper third of the viewport.
 * Above the first heading, the first section. At the foot of the page, the last section.
 */
export function activeSectionIndex(tops: number[], viewportHeight: number, scrollY: number, scrollHeight: number): number {
  if (tops.length === 0) return -1;
  const line = viewportHeight * 0.33;
  let index = 0;
  tops.forEach((top, i) => { if (top <= line) index = i; });
  if (viewportHeight + scrollY >= scrollHeight - 4) index = tops.length - 1;
  return index;
}

/** The DOM-reading form of `activeSectionIndex`. */
export function currentSection(headings: HTMLElement[]): number {
  return activeSectionIndex(
    headings.map((h) => h.getBoundingClientRect().top),
    window.innerHeight,
    window.scrollY,
    document.documentElement.scrollHeight,
  );
}
