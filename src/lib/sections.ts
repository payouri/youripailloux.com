/** Which section the reader is in. One rule, shared by the section map and the j/k shortcuts. */

/**
 * The active section: the last heading whose top has passed the upper third of the viewport.
 * Above the first heading, `beforeFirst`: the first section for the section map (0), or "no section
 * yet" for j/k (-1), so the first `j` lands on the first heading. At the foot of the page, the last
 * section, once the reader is past the first heading.
 */
export function activeSectionIndex(
  tops: number[],
  viewportHeight: number,
  scrollY: number,
  scrollHeight: number,
  beforeFirst: 0 | -1 = 0,
): number {
  if (tops.length === 0) return -1;
  const line = viewportHeight * 0.33;
  let index: number = beforeFirst;
  tops.forEach((top, i) => { if (top <= line) index = i; });
  if (index >= 0 && viewportHeight + scrollY >= scrollHeight - 4) index = tops.length - 1;
  return index;
}

/** The DOM-reading form of `activeSectionIndex`. */
export function currentSection(headings: HTMLElement[], beforeFirst: 0 | -1 = 0): number {
  return activeSectionIndex(
    headings.map((h) => h.getBoundingClientRect().top),
    window.innerHeight,
    window.scrollY,
    document.documentElement.scrollHeight,
    beforeFirst,
  );
}
