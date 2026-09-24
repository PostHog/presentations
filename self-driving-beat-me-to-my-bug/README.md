# The self-driving loop beat me to my own bug

Jake Ruth · **September Demo Day ft. PostHog** (AI Tinkerers NYC, hosted at
Veris AI), 23 September 2026.

On 21 September a funnel enum crashed the PostHog AI conversation mirror in
production. The self-driving loop picked it up, researched it in a sandbox,
and opened a pull request. I was 42 seconds into fixing the same bug by hand
and didn't know the loop existed on it. My fix was the identical one-line
change. I binned my branch and the loop's PR is what merged.

## Watch it

[Recording of the talk](https://drive.google.com/file/d/1pyvAgaV-9Y42x6ipCDnvmtg6OCGsfiKB/view?usp=sharing)
(6m18s). A QuickTime screen recording from the laptop that drove the demo, so
the picture is exact and the room audio is rough. Not committed here because
nothing else in this repo is a video.

## There is no deck

AI Tinkerers bans slides. Their submission form is explicit: *"NO slides. NO
pitches. NO market/business overview,"* and their guidance adds *"if a company
name appears, it should be in a stack trace."* So this entry is not a deck,
and it is the only entry in this repo that isn't.

The talk was eight browser tabs, walked in order, in about five minutes:

| # | Tab | Point |
| - | --- | ----- |
| 1 | [`assets/balloon-meme.jpg`](./assets/balloon-meme.jpg) | What I was doing before any of this |
| 2 | [`assets/slack-card.png`](./assets/slack-card.png) | The ping. A bug report and a PR for code I wrote, with me as suggested reviewer |
| 3 | [`index.html`](./index.html) | The timeline. The only thing authored for the talk |
| 4 | [The report](https://us.posthog.com/project/2/inbox/01a0c4c4-cd5f-7ca8-ba21-8d6a00d2c1a3) | What the research sandbox actually did |
| 5 | [PR #103903](https://github.com/PostHog/posthog/pull/103903) | Two commits, both the bot's. The fix it shipped, and the fix it rejected |
| 6 | [`products/signals/ARCHITECTURE.md`](https://github.com/PostHog/posthog/blob/master/products/signals/ARCHITECTURE.md) | It's open source. 1,700 lines of the real thing |
| 7 | [`scout-patterns.md`](https://github.com/PostHog/posthog/blob/master/products/signals/skills/authoring-scouts/references/scout-patterns.md) | 23 things you can point a scout at. Bugs are the boring case |
| 8 | [`assets/batman-meme.jpg`](./assets/batman-meme.jpg) | Left up during Q&A |

## The timeline

[`index.html`](./index.html) is one hand-authored SVG, no build step and no
JavaScript. Two lanes on a shared clock: the loop in orange, me in grey until
12:51:12 and blue after, because the loop had been working the problem for 34
minutes before I started. The pipeline strip above it is the six stages every
report goes through.

Every timestamp on it came from a primary source, not from memory:

- Loop events: the PostHog API (the report, its 13 artefacts, both task runs)
- My events: my local `git reflog` and the commit objects
- The identical fix: `git diff` across both branches
- The Slack ping: the message timestamp, converted to EDT
- The merge: the GitHub API

One gap is deliberately not drawn. The report was ready at 12:29:27 and the
coding agent picked it up at 12:44:31, and nothing in the report, the task
records or the run records accounts for those 15 minutes. Confirming it needs
Temporal Cloud history, so the timeline leaves it blank rather than guessing.

## View it

Static, no build step. From the repo root:

```bash
python3 -m http.server 8000
# open http://localhost:8000/self-driving-beat-me-to-my-bug/
```

The SVG scales to the window. It's sized for a laptop screen driving a
projector.

## Style

Follows [`PRESENTATION_GUIDELINES.md`](../PRESENTATION_GUIDELINES.md): brand
orange `#F54E00` and brand blue `#1D4AFF` as the two lane colors, Inter (the
documented Open Runde fallback), sentence case, accent pointing at one thing.
The hedgehog is `frontend/src/assets/hedgehog/self-driving-hog.png` from the
main repo, cropped. It is not AI-generated.
