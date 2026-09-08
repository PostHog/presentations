# Agentic feature discovery

Marco G · **Agentic PM Kickoff** (PostHog × Linear × Supabase × Dreambase,
San Francisco — [luma.com/posthog-tpmz](https://luma.com/posthog-tpmz)).

How agents are powering product discovery, not just delivery. The PM-audience
sibling of [`../self-driving-agents/`](../self-driving-agents/): engineers
supervise the delivery agents, PMs supervise the discovery agents, and building
the context pipelines (sources, evals, signals) that feed them is the new PM
craft. Grounded in one end-to-end example: a model-benchmarking site's
assistant that answers benchmark questions but can't answer "what does the
industry think?" — caught by a completeness eval, reported, and fixed.

Same slide engine and side-nav thumbnail rail as the other decks in this repo,
shared at [`../shared/deck-stage.js`](../shared/deck-stage.js).

## Edit it

Everything is in [`index.html`](./index.html):

- Each `<section data-label="…">` is **one slide** and **one thumbnail** in the
  left rail. Duplicate a section to add a slide; delete one to remove it.
- Don't set `width`/`height`/`position` on a `<section>`: the component sizes
  each slide for you (canvas is 1280×720).

## View it

Static, no build step. From the repo root:

```bash
python3 -m http.server 8000
# open http://localhost:8000/agentic-pm/
```

Navigate with ← → / Space. `S` speaker notes, `F` fullscreen, `O` overview.
Drag the rail's right edge to resize it; right-click a thumbnail to
skip/move/delete. Export to PDF via the browser's Print (one page per slide).

## Style

Follows the repo's [`PRESENTATION_GUIDELINES.md`](../PRESENTATION_GUIDELINES.md):
PostHog cream→cool gradient (`#FFF1D5 → #DAE0EB`), sentence-case titles, accent
orange pointing at one thing per slide. Fonts (IBM Plex) and the slide engine
are shared at [`../shared/`](../shared/) so every deck stays in sync and works
offline.
