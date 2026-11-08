# Astro, static output only

The site is built with Astro and deployed as static files; nothing runs at request time. It is a content site with one author, so the choice was between a static-site generator and a hosted CMS. Astro sits on Vite and accepts React islands, which keeps it close to the stack Youri uses everywhere else, and MDX lets prose call components (margin notes, code documents, ADR blocks) inline.

## Considered Options

- **Ghost.** Its strengths are newsletters and memberships, which this site doesn't want, and the design would become a Handlebars theme to fight with.
- **Hugo, Zola.** Go-style templates, far from the rest of Youri's work.
- **Eleventy.** More assembly for the same result.
- **A headless or git-backed CMS** (Payload, Directus, Strapi, Keystatic, Tina, Decap). They solve multi-author editing, which one author working with an agent doesn't need.

## Consequences

- Client JavaScript is plain TypeScript modules in Astro `<script>` tags, with no framework runtime. React islands are allowed later on a page that earns one; `@astrojs/react` is added then, not up front.
- Link-preview cards are generated at build time with Satori and resvg (`/og/[slug].png`), from each page's frontmatter and the local font files. Satori supports flexbox but not grid, and icons must be inline SVG.
- The blog is a later content collection in the same codebase. Its route is created with the first post, not before.
