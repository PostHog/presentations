# PostHog presentations

Talks and presentations from the PostHog team, hosted as static reveal.js decks.

**Live site:** https://posthog.github.io/presentations/

## Presentations

| Talk | Venue | Path |
| ---- | ----- | ---- |
| Stateless ClickHouse for stream processing | Altinity OSA meetup | [`altinity-stateless-clickhouse/`](./altinity-stateless-clickhouse/) |

## Viewing locally

Everything is static — no build step. Serve the repo root with any static server:

```bash
python3 -m http.server 8000
# open http://localhost:8000           (landing page)
# open http://localhost:8000/altinity-stateless-clickhouse/   (a deck)
```

reveal.js is vendored per-deck under `vendor/reveal/`, so decks work fully offline (handy when the venue wifi doesn't).

Deck controls: arrows/space to navigate, **S** speaker notes, **F** fullscreen, **O** overview, **Esc** to exit, **?** for help. Export to PDF by appending `?print-pdf` to a deck URL.

## Adding a presentation

1. Create a new top-level directory, e.g. `my-talk/`.
2. Drop in a self-contained reveal.js deck (vendor reveal.js under `my-talk/vendor/reveal/` so it stays offline-capable — copy it from an existing deck).
3. Add a `thumbnail.png` (16:9, ~960px wide — a screenshot of the title slide works).
4. Add a card to the landing `index.html` and a row to the table above.
5. Open a PR. GitHub Pages publishes from `main` on merge.

### Styling

Read [`PRESENTATION_GUIDELINES.md`](./PRESENTATION_GUIDELINES.md) first — it's the authoritative PostHog slide & presentation style guide (colors, typography, voice, do's and don'ts), with the app design tokens in [`system.md`](./system.md). It's the spec to follow when generating a new deck.

In short: cream→cool gradient background (`#FFF1D5 → #DAE0EB`), Open Runde (Inter fallback), borders-first with the signature hard drop shadow, sentence case, accent color points at one thing per slide, 1280×720 canvas. See an existing deck's `css/` for reusable component classes that already implement this.

## License

Code in this repo is MIT licensed (see [`LICENSE`](./LICENSE)). reveal.js is MIT (its license is vendored alongside each copy). PostHog brand assets and hedgehog artwork are © PostHog.
