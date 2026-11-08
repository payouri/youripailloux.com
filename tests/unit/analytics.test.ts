import assert from "node:assert/strict";
import { test } from "node:test";
import { EVENTS, posthogConfig, profileOf } from "../../src/lib/analytics.ts";

test("the event list is exactly the five of ADR 0004", () => {
  assert.deepEqual(Object.values(EVENTS).sort(), [
    "$pageview",
    "case_study_read",
    "easter_egg_triggered",
    "email_contacted",
    "profile_link_clicked",
  ]);
});

test("PostHog runs cookieless through the first-party proxy with everything else off", () => {
  const c = posthogConfig();
  assert.equal(c.cookieless_mode, "always");
  assert.equal(c.api_host, "/ingest");
  assert.equal(c.autocapture, false);
  assert.equal(c.disable_session_recording, true);
  assert.equal(c.persistence, "memory");
  assert.equal(c.capture_pageleave, false);
  assert.equal(c.capture_pageview, true);
});

test("profileOf names LinkedIn and GitHub links, and nothing else", () => {
  assert.equal(profileOf("https://www.linkedin.com/in/someone"), "linkedin");
  assert.equal(profileOf("https://linkedin.com/in/someone"), "linkedin");
  assert.equal(profileOf("https://github.com/someone/repo"), "github");
  assert.equal(profileOf("https://gist.github.com/x"), null);
  assert.equal(profileOf("https://notgithub.com/x"), null);
  assert.equal(profileOf("https://example.com/github.com"), null);
  assert.equal(profileOf("mailto:a@b.c"), null);
  assert.equal(profileOf("/relative"), null);
  assert.equal(profileOf("not a url"), null);
});
