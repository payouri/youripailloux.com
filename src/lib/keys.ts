/** Pure logic behind the keyboard shortcuts and easter eggs. No DOM access beyond what is passed in. */

/** True when a key press belongs to the thing being typed into, so shortcuts must stay out of the way. */
export function isTypingTarget(target: unknown): boolean {
  const el = target as { tagName?: string; isContentEditable?: boolean } | null;
  if (!el || typeof el.tagName !== "string") return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}

/** The index `j` (delta 1) or `k` (delta -1) lands on. From nothing (-1), `j` takes the first and `k` the last. Clamped. */
export function stepIndex(current: number, delta: 1 | -1, length: number): number {
  if (length <= 0) return -1;
  if (current < 0) return delta === 1 ? 0 : length - 1;
  return Math.min(length - 1, Math.max(0, current + delta));
}

/** Feeds characters one at a time; `push` returns true when the last characters typed spell `word`. */
export function sequenceMatcher(word: string) {
  let buffer = "";
  return {
    push(char: string): boolean {
      buffer = (buffer + char.toLowerCase()).slice(-word.length);
      if (buffer !== word) return false;
      buffer = "";
      return true;
    },
    reset() { buffer = ""; },
  };
}

/** Counts hits per key; `hit` returns true on every `every`th hit of the same key. */
export function hitCounter(every: number) {
  const counts = new Map<unknown, number>();
  return {
    hit(key: unknown): boolean {
      const n = (counts.get(key) ?? 0) + 1;
      if (n >= every) { counts.delete(key); return true; }
      counts.set(key, n);
      return false;
    },
  };
}
