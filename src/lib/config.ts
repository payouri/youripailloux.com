/**
 * Build-time switches, read from the environment.
 *
 * CONTENT_DIR: where the site content lives (default `content`). The test
 *   build points it at `tests/fixtures/content` so tests never see real content.
 * NOINDEX: on by default until launch. Set `NOINDEX=false` to launch.
 */
export const contentDir: string = process.env.CONTENT_DIR || "content";

const noindexValue = (process.env.NOINDEX ?? "true").trim().toLowerCase();
export const noindex: boolean = !["false", "0", "off", "no"].includes(noindexValue);
