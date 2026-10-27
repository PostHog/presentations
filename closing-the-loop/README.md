# Merged is not verified

Andy Maguire · **AI Tinkerers Dublin × PostHog: Technical Demo Night**, 28 October 2026.
Talk title: *Closing the loop on self-driving products: some examples from PostHog.*

Most agent demos end at a merged PR with green CI.
This one starts there.
A coding agent fixed slow inbox search on PostHog, the PR merged, and search got slower.
Two days later a scout re-checked production, saw the fix had not held, and filed its own follow-up report.
A different fix merged 2 hours 12 minutes later, and the next re-check confirmed it.

## Not a deck

AI Tinkerers asks for no slides, so [`index.html`](./index.html) is a stepped walkthrough of the real artefacts.
The loop diagram stays on screen and lights up the current step.
A failed re-check draws the arrow back to "Report".

| Keys | Action |
| --- | --- |
| → / space | Next step |
| ← | Previous step |
| N | Speaker notes |
| F | Fullscreen |
| `#n` in the URL | Jump to step n |

Click a screenshot to open it full size.
Each step links to the real inbox report or pull request.
The inbox links need a PostHog login; the PRs are public.

## What it walks through

1. **Inbox search, fixed twice** (screenshots of every step):
   pganalyze alert → report with a predicted 10x gain → [PR #115874](https://github.com/PostHog/posthog/pull/115874) → merged →
   re-check "No longer holds" → follow-up report → [PR #118678](https://github.com/PostHog/posthog/pull/118678) → merged → re-check "Still holds".
2. **The same story as production saw it**: an annotated chart, one arrow per key press.
3. **The redirect that passed its test** ([posthog.com PR #21029](https://github.com/PostHog/posthog.com/pull/21029)): production still served 404s on an untested path.
4. **An AI agent reported a broken MCP tool** ([PR #115678](https://github.com/PostHog/posthog/pull/115678)): fixed in 67 minutes, still fixed a week later.
5. **The numbers** for the last 30 days, and the takeaway.

## Where the numbers come from

Every timestamp comes from the reports, check verdicts and the GitHub API, not from memory.

- **Timeline and verdicts**: the `signals_reports_report` and `signals_report_check_verdicts` warehouse views in PostHog's own project.
- **The chart**: daily `posthog-web-django` database spans for the inbox search count query
  (`SELECT COUNT(*)` on `signals_signalreport` with the `UPPER(title) LIKE` search predicate), from `posthog.trace_spans`.
  Span retention starts on 12 October, so the chart starts on the 13th.
- **The 30-day numbers**: reports whose first PR merged between 27 September and 27 October 2026, joined to the latest verdict per check.

## View it

Static, no build step. From the repo root:

```bash
python3 -m http.server 8000
# open http://localhost:8000/closing-the-loop/
```
