---
name: youripailloux.com
description: The personal site of Youri Pailloux, DX Engineer. Serious about the work, warm with people.
colors:
  paper: "oklch(98.6% 0.004 25)"
  ink: "oklch(21% 0.012 25)"
  ink-muted: "oklch(44% 0.012 25)"
  ink-faint: "oklch(51% 0.01 25)"
  rule: "oklch(90.5% 0.006 25)"
  rule-strong: "oklch(84% 0.008 25)"
  panel: "oklch(96.2% 0.006 25)"
  panel-strong: "oklch(93.5% 0.008 25)"
  chili: "oklch(55% 0.21 25)"
  chili-soft: "oklch(93.5% 0.035 25)"
  chili-ink: "oklch(45% 0.18 25)"
  on-chili: "oklch(98.5% 0.01 25)"
  paper-dark: "oklch(16.5% 0.006 25)"
  ink-dark: "oklch(93% 0.006 25)"
  ink-muted-dark: "oklch(74% 0.008 25)"
  ink-faint-dark: "oklch(63% 0.008 25)"
  rule-dark: "oklch(27% 0.008 25)"
  rule-strong-dark: "oklch(35% 0.01 25)"
  panel-dark: "oklch(20.5% 0.008 25)"
  panel-strong-dark: "oklch(24.5% 0.01 25)"
  chili-dark: "oklch(66% 0.19 25)"
  chili-soft-dark: "oklch(29% 0.06 25)"
  chili-ink-dark: "oklch(78% 0.13 25)"
  on-chili-dark: "oklch(16% 0.02 25)"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.4rem + 3vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.2rem + 2.3vw, 3.05rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.012em"
  section:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.5
  code:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.8
rounded:
  redaction: "2px"
  kbd: "5px"
  document: "6px"
  note: "8px"
  portrait: "10px"
  toast: "12px"
  pill: "999px"
spacing:
  gutter-page: "1.5rem"
  grid-max: "68rem"
  case-max: "84rem"
  measure: "38rem"
  case-measure: "40rem"
  icon-gutter: "2.75rem"
  context-column: "11rem"
  row: "1.4rem"
  section: "3rem"
  block: "6rem"
components:
  link-email:
    textColor: "{colors.chili-ink}"
  link-email-hover:
    backgroundColor: "{colors.chili}"
    textColor: "{colors.on-chili}"
  button-copy:
    backgroundColor: "{colors.panel-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 0.9rem"
    typography: "{typography.label}"
  button-copy-hover:
    backgroundColor: "{colors.chili-soft}"
  button-copy-done:
    backgroundColor: "{colors.chili}"
    textColor: "{colors.on-chili}"
  redaction:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.redaction}"
    width: "9.5ch"
  redaction-hover:
    backgroundColor: "{colors.chili}"
    textColor: "{colors.on-chili}"
  code-document:
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.document}"
    typography: "{typography.code}"
  margin-note:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-faint}"
    rounded: "{rounded.note}"
    padding: "0.7rem 0.9rem"
  contact-band:
    backgroundColor: "{colors.panel}"
    padding: "5rem 0 5.5rem"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.toast}"
    padding: "0.85rem 1.1rem 1rem"
---

# Design System: youripailloux.com

## 1. Overview

**Creative North Star: "The Annotated Document"**

The site reads like a well-kept engineering document that a person has written in the margins of. The document half is exact and calm: a centred grid, hyperlegible type, code shown as a bordered file with line numbers, redactions drawn as solid bars. The person half is warm: one chili accent, a live clock, a copy button that answers back, a few easter eggs. The switch between the two is the design. Chili appears only where the person is, never inside the proof.

It is prose-first and light by default, with a full dark mode. Density is low: one text column of about 65 characters, generous vertical space, nothing competing with the reading. Motion carries the personality, and every animation has a final state that `prefers-reduced-motion` jumps straight to.

It explicitly rejects project grids, logo walls, stack badges and star counts; the parallax-and-typewriter developer portfolio; terminal cosplay and monospace-as-costume; and designer-portfolio flourishes the work doesn't back up.

**Key Characteristics:**
- One superfamily (Atkinson Hyperlegible Next and Mono). Hierarchy from weight and space, never from a second typeface.
- Neutrals tinted toward hue 25; one accent, chili, used on the human side only.
- **Layout:** a centred 68rem grid on every page, in three columns: a 2.75rem icon gutter, the content, and an 11rem context column. Below 900px the context column disappears and its content moves inline. Page side padding is 1.5rem.
- **Case-study layout:** from 1180px, three centred zones inside 84rem: a sticky section map (11rem) on the left, the 40rem text column in the middle, margin notes on the right. Below 1180px the map is hidden and margin notes become inline panels.
- Motion is exact, never bouncy. Easing: entrances `cubic-bezier(.165,.84,.44,1)`, state changes `cubic-bezier(.87,0,.13,1)`, exits `cubic-bezier(.7,0,.84,0)`. Interactions take 450ms or less; entrances take 800ms or less.

## 2. Colors: The Chili-and-Paper Palette

Restrained: warm-tinted paper and ink, with one hot accent that marks where a human is talking.

### Primary
- **Chili** (`oklch(55% 0.21 25)`; dark `oklch(66% 0.19 25)`): the email address, focus rings, hover rules and arrows, the byline dot, the section-map dot, the intro's progress bar and checkmarks, the toast's timer bar, a redaction bar on hover or focus, text selection.
- **Chili Ink** (`oklch(45% 0.18 25)`; dark `oklch(78% 0.13 25)`): chili as text on paper (the email at rest, "Copied").
- **Chili Soft** (`oklch(93.5% 0.035 25)`; dark `oklch(29% 0.06 25)`): the copy button's hover fill.
- **On Chili** (`oklch(98.5% 0.01 25)`; dark `oklch(16% 0.02 25)`): text on a chili fill.

### Neutral
- **Paper** (`oklch(98.6% 0.004 25)`; dark `oklch(16.5% 0.006 25)`): the page background.
- **Ink** (`oklch(21% 0.012 25)`; dark `oklch(93% 0.006 25)`): body text, titles, redaction bars at rest, keys in code.
- **Ink Muted** (`oklch(44% 0.012 25)`; dark `oklch(74% 0.008 25)`): layer 2 of the claim, summaries, proof-row sentences, code values, icons at rest.
- **Ink Faint** (`oklch(51% 0.01 25)`; dark `oklch(63% 0.008 25)`): context lines (*employer · year*), line numbers, margin notes, the attribution line, the clock label.
- **Rule** (`oklch(90.5% 0.006 25)`; dark `oklch(27% 0.008 25)`) and **Rule Strong** (`oklch(84% 0.008 25)`; dark `oklch(35% 0.01 25)`): row dividers; document and ADR borders.
- **Panel** (`oklch(96.2% 0.006 25)`; dark `oklch(20.5% 0.008 25)`) and **Panel Strong** (`oklch(93.5% 0.008 25)`; dark `oklch(24.5% 0.01 25)`): the contact band, inline margin notes, the shortcuts panel, the copy button, `kbd`.

### Named Rules
**The Two Temperatures Rule.** Chili belongs to the human temperature only. It never appears inside a case study's prose, its code, its numbers or its artifacts, except as the hover state of a redaction bar, which is an interaction, not content.

**The Light Default Rule.** Light is the default. Dark follows `prefers-color-scheme` and has its own tuned values above, not an inversion. Dark body text gets line-height 1.72 and `letter-spacing: 0.01em`.

## 3. Typography

**Display Font:** Atkinson Hyperlegible Next (with system-ui, sans-serif)
**Body Font:** Atkinson Hyperlegible Next (with system-ui, sans-serif)
**Mono Font:** Atkinson Hyperlegible Mono (with ui-monospace, monospace)

**Character:** one superfamily designed for legibility, which suits a man whose job is making other people's work easier. Self-hosted, subset to Latin, preloaded.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 1.4rem + 3vw, 3.5rem)`, 1.06, -0.03em): the case-study and tool-page title.
- **Headline** (600, `clamp(2rem, 1.2rem + 2.3vw, 3.05rem)`, 1.12, -0.025em): layer 1 of the claim on the home page. The contact band's opening line uses the same voice at `clamp(1.75rem, 1rem + 2.3vw, 2.85rem)`, max 24ch.
- **Title** (700, 1.375rem, 1.3): a proof-list entry's title; the "next" link.
- **Section** (700, 1.3125rem, 1.3): section headings inside a case study and the About.
- **Body** (400, 1.0625rem / 17px, 1.65): all prose. Measure 38rem on the home page, 40rem in a case study (about 65 characters). `text-wrap: pretty` on paragraphs, `balance` on headings.
- **Summary** (400, 1.25rem, 1.5, Ink Muted, key words in Ink): a case study's two lines under its title. Layer 2 of the claim: `clamp(1.125rem, 1rem + 0.4vw, 1.3125rem)`, 1.5.
- **Label** (700, 0.875rem): the support line in a proof row, the byline (0.9375rem), the copy button.
- **Code** (Mono, 400, 0.8125rem, 1.8): code documents, file paths in shelf rows (0.875rem, 600), artifact headers (0.75rem).

### Named Rules
**The Monospace Is Literal Rule.** Mono is for literal code, file paths and artifact headers only. Never for labels, headings or decoration.

**The No Numbers Rule.** Nothing on the site is numbered for structure (no "01", no ranked digits). Youri: numbering everything *"feels AI"*. Order and kind are carried by position and icons.

## 4. Elevation

Flat. Depth comes from 1px rules, tonal panels and borders. Shadows appear only on things that float above the page in response to a person: the shortcuts panel and the portrait's hover.

### Shadow Vocabulary
- **Floating panel** (`box-shadow: 0 0 0 1px <rule>, 0 18px 40px -20px oklch(20% 0.03 25 / 0.4)`): the `?` shortcuts panel.
- **Portrait lift** (`box-shadow: 0 14px 30px -14px oklch(20% 0.03 25 / 0.5)`): the portrait on hover, with `rotate(-2.5deg) scale(1.03)`.

### Named Rules
**The Flat Document Rule.** Content never floats. Code documents, ADR blocks and margin notes are bordered or tinted, never shadowed.

## 5. Components

### Byline
Name and role, the first thing on every page: an 0.5rem chili dot, then *Youri Pailloux · DX Engineer* in Label at 0.9375rem. It links home. On hover or focus the dot scales to 1.7.

### Landing (home only)
At least 60svh. The byline at the top; the title block anchored to the bottom, with layer 1 of the claim on the left (1.55fr) and layer 2 on the right (1fr), aligned to their baselines, then a rule. **Nothing else**: no button, no portrait, no menu. Layer 2 is a separate content field so it can be swapped alone.

### Proof list
One ranked list, never a grid, never numbered, never grouped under headings.
- **Case-study and tool rows:** icon gutter, then title (Title), support line (Label; on phones the *employer · year* context rides on it in Ink Faint), and the summary (Ink Muted, max 38rem). The context sits in the right column on wide screens. A 1px Rule divides rows.
- **Icons** say what kind of proof a row is: a **loop** (*Runs DX like a product*), **stacked layers** (*Builds and operates the platform underneath*), a **package** (a tool page), a **code file** (a shelf item). Inline SVG, Ink Muted at rest.
- **Shelf rows** are lighter: 19px icon, a mono file path, one sentence at 0.9375rem, an external-link mark, no dividers, 1.25rem gap above the first one.
- **Hover/focus:** a chili rule draws across the top of the row (420ms, state easing); the title underlines from the left; the icon turns chili and moves (the loop rotates 180°, the layers spread 2.5px, the package lifts and tilts −8°, the file's brackets open 1.5px); a chili arrow slides in beside the context.
- **Reveal:** rows rise 16px into place one after another (70ms stagger).
- **An entry that isn't published is absent.** No placeholder, no "coming soon"; the list closes up.

### About (home only)
A Section heading, the prose (max 38rem), *Based in Montpellier, France* in Ink Muted, and the portrait in the context column (8rem wide inline on phones). The portrait is square, radius 10px, shown as it is.

### Case-study page and tool page
1. The byline (links home).
2. The title (Display), with a `view-transition-name` shared with its title in the proof list.
3. The context line, *employer · year* (Ink Faint, 0.9375rem). It is the year of the work, never a publication date.
4. The summary.
5. The body, in sections (`h2` at Section size, 3rem above each).
6. The attribution line (Ink Faint, 0.9375rem, a rule above it).
7. The "next" link to the next published entry in rank order (Title size, with a chili arrow that slides 6px on hover). The last entry has none.
8. The contact band.

From 1180px the **section map** sits sticky on the left: a small "Contents" label, the section links in Ink Faint (Ink when active), and a 0.45rem chili dot that slides to the active section (420ms, state easing).

### Margin note
An aside for where a number comes from, how agents were used, or what a redaction hides. 0.8125rem, line-height 1.5, Ink Faint with bold lead-in in Ink. Below 1180px: an inline Panel with 8px radius. From 1180px: floated into the right margin, 12.5rem wide, no fill, sliding in 10px from the right on reveal.

### Code document
Code is a document, not a panel: a 1px Rule Strong border, 6px radius, **no fill**.
- **Header:** the file name on the left; *excerpt · versions stripped · N values redacted* on the right (Mono, 0.75rem, Ink Muted). N is counted from the markers, never typed.
- **Body:** line numbers (3ch, right-aligned, Ink Faint at 60%, not selectable), keys in Ink at 600, values in Ink Muted, comments in Ink Faint.
- **"What was removed" panel:** below a rule, a definition list of each redaction category used in the excerpt and why it was removed.

### Redaction
A fixed-width (9.5ch) solid Ink bar labelled "redacted" in 0.6875rem bold paper-coloured text, so a secret's length never shows. It is a `button` whose `aria-label` reads *redacted: &lt;category&gt;*.
- **Reveal:** drawn in from the left like a marker stroke when it scrolls into view (520ms, 120ms stagger), then the label fades in.
- **Hover/focus:** the bar turns chili and a tooltip (Ink fill, paper text, 8px radius) names the category.
- **Click it four times** and it talks back (an easter egg; it shakes once).

### ADR block
A bordered figure (Rule Strong, 6px): a mono caption with the ADR's number and title on the left and a status pill (999px radius, inset 1px Rule Strong) on the right, then the quoted passage.

### Contact band
Ends every page. A full-width Panel band with a Rule above it, where the page switches into large conversational type:
- the opening line in the Headline voice (max 24ch);
- the email address in Chili Ink with a chili underline that floods the whole word on hover (320ms), text turning On Chili;
- a **copy button** (Panel Strong pill; Chili Soft on hover; Chili with On Chili text when done), and a "Copied. Your move."-style confirmation that wipes in from the left;
- one sentence linking LinkedIn and GitHub (Ink, bold, underline drawing in on hover);
- a live Montpellier clock (tabular numerals), with a night-time message;
- on devices with hover only, a small *Psst. Press ?* hint.

It is the site's only navigation besides the byline. Anything added later (a Writing link, an invitation) is added here, never to a header.

### Intro (first visit only)
A one-second pipeline run on a full-screen paper layer: the name, then *build ✓ test ✓ deploy ✓* ticking with chili checks over a 2px chili progress bar, then the layer wipes up (560ms, state easing) and the claim's words settle in one after another (24ms stagger, a 6px blur clearing). Any key or click skips it. It plays once per session (`sessionStorage`) and **never** under reduced motion.

### Page transitions
Cross-document View Transitions on real page loads. The old page exits up 12px (160ms, exit easing); the new page enters from 18px below (460ms, entrance easing); a proof-list title morphs into the case-study title (560ms). Browsers without support load the page normally.

### Keyboard, toast and easter eggs (human temperature only)
- `j`/`k` move through the proof list on the home page and through the sections of a case study; `?` opens the shortcuts panel (bottom-left, 18rem, floating panel shadow).
- Typing `ship` shows a toast: Ink fill, paper text, 12px radius, bottom-left, with a chili timer bar along its bottom edge (2.4s).
- A console greeting.
- None of them ever appears inside the reasoning of a case study.

### Link-preview card
1200×630, light, in Atkinson. The domain with a chili dot, the support's icon and label, the title, the summary, the byline, and *build ✓ test ✓ deploy ✓* along the bottom. At chat-unfurl size the summary can't be read, so the title and byline carry the card: **keep titles short.**

### Focus
Every interactive element: `outline: 2px solid` chili, offset 3px (2px on buttons and redactions), radius 4px. Never removed.

## 6. Do's and Don'ts

### Do:
- **Do** use chili only where a person is: email, focus, hover feedback, the byline and map dots, the intro, the toast.
- **Do** give every animation a final state, and jump to it under `prefers-reduced-motion`.
- **Do** show code as a bordered document with line numbers and a "What was removed" panel.
- **Do** keep redaction bars fixed-width, whatever they replace.
- **Do** end every page with the contact band, and add later links to it rather than to a header.
- **Do** keep the text column at 38–40rem.

### Don't:
- **Don't** number anything for structure, or group the proof list under headings.
- **Don't** put chili inside a case study's prose, code, numbers or artifacts.
- **Don't** use monospace for labels, headings or "technical" flavour.
- **Don't** add a menu, a header nav, a project grid, logo walls, stack badges, star counts, a CV download or availability banners.
- **Don't** fill code blocks with a dark panel; they are documents.
- **Don't** use bounce or elastic easing, or let an interaction run longer than 450ms.
- **Don't** let the intro play twice in a session, or at all under reduced motion.
- **Don't** use Inter, IBM Plex, Newsreader or any second typeface.
