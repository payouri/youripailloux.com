# youripailloux.com

Youri Pailloux's personal site. The language here is about what the site claims and what counts as proof. Visual rules are in [DESIGN.md](DESIGN.md); this file is vocabulary only.

## Language

### Positioning

**Claim**:
The one thing the site says Youri is. There is exactly one, and it is *DX Engineer*. Everything else on the site either supports it or is proof for it.
_Avoid_: Identity, tagline, brand

**Support**:
A sub-claim that backs the claim. There are two: *builds and operates the platform underneath*, and *runs DX like a product*. Each has proof under it, and each has its own icon in the proof list (stacked layers, and a loop).
_Avoid_: Pillar, specialty, skill

**DX Engineer**:
Youri's role and the site's single claim: he builds the tools and infrastructure that let developers ship on their own, all the way to production. It is his actual title, so it is stated as fact and never renamed. The developers include the agents they work with.
_Avoid_: Developer Productivity Engineer, Platform Engineer (as titles), developer advocate, DevRel

**Backstory**:
The short prose account, in the About, of how Youri's work climbed from UI primitives to the platform ("the layer underneath"). It is never offered as proof, and nothing in it is linked.
_Avoid_: Origin story, journey, timeline, career arc

### Proof

**Proof**:
Evidence a reader can check or follow, offered to back up the claim. Ranked by the reader's trust: written decision reasoning, then ADRs shown as artifacts, then one deeply documented tool, then measured numbers.
_Avoid_: Portfolio piece, showcase, project

**Employer work**:
Work Youri did for his employer. He may describe it publicly but never publish it as source, so it appears only as case studies with redacted artifacts.
_Avoid_: Internal work, company projects

**Personal work**:
Work Youri owns outright and may publish in full.
_Avoid_: Side projects

**Case study**:
A written account of employer work in a fixed structure: a two-line summary (the support it proves and its headline number), then problem → constraint → decision → trade-off → outcome, with redacted artifacts, measured numbers and an attribution line. The fixed structure is what makes it a case study and not a post.
_Avoid_: Write-up, project page, post

**Tool page**:
A page about a tool Youri owns outright and others actually use, built around its ADRs. It links the source and the ADRs unredacted, and it is shorter than a case study.
_Avoid_: Project page, showcase

**Shelf item**:
One sentence and a deep link to a single file a reader can open, listed below the case studies and the tool page. It earns its place by giving the reader source.
_Avoid_: Project card, thumbnail, grid item

**Proof list**:
The single ranked list of proof on the home page: case studies first, then the tool page, then shelf items. It is never grouped, never numbered, never a grid, and never holds a post.
_Avoid_: Projects section, work grid, portfolio, showcase

**Summary**:
The two lines that open a case study, or the one sentence of a tool page or shelf item. It is written once and used three times: in the proof list, at the top of the page, and as the link-preview description.
_Avoid_: Excerpt, teaser, blurb

**Redacted artifact**:
A verbatim excerpt of employer work (an ADR passage, a workflow fragment) in which every sensitive value is replaced by a `<redacted:category>` marker and every tooling version is removed. The marker is written by the author; the real value never exists in this repo.
_Avoid_: Sanitized snippet, anonymized excerpt

**Redaction category**:
The kind of value a redaction replaced (for example *secret name* or *internal host*). It is what a reader sees on hover and what a screen reader announces, and each category used on a page is explained once in that page's "What was removed" panel.
_Avoid_: Redaction reason, mask type

**Margin note**:
A short aside beside the prose of a case study: where a number comes from, how agents were used, what a redaction hides. It sits in the right margin on wide screens and inline on narrow ones.
_Avoid_: Footnote, sidebar, callout

**Post**:
A dated piece of writing on the blog (`/blog`) about one thing. It has no fixed structure, is not rewritten after publication, and is never listed as proof.
_Avoid_: Article, case study

### Reaching out

**Contact block**:
The block that ends every page: Youri's email address, with LinkedIn and GitHub as plain links. It is the site's only navigation besides the byline, so anything added later is added to it.
_Avoid_: CTA, footer, contact page, contact form

**Byline**:
*Youri Pailloux · DX Engineer*, at the top of every page, linking home. On a cold-arrival page it is the reader's first sight of the claim.
_Avoid_: Header, nav, logo
