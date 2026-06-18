# Stateless ClickHouse for stream processing

Slide deck for the Altinity OSA meetup @ PostHog. Built with [reveal.js](https://revealjs.com/), styled from PostHog's brand spec (`.interface-design/slides.md` + `system.md`) and the code-backed slide specs (1280×720 canvas, `#FFF1D5 → #DAE0EB` signature gradient, Open Runde → Inter, borders-first + hard drop shadow).

## Run it

```bash
npm install          # one-time: pulls reveal.js locally
npm start            # serves at http://localhost:8000  (npx serve)
# or, no-deps fallback:
npm run serve        # python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Present

- **Arrows / Space** — navigate
- **S** — speaker-notes window (every slide has notes; story beats live there too)
- **F** — fullscreen · **O** — slide overview · **Esc** — exit
- **?** — keyboard help · **B** — pause (black) screen
- Export to PDF: open <http://localhost:8000/?print-pdf> and "Save as PDF" (landscape, no margins, background graphics on).

## Structure

`index.html` is the deck (one `<section>` per slide). Theme in `css/posthog-theme.css`; reveal config in `js/deck.js`.

Reusable classes: `.kicker` (orange label), `.card` / `.card.accent` / `.card.data` (hard-shadow box), `.pill` (`.data` blue / `.ingest` orange), `.node` (diagram box: `.kafka` / `.ingest` / `.data`), `.pipe-row` (horizontal pipeline), `.gotcha` (limitation callout), `.stat`, `.cols`, `.meme-slide` / `.meme-img` / `.meme-tag`, `.hog` (corner Max-the-hedgehog accent).

Max the hedgehog (from posthog.com, downloaded to `img/hogs/`) appears on the title and each section divider — explorer (title), detective/lost (problem), builder (how it works), swole (in production), security/guard (what we learned). Transparent PNGs so they sit cleanly on the dark divider backgrounds; "The insight" divider is intentionally left clean.

Altinity's [clickhouse-operator](https://github.com/altinity/clickhouse-operator) is credited on the statelessness slide (our K8s ingestion pods are `ClickHouseInstallation` CRDs) and in the closing thanks.

## Memes

Real memes generated via the [Imgflip API](https://imgflip.com/api) (same backend as [meme-mcp](https://github.com/haltakov/meme-mcp)) and **downloaded into `img/`** so the deck works offline — no network at the venue. Slides: This Is Fine (6), Two Buttons (7, on the fork slide), Expanding Brain (8), Drake (12).

`meme-mcp` is also registered as a user-scoped MCP server (`claude mcp add meme -s user … -- npx -y meme-mcp`) for generating more from inside Claude. To regenerate by hand, `POST https://api.imgflip.com/caption_image` with `template_id`, `username`, `password`, and `text0`/`text1` (or `boxes[i][text]` for 3–4 box templates), then download the returned `data.url`. Template IDs: Drake `181913649`, This Is Fine `55311130`, Two Buttons `87743020`, Expanding Brain `93895088`.

## Story slides — all filled in

No `TODO` cards remain.

- **Slide 2** — James Greenhill, Member of Token Burning Staff; trillions of events.
- **Slide 5** — the no-headroom-to-recover war story + why ingestion is expensive (property denormalization into Map + materialized columns).
- **Slide 7** — the inserter: dual-schema maintenance across Go + ClickHouse SQL with subtly drifting types; the `go.mod`-only "never wrote line 3" reveal.
- **Slide 27 (ShuffleHog)** — propdefs (`property-defs-rs`) aggregates definitions keyed by (project, event) and upserts to Postgres; ShuffleHog re-partitions by (project + event) so each key has one consumer, avoiding Postgres tuple-lock contention during the squash.
- **Slide 30 ("Sharp edges")** — the tradeoff is schema/migration management across node roles; far simpler than an inserter service, and the ingestion tiers just added small/medium/events layers to the migration system our topology already required.
- **Slide 31 (results)** — ingestion scales independently from data/query tiers; dedicated query-tier resources → deterministic query performance.
- **Slide 33 (closing)** — contact (@fuziontech), thanks to the ClickHouse team (Ted Kaemming & Dani Escribano), we're hiring.

(33 slides total — three are meme breaks: "this is fine" (6), galaxy brain (8), Drake (12). A "same shape, different sink" contrast slide (26) sets up ShuffleHog.)

## Upgrade the font (optional)

The deck prefers **Open Runde** and falls back to **Inter** (loaded from Google Fonts). To use the real brand font, drop `OpenRunde-*.woff2` into `fonts/` and add `@font-face` rules at the top of `css/posthog-theme.css` — everything already prefers it.
