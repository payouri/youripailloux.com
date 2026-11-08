/** The analytics contract (ADR 0004): five events and a locked-down PostHog config. No DOM access. */

export const EVENTS = {
  pageview: "$pageview",
  caseStudyRead: "case_study_read",
  email: "email_contacted",
  profile: "profile_link_clicked",
  easterEgg: "easter_egg_triggered",
} as const;

export type EasterEgg = "ship" | "redaction" | "console";
export type EventProps = {
  [EVENTS.caseStudyRead]: { slug: string };
  [EVENTS.email]: { method: "click" | "copy" };
  [EVENTS.profile]: { profile: "linkedin" | "github" };
  [EVENTS.easterEgg]: { egg: EasterEgg };
};

/**
 * Everything not in the five events is switched off. Nothing is persisted (memory only), so no cookie and no
 * storage entry exists. `$pageview` carries `$referrer` on its own. Requests are uncompressed and unbatched so
 * each event is one readable request to the proxy.
 */
export function posthogConfig() {
  return {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    cookieless_mode: "always",
    persistence: "memory",
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_exceptions: false,
    capture_performance: false,
    rageclick: false,
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_flags: true,
    disable_compression: true,
    request_batching: false,
  } as const;
}

/** Which of the two profiles a link points at, by exact host. */
export function profileOf(href: string): "linkedin" | "github" | null {
  let host: string;
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    host = url.hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host === "linkedin.com" || host === "www.linkedin.com") return "linkedin";
  if (host === "github.com" || host === "www.github.com") return "github";
  return null;
}
