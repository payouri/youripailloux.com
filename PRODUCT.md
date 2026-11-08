# Product

Design context for `/impeccable` and any UI work on youripailloux.com. The visual system is in [DESIGN.md](DESIGN.md), the vocabulary in [CONTEXT.md](CONTEXT.md), and the reasons behind the stack in [docs/adr/](docs/adr/).

## Register

brand

## Users

**Primary reader:** an engineering leader who cares about developer experience and developer productivity — the kind of person who runs or funds a DX or platform team at a remote-first company or a scale-up. They usually arrive cold, from a peer's link to one case study pasted into Slack or LinkedIn, without ever having seen the home page. Their first contact is often the link-preview card. They read properly at a desk, and they are sceptical: they've seen a lot of portfolios.

**Distribution:** peer engineers, who forward a case study to someone they think should read it. They are the channel, not a competing audience.

**Job to be done:** decide whether Youri *builds and operates the systems that make other engineers fast, in production, as his actual job*, and if so, write to him.

## Product Purpose

Say plainly what Youri does, and prove it. Every older public trace of him files him as a front-end or full-stack web developer. His actual role is **DX Engineer**: he builds the tools and infrastructure that let developers ship fast and on their own, all the way to production. The site corrects that category error through written reasoning and checkable proof, never through a pitch.

Success: after one visit the reader can repeat *"a DX engineer who runs a whole team's path to production on his own"*, and some of them write to `hello@youripailloux.com`.

## Brand Personality

**Two temperatures**, in Youri's words: *serious when talking about work; warm, fun and spicy when interacting with a human.*

- **The work is serious.** The claim, the proof list, the case studies and the redacted artifacts are exact, calm and load-bearing: measured numbers, decisions and trade-offs, no adjectives.
- **The human is warm and spicy.** The About, the contact block, interaction feedback and the easter eggs may have personality, wit and a little heat.

This is his first serious self-description anywhere, so the work side must never wink.

**Vocabulary.** Use: *DX Engineer* (the title, never renamed) · *developer experience*, *developer productivity*, *platform* · *ship on their own*, *self-serve* · *the whole loop* · *in production* · *what it costs* · *the layer underneath* (About prose only). Avoid: *fullstack*, *web developer*, *MERN*, *passionate*, *creativity*, *curiosity* · *at scale* · *staff*, *lead*, *head of* · *DevRel*, *developer advocate*, *speaker*, *maintainer*, *community* · *AI engineer*, *AI-native* · *designer* · commit or ADR counts · *consultant*, *available*, *hire me* · joke titles.

## Anti-references

- **Dead weight for the reader:** project grids, logo walls, stack badges, star and download counts, and visual polish used as a proxy for skill.
- **Performing craft instead of stating a position:** the parallax-and-typewriter register of a 2020-era developer portfolio.
- **Looking for work:** "hire me" buttons, availability banners, CV downloads, experience timelines, and Uses or Now pages.
- **Promising design taste the work doesn't show:** designer-portfolio flourishes. The bar is precision and motion, not visual design.
- **Developer-portfolio costume:** terminal cosplay, hacker green on black, and monospace used to mean "technical". Monospace is for literal code.

## Design Principles

1. **Show, don't claim.** Proof takes the form of written reasoning. Nothing on the page asserts a skill the page doesn't demonstrate.
2. **Reading comfort beats looks.** The site is prose-first, and a direction that looks good but reads badly fails.
3. **Two temperatures.** Serious about the work, warm and spicy with people. Design makes the switch visible: the chili accent belongs to the human side only.
4. **Precision and motion, not decoration.** Motion is a real strength and may carry the site, but it is exact and purposeful, and it always respects reduced motion.
5. **Every page stands alone.** A cold reader arriving from a peer's link learns who wrote it, what it proves and where to go next.

## Accessibility & Inclusion

- WCAG 2.2 AA, in light and in dark.
- **`prefers-reduced-motion` is mandatory.** Every animation has a final state it jumps to.
- **Visible focus states** on every interactive element. Never `outline: 0`.
- **`<redacted>` placeholders read sensibly to screen readers** ("redacted: secret name"), not as noise.
- English only.
