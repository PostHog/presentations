# PostHog Slide & Presentation Style Guide

An ad-hoc style guide for building slides and decks in PostHog's visual language.

There is **no single official slide style guide** in this repo. This file combines:

1. PostHog's public brand handbook (the source of truth — see links below)
2. The app design system tokens in [`system.md`](./system.md)

For polished, external-facing decks, **use the Graphics Team's Figma Slides templates** — don't rebuild the brand from scratch. This guide is for when you're drafting your own slides (internal decks, talks, quick pitches) and want them to feel like PostHog.

There is also a **code-backed slide system** in the `posthog.com` repo (the schema-driven sales/demo presentations). If you're building web-rendered slides, it gives you exact, copyable specs — see [Code-backed slide specs (posthog.com)](#code-backed-slide-specs-posthogcom) below.

---

## TL;DR rules

- **One idea per slide.** Fewer words. If a slide needs a paragraph, it's two slides.
- **Don't look like every other B2B SaaS deck.** No generic gradient-on-white templates, no stock photography, no clip-art icons.
- **Lead with the specific, not the mission statement.** Open on the concrete point, not "Our vision is…".
- **Color guides attention — it doesn't decorate.** Mostly neutral surfaces; use accent color to point at the one thing that matters on the slide.
- **Use the hedgehog (Max) and Squeak font for personality moments** — not on every slide, and never AI-generated hedgehog art.
- **Sentence case** for titles ("How activation works", not "How Activation Works").
- Light mode by default. If you ship a dark version, produce both.

---

## Tooling

- **Polished / external decks:** [Figma Slides](https://posthog.com/handbook/brand/in-practice#presentations) with Graphics Team templates. Request access / templates in `#design-review`.
- **Informal / internal decks:** speed over perfection — reuse an existing template, don't polish.
- Brand assets (logos, fonts, hedgehog art): [Brand assets handbook](https://posthog.com/handbook/company/brand-assets). Team members get the Art Library via the Account menu on posthog.com.

---

## Colors

Constrained palette by design. Use **opacity** to vary a color before reaching for a new one. From [`system.md`](./system.md):

### Brand

| Token          | Hex                          | Use                                                    |
| -------------- | ---------------------------- | ------------------------------------------------------ |
| Brand red      | `#F54E00` / `#f54e00`        | **Branding moments only** — not status, not body emphasis |
| Brand blue     | `#1D4AFF`                    | Brand accent                                           |
| Brand yellow   | `#F9BD2B`                    | Brand accent / highlights                              |
| Brand key      | `#000` (light) / `#fff` (dark) | Logo wordmark, high-contrast text                    |

> ⚠️ Reserve brand red (`#F54E00`) for branding. Don't use it as a generic "error/attention" color on slides — it reads as PostHog, not as a warning.

### Accent (for "look here")

- Light context: orange `HSL(19, 100%, 48%)`
- Dark context: yellow `HSL(43, 94%, 57%)`

Use accent sparingly — one focal point per slide.

### Neutrals / surfaces

Keep most of the slide neutral and let content carry it:

- Light backgrounds: near-white / warm gray (`bg-primary` = posthog-3000-50, surfaces in white → posthog-3000-150)
- Dark backgrounds: neutral-cool 850–950
- Primary text: near-black (`neutral-950`) on light, `neutral-100` on dark
- Secondary text: `neutral-750` / `neutral-350`

### Semantic (status, only when you genuinely mean status)

| Meaning  | Hex       |
| -------- | --------- |
| Danger   | `#db3707` |
| Warning  | `#f7a501` |
| Success  | `#388600` |

### Charts / data viz

- 15-series palette (`--data-color-1`…`--data-color-15`). Use **hex**.
- One chart = one point. Strip chart junk (extra gridlines, redundant legends).
- Label directly on the chart instead of relying on a legend when you can.
- Use opacity before introducing a new color.

---

## Typography

Three brand typefaces, each with a strict role:

| Font           | Role on slides                                                                 |
| -------------- | ------------------------------------------------------------------------------ |
| **Open Runde** | Default — titles, section headers, and most text. Bold for titles, Semibold for big headers, Regular for body. |
| **Squeak**     | Big marketing/personality headlines **only**. **Always UPPERCASE, Bold.** Never for body, subtitles, or descriptions. Pair with hedgehog art or an obviously informal moment. |
| **Loud Noises**| Quotes **inside hedgehog artwork only**. Uppercase. Don't use it as a general display font. |

If Open Runde isn't available in your tool, fall back to **Inter** (the app uses Inter / system sans; titles in-app use MatterSQ).

### Rules

- **Sentence case** for headings.
- **Left-align** body text by default.
- No decorative fonts beyond the three above.
- Fewer words per slide beats smaller font — if it doesn't fit at a readable size, cut copy.

### Rough size guidance (adapt to your tool)

Mirrors the app heading scale (h1 ≈ 1.75rem at 14px base):

- Slide title: large and bold (think 36–44pt)
- Section / subhead: clearly smaller than the title
- Body: comfortably readable from the back of a room — if in doubt, bigger and less text

---

## Logo usage

- **SVG always** — it scales losslessly. Use PDF for print.
- Variants:
  - **Standard** (horizontal, gradient): default
  - **Dark wordmark**: on light backgrounds
  - **White wordmark**: on dark backgrounds
  - **Logomark only**: small contexts (favicons, avatars, chest-logo merch)
  - **Stacked**: tight horizontal space
  - **4-color**: print only
- **Never** stretch, skew, rotate, recolor, or add effects to the logo.
- Maintain clear space ≈ the height of the "P" in PostHog around it.
- Full logo min ~80px wide; below that use the logomark.
- Don't place it on a busy photo without enough contrast (use the white-only version on dark/busy backgrounds).
- No animation without approval.

---

## Imagery, hedgehogs & icons

- **Max the hedgehog** is core identity — use thoughtfully, not on every slide. **No AI-generated hedgehog art.** Modifications need approval.
- Illustrations: custom, simple, expressive, bold graphic style with **thick outlines** and the signature **hard drop shadow**. Avoid trendy SaaS gradients, stock art, and AI imagery.
- Icons: outlined vector style, ~1.5px borders, consistent with the product. Icons should complement labels (and stand alone when used without text).
- Photography: candid and authentic over staged; real people over stock; real situations over constructed ones. No fake data in mockups.

### Product screenshots on slides

- Replace real customer data with **synthetic data** before sharing externally.
- Export at **@2x** for crispness.
- If it'll be published, produce **both light and dark** versions.

---

## Voice on slides

- Casual but authoritative — never corporate-congratulatory.
- Clear over clever. Say the specific thing.
- Honest about limitations — if there's a gotcha, name it.
- Every deck (like every page) should drive toward **one clear next action**.

---

## Quick checklist before you present

- [ ] One idea per slide; could any slide be cut or split?
- [ ] Titles in sentence case, fewer words, readable from the back row
- [ ] Accent color used to point at exactly one thing per slide
- [ ] Brand red used only for branding, not as a status color
- [ ] Logo is SVG, untouched, with clear space, correct variant for the background
- [ ] Screenshots are synthetic-data, @2x, light/dark as needed
- [ ] Squeak only for uppercase personality headlines, never body
- [ ] Doesn't look like a default B2B SaaS template

---

## Code-backed slide specs (posthog.com)

The website repo (`../posthog.com`, a Gatsby site) ships a real, schema-driven slide system — the personalized sales/demo presentations served at `/for/{persona}` and `/for/{company-domain}/{persona}`. Content lives in JSON; rendering is React templates. If you're building web-rendered slides, these are the exact, copyable specs.

**Where it lives** (paths relative to `../posthog.com`):

| Path                                          | Contents                                              |
| --------------------------------------------- | ----------------------------------------------------- |
| `src/components/Presentation/`                | Container, fullscreen mode, responsive scaling        |
| `src/components/Presentation/ScalableSlide.tsx` | Slide canvas + scale-to-fit logic                    |
| `src/components/Presentation/Templates/`      | The 5 slide templates                                 |
| `src/components/Presentation/README.md`       | System docs + JSON schema                              |
| `src/presentations/*.json`                    | Per-persona slide content (`default`, `product-engineers`, `product-managers`, `product-directors`, `engineering-managers`, plus `dream-customers/`) |
| `src/pages/for/[...path].tsx`                  | Router, template selector, Clearbit + Salesforce enrichment |
| `contents/handbook/engineering/posthog-com/presentations.mdx` | Handbook docs for the feature          |

### Canvas dimensions

Defined in `ScalableSlide.tsx:13-14`:

- **Desktop / landscape:** **1280 × 720** (16:9) — `baseWidth`/`baseHeight`
- **Mobile / portrait:** **720 × 1280** (9:16, `aspect-[9/16]`)
- Slides render at the base size and scale to fit their container while preserving aspect ratio.

### Signature gradient

Slide backgrounds use a warm-beige → cool top-to-bottom gradient (verified in the templates):

- `from-[#FFF1D5]` → `to-[#DAE0EB]` (overview / stacked / booking)
- `from-[#FFF1D5]` → `to-white` (columns)
- `from-[#FFF1D5]` → `to-[#fff]` (pricing)

`#FFF1D5` = warm beige, `#DAE0EB` = soft purple-blue. Text on these is black.

### The 5 templates

| Template   | Use                                   | Key props                                                              |
| ---------- | ------------------------------------- | --------------------------------------------------------------------- |
| `stacked`  | Title + description, optional image; overview/hero slide shows the Hogzilla mascot | `title`, `description`, `descriptionWidth`, `image`, `imageDark`, `imageAlt`, `bgColor`, `textColor` |
| `product`  | Single-product showcase (pulls icon/color/screenshots via `useProduct()`) | `handle`, `screenshot`, `screenshotClasses`, `title`, `description`, `contentWidth`, `bgColor`, `textColor` |
| `columns`  | 2–4 items side by side                | `title`, `description`, `content[]` (each `{ handle, title, description, screenshot }`), `bgColor`, `textColor` |
| `pricing`  | Pricing tiers (free-tier cards + accordion) | `title`, `description`, `image`, `imageDark`                     |
| `booking`  | CTA + embedded scheduler iframe       | `title`, `description`, `teamSlug`, `salesRep`, `bgColor`, `textColor` |

### Type scale used in the templates (Tailwind)

- Slide / hero title: `text-5xl font-bold leading-tight`
- Section / template title: `text-4xl`–`text-5xl font-bold`
- Body large: `text-3xl` · medium: `text-2xl` · small: `text-xl`
- Long-form copy uses `prose`
- Content padding `px-8 pt-8` (32px); column gaps `@2xl:gap-8` (32px)
- Screenshots: `rounded-md` with `shadow-2xl` / `shadow-lg`

### JSON config shape

```json
{
  "name": "Persona name",
  "config": { "thumbnails": true, "notes": true, "form": true, "teamSlug": "sales-cs" },
  "slides": {
    "overview": {
      "template": "stacked",
      "name": "Shown in thumbnail rail",
      "title": "Heading — supports {companyName}",
      "description": "<p>HTML</p>",
      "bgColor": "…",
      "textColor": "text-…"
    }
  }
}
```

`dream-customers/*.json` slides can `inherit` another persona's slide by `slideKey` and override individual fields. `{companyName}` / `{companyLogo}` are substituted at render time (Clearbit-enriched on the `/for/{domain}/…` route).

> Note: this system is purpose-built for the website's web-rendered sales decks. For a normal slide deck, the Figma Slides templates above are the right tool — but these dimensions, the `#FFF1D5 → #DAE0EB` gradient, and the type scale are a solid, on-brand starting point to copy.

---

## Sources

- [Visual identity — Handbook](https://posthog.com/handbook/brand/visual-identity)
- [Brand in practice (incl. presentations) — Handbook](https://posthog.com/handbook/brand/in-practice)
- [Logos & hedgehogs / brand assets — Handbook](https://posthog.com/handbook/company/brand-assets)
- [Style guide (writing) — Handbook](https://posthog.com/handbook/content/posthog-style-guide)
- [Custom presentations feature — Handbook](https://posthog.com/handbook/engineering/posthog-com/presentations)
- Code-backed slide system: `../posthog.com/src/components/Presentation/`
- [App design system tokens](./system.md)
