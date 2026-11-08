# View Transitions on real page loads, not a client router

Navigation is real page loads. The title morph between the proof list and a case study uses native cross-document View Transitions (`@view-transition { navigation: auto }` and a shared `view-transition-name`), so it is CSS only. Chromium and Safari support it; Firefox support is partial. Browsers without support simply load the page, which matches the rule that motion is an enhancement.

## Considered Options

- **Astro's `<ClientRouter />`.** It would morph in every browser, but every script (the intro, the clock, the reveals, the shortcuts, analytics) would have to follow the `astro:page-load` / `astro:before-swap` lifecycle. That is a class of bugs this site doesn't need. Switching later is a one-line change plus that lifecycle work.

## Consequences

Every client script initialises on a normal page load and holds no state across pages, except the intro's once-per-session flag in `sessionStorage`.
