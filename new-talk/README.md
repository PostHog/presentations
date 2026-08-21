# {{ Talk title }} — skeleton

A **skeleton deck** to fill in for the talk. Same slide engine and side-nav
thumbnail rail as the other decks in this repo (`deck-stage.js`).

> ⚠️ Placeholder. Directory is named `new-talk/` for now — rename it to an
> event/topic slug (e.g. `posthog-atx-builders/`) once the content lands, and
> update the `<title>` and the "Slides ·" link on the closing slide to match.

## Edit it

Everything is in [`index.html`](./index.html):

- Each `<section data-label="…">` is **one slide** and **one thumbnail** in the
  left rail. Duplicate a section to add a slide; delete one to remove it.
- Text in `{{ double braces }}` and muted `.ph` spans are placeholders — swap
  them for real copy.
- `.slot` dashed boxes are where images/diagrams go: drop a file in `assets/`
  and `<img src="assets/…">` it in.
- Don't set `width`/`height`/`position` on a `<section>` — the component sizes
  each slide for you (canvas is 1280×720).

Slide types already stubbed: title · who-am-I · agenda · section divider ·
bulleted content · statement · text + visual split · code · results (stat
cards) · takeaways · thanks/questions.

## View it

Static, no build step. From the repo root:

```bash
python3 -m http.server 8000
# open http://localhost:8000/new-talk/
```

Navigate with ← → / Space. `S` speaker notes, `F` fullscreen, `O` overview.
Drag the rail's right edge to resize it; right-click a thumbnail to
skip/move/delete. Export to PDF via the browser's Print (one page per slide).

## Style

Follows the repo's [`PRESENTATION_GUIDELINES.md`](../PRESENTATION_GUIDELINES.md):
PostHog cream→cool gradient (`#FFF1D5 → #DAE0EB`), sentence-case titles, accent
orange pointing at one thing per slide. Fonts (IBM Plex) are vendored under
`vendor/` so the deck works fully offline.

## Publish to the landing page (when content is ready)

1. Screenshot the title slide → `thumbnail.png` (16:9).
2. Add a card to the root [`index.html`](../index.html) and a row to the repo
   [`README.md`](../README.md) table.
