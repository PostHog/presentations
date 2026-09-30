# Stateless ClickHouse for stream processing (Grafana meetup edition)

The Altinity OSA talk ([`../altinity-stateless-clickhouse/`](../altinity-stateless-clickhouse/)), reworked for a Grafana meetup. Same story, plus animated canvas "videos" for the parts that are easier to watch than to read, and two slides on watching a stateless ingestion tier from Grafana.

Everything is still static and offline: reveal.js is vendored, and the animations are plain `<canvas>` + JavaScript with no dependencies.

## Run it

From the repo root:

```bash
python3 -m http.server 8000
# open http://localhost:8000/grafana-stateless-clickhouse/
```

## Present

- **Arrows / Space**: navigate · **S**: speaker notes · **F**: fullscreen · **O**: overview
- **R**: replay the current slide's animation from the start
- Animations only run on the current slide. In overview mode and in `?print-pdf` export, each one is drawn as a representative still frame.

## What's new vs. the Altinity deck

| Slide | Animation (`data-scene`) | What it shows |
| ----- | ------------------------ | ------------- |
| 1 · title | `firehose` | Kafka partitions → three stateless CH pods squashing rows into blocks → three MergeTree shards whose parts merge |
| 6 · new | `contention` | The original problem, replayed: 8 cores on one data node, a dashboard query storm starves ingestion, Grafana-style lag and p95 panels, and the lag never recovers |
| 7 · new | (quote) | Tinybird's Javi Santana describing the same failure from their side: a query takes the CPU, inserts pile up, OOM, data loss |
| 22 · whole path | `pipeline` | A row's full trip (Kafka engine → MV block → Distributed `sipHash64` fan-out → shards), then `kubectl delete pod`: uncommitted rows go back to Kafka, a backlog builds, the rescheduled pod drains it |
| 26 · new | `threads` | `kafka_thread_per_consumer = 0` (one thread, one squashed block) vs `= 1` (four independent flushes) |
| 30 · new | `dashboard` | A Grafana-style dashboard for the ingestion tier: pod-recycle annotations twitch lag, `KafkaMessagesRead` and `DistributedFilesToInsert` while the data nodes' query p95 stays flat |
| 31 · new | (static) | The SQL behind those panels: `system.kafka_consumers` and `system.metric_log` via `clusterAllReplicas`, with Grafana ClickHouse data source macros |
| 34 · new | `shuffle` | ShuffleHog before/after: batch transactions queue on the same Postgres row locks vs one owner per key |
| 35 · Kafka swap | `cutover` | MSK → WarpStream: create the `_ws` leg, shift producers, drain and drop the MSK leg, rows/s into `groups` stays flat |
| 38 · new | (table) | Tinybird's ingestion pain list, each item next to how the stateless tier handles it (duplicates marked as only partly solved) |

Every number in the animations is simulated and labelled as such on the slide. Real metric names, illustrative values.

## Prior art

Slides 7 and 38 lean on Javi Santana's [“I've operated petabyte-scale ClickHouse® clusters for 5 years”](https://www.tinybird.co/blog/what-i-learned-operating-clickhouse) (Tinybird). It's an independent account of the ingestion failure this talk opens with, and a checklist the design is measured against. It's also linked from the closing slide.

The meme slides have no labels or captions. The meme does the work.

## Code

- `js/motion.js`: the engine. A slide opts in with `<canvas data-scene="name" width="W" height="H">` (logical size on the 1280×720 slide). The backing store is scaled by devicePixelRatio × reveal's scale, so it stays crisp on a projector. Scenes are `setup(env) → { update(dt, t), draw(ctx, t) }`. `data-still="12"` picks which second of the simulation becomes the still frame.
- `js/scenes.js`: the seven scenes, drawn in the deck's palette (borders first, hard `0 3px 0` shadows). The Grafana panels deliberately use Grafana's dark panel colours as a nod to the hosts.
- Everything else (`css/`, `img/`, `vendor/`) is copied from the Altinity deck. See its README for the memes, hedgehogs and the story-slide notes.

## Before presenting

The speaker note on the pipeline slide flags one thing to confirm: "nothing is lost when a pod dies" holds when the Distributed INSERT is synchronous. With async Distributed inserts, queued files sit on the pod's local volume until they're sent.
