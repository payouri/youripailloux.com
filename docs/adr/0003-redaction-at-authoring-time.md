# Redaction happens when the author writes, never when the site builds

Case studies quote real employer work with sensitive values removed. The author pastes each excerpt into the MDX **already redacted**, with an inline `<redacted:category>` marker in place of every removed value. A Shiki transformer turns each marker into the fixed-width redaction button, and generates the excerpt's *N values redacted* count and its "What was removed" panel from the markers. The explanation for each category lives in a small frontmatter map.

The real value never enters this repo, its history or the build. That is the point: this repo is public, and a public repo's history is permanent.

## Considered Options

- **Masking at build time** (keep the real files somewhere and redact them with rules as the site builds). Rejected: what may be shown is a judgement call per excerpt, which a regex can't make, and a case study is a dated snapshot of the work, not a live mirror of it.

## Consequences

- The transformer is the only real logic in the site, so it has its own unit tests.
- Content is committed only once it is cleared for publication. Drafts never land here.
