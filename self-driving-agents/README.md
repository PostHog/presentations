# The path to self-driving agents

Marco G · **The Self-Driving Product** (Merge × PostHog × Redis technical
talks, hosted by Merge.dev in NYC).

How PostHog gets from tracing to *self-driving* — using everything a product
knows about itself (analytics, logs, errors, infra, code) to watch, diagnose,
and eventually fix it. Structured **Why → How → What**.

Same side-nav thumbnail rail as the other decks, via the shared
[`../lib/deck-stage.js`](../lib/deck-stage.js) engine.

## Shared resources (not vendored per-deck)

This deck pulls its engine, fonts, and logos from shared repo-level paths
rather than copying them in — so it must be served from the repo root:

- Engine → [`../lib/deck-stage.js`](../lib/deck-stage.js)
- Fonts → [`../lib/fonts/`](../lib/fonts/) (IBM Plex)
- Logo / logomark → [`../img/`](../img/)

## Edit it

Everything is in [`index.html`](./index.html):

- Each `<section data-label="…">` is **one slide** and **one thumbnail** in the
  left rail. Duplicate a section to add a slide; delete one to remove it.
- A few things are still placeholders to finalize — search the file for `{{ }}`
  / muted `.ph` spans: the **event date** (left off the title slide), a
  **github/x handle** on the closing slide, and the **QR** slot (point it at
  the published slides URL).
- `.slot` dashed boxes are where images/diagrams go: add an `assets/` folder
  here, drop the file in, and `<img src="assets/…">` it in (e.g. a portrait on
  slide 2).
- Don't set `width`/`height`/`position` on a `<section>` — the component sizes
  each slide for you (canvas is 1280×720).

Reusable slide types in the file: title · who-am-I · agenda · section divider ·
quote · statement · bulleted content · 3-step flow · 4-rung ladder · callout ·
takeaways · thanks.

## View it

Static, no build step. From the repo root:

```bash
python3 -m http.server 8000
# open http://localhost:8000/self-driving-agents/
```

Navigate with ← → / Space. `S` speaker notes, `F` fullscreen, `O` overview.
Drag the rail's right edge to resize it; right-click a thumbnail to
skip/move/delete. Export to PDF via the browser's Print (one page per slide).

## Style

Follows the repo's [`PRESENTATION_GUIDELINES.md`](../PRESENTATION_GUIDELINES.md):
PostHog cream→cool gradient (`#FFF1D5 → #DAE0EB`), sentence-case titles, accent
orange pointing at one thing per slide. Type is IBM Plex Sans/Mono, loaded from
the shared [`../lib/fonts/`](../lib/fonts/) (self-hosted — no external calls).
