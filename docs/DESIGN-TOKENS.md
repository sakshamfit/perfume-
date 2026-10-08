# Design tokens & system

Everything in this file was read out of `app/globals.css` / `app/page.tsx`. It is the cheat-sheet for re-skinning the same structure into another brand — swap these values and the whole site changes identity without touching a line of motion code.

---

## 1. Custom properties (the only token layer that exists)

```css
:root {
  --cream: #faf1df;   /* page background, ivory */
  --peach: #eed0b7;   /* warm accent, card wash */
  --ink:   #422c20;   /* body text on light, dark surfaces */
  --amber: #a5582d;   /* links, emphasis, hover fills */
  --muted: #806b59;   /* secondary copy, inactive tab labels */
  --serif: Editorial, Georgia, serif; /* all display + headings */
  --sans:  Maison, Arial, sans-serif; /* UI text, labels, buttons */
}
```

Derived values used in the stylesheet as literal alpha-hex rather than tokens (intentional — they are per-surface, not brand):

| Literal | Meaning | Where |
| --- | --- | --- |
| `#422c2030` | ink @ 19% — hairlines, input borders | `.footer-bottom`, `.quantity`, `.note-tabs` |
| `#422c2035` | ink @ 21% — tab underline baseline | `.note-tabs` |
| `#faf1dfdb` | cream @ 86% — floating tag plate | `.card-tag` |
| `#38271ce0` | warm brown @ 88% — scrolled header | `.header.is-scrolled` |
| `#f9e8d85c` | peach @ 36% — ghost typography | `.signature-ghost` |
| `#ffffff60` | white @ 38% — pill dot ring | `.pill-dot` |
| `#a75e38` | focus ring | `:focus-visible` |
| `#785036` | amber-dark hover | `.pill.solid:hover` |
| `#35201565` | text shadow over photography | `.header` |

> If you need dark mode, this is the moment to promote those literals into `--line`, `--plate`, `--ghost`, `--ring` tokens and drive `prefers-color-scheme` off the pair.

---

## 2. Type

**Fonts are self-hosted OTF — no network request, no `next/font`.**

```css
@font-face { font-family: Editorial; src: url("/fonts/editorial-regular.otf") format("opentype"); font-display: swap; font-weight: 400 700; }
@font-face { font-family: Editorial; src: url("/fonts/editorial-italic.otf"); font-display: swap; font-style: italic; }
@font-face { font-family: Maison;    src: url("/fonts/sans-regular.otf");     font-display: swap; }
```

`font-weight: 400 700` on a single file is a **variable-range declaration**: it tells the browser one file covers 400–700, so synthetic bolding is avoided. It only behaves that way if the OTF really is variable; otherwise the browser picks the nearest instance. Keep the fallback stack (`Georgia`, `Arial`) so the page is legible before swap.

| Role | Rule | Notes |
| --- | --- | --- |
| Hero title | `clamp(45px, 4.3vw, 80px)`, `line-height: 0.99`, `letter-spacing: -0.035em` | second line is a `<strong>` with `display: block`, `font-weight: 400`, `-0.045em` — the "bold that isn't bold" trick |
| Section statement | `clamp(33px, 3.55vw, 60px)`, `1.02` line-height, `-0.035em`, `max-width: 780px` | split into `.statement-word` spans for the opacity scrub |
| Ghost wordmark | `.hero-wordmark 34.5vw → 43.5vw @ ≥1700px`, `.signature-ghost 54vw`, `.footer-wordmark 33.6vw → 42vw` | `line-height: 0.78`, `letter-spacing: -0.075em`, `bottom: -0.11em`, `pointer-events: none`, `aria-hidden` |
| Eyebrow | `12px`, `uppercase`, `letter-spacing: 0.1em`, `line-height: 1.4` | section labels and `01 / …` indexes |
| Card tag | `11px`, `line-height: 1`, on a pill plate | `.card-tag` |
| Nav | `12px`, `uppercase`, `gap: 40px`, `height: 73px` | underline sweep via `:after` + `scaleX()` |
| Body | `16px` on `body`, `--sans` | `-webkit-font-smoothing: antialiased` |
| Footer meta | `10px`, `letter-spacing: 0.08em` | `.footer-bottom` |

Scaling law used throughout: display sizes are `vw` with `em`-based negative tracking, so as the type grows the tracking tightens proportionally — that's what holds it together from 360 px to 4K.

---

## 3. Space, shape and rhythm

| Value | Use |
| --- | --- |
| `106px` header height → `80px` when `.is-scrolled` | plus `scroll-padding-top: 100px` on `html` so anchor targets clear it |
| `55px` min-height on `.pill` | tap-target floor for every CTA |
| `100px` pill radius / `40px` toast radius | fully-rounded controls; nothing else is rounded |
| `1px solid` hairlines at 19–21% alpha | all separators and input borders |
| `20px` gap in `.scent-grid`, `55px` in `.journal-grid` | grids use `align-items: start`, so the stagger offsets read as composition rather than misalignment |
| `1fr 140px 1fr` grid | header: logo column fixed, nav columns absorb the difference |
| `padding-bottom: 140px` on `.scent-grid` | the breathing room the pinned next section scrolls into |

Layout is deliberately **not** on the Tailwind spacing scale — it's optical (25 / 66 / 85 / 140 px). Converting to utilities means mapping to `gap-5`, `pt-[66px]`, `pb-32` and accepting drift.

---

## 4. Motion tokens

| Value | Where | Why |
| --- | --- | --- |
| `1.25s cubic-bezier(0.76, 0, 0.24, 1)` | curtain lift | expo-in-out; `visibility 0s 1.3s` removes it from the a11y tree only once it's off-screen |
| `1800 ms` | `ready` timer | curtain ceiling — treat it as a ceiling, not a wait |
| `Lenis duration: 1.05` | smooth scroll | below ~1.2 s stays responsive on long pages; above it the page feels drunk |
| `scrub: 0.6 / 0.8 / 1 / 1.2` | hero copy / cards / world / photo | lower = tighter coupling to the wheel; 1.2 reads as weight |
| `stagger: 0.12` | statement words | under 0.08 becomes a blur, over 0.2 reads as typing |
| `1.2s power3.out` | `.reveal-line` masks | one-shot entrances get a named ease; scrubs always use `ease: "none"` |
| `0.25 / 0.35 / 0.5 s` | tab colour, header background, pill-dot rotation | UI feedback ≤0.35 s; decorative transforms can be slower |
| `3200 ms` | toast dismissal | long enough to read a sentence, short enough not to block |
| `150 / 260 / 170 / 240` px | `.scent-card` start offsets | the entire "asymmetric editorial" look in four numbers |

Reduced-motion contract: `matchMedia("(prefers-reduced-motion: reduce)")` skips the whole GSAP/Lenis effect, sets `ready` immediately, and switches `scrollTo` to `behavior: "instant"`; a matching `@media (prefers-reduced-motion: reduce)` block at the end of `globals.css` kills the CSS animation side.

---

## 5. Breakpoints

| Query | What changes |
| --- | --- |
| `@media (min-width: 1700px)` | ghost/hero wordmarks step up (`34.5vw → 43.5vw`, `33.6vw → 42vw`) so display type keeps its share of ultrawide screens |
| `@media (max-width: 1300px)` | editorial grids compress, card copy shrinks |
| `@media (max-width: 1050px)` | scent grid 4 → 2 columns, header nav thins |
| `@media (max-width: 799px)` | mobile header (hamburger + centred mark), stacked sections, `.side-modal` becomes a full-height drawer, footer re-wraps |
| `@media (max-width: 440px)` | type floors, 16 px paddings, full-width pills |
| `@media (prefers-reduced-motion: reduce)` | animation opt-out |

`799px` is a JS/CSS boundary: GSAP gates the pinned scene with `(min-width: 800px)`. Move one and you must move the other.

---

## 6. Imagery treatment

| Property | Value | Consequence |
| --- | --- | --- |
| Format | WebP; lossless in the render path (`*-clear.webp`), lossy twins present but unreferenced | Media readiness scored 35/100 — see `docs/DATA-SCORE.md` |
| Pre-processing | detail-enhancement pass before encoding | chosen to avoid compounding softness; costs ~4× the bytes |
| Sizing | intrinsic `width`/`height` on every `<img>` | scrubbed scale/translate never reflows the document |
| Crops | `hero 1672×941`, `bottle 1086×1448`, `notes 1536×1024` | one landscape, one portrait, one editorial — the minimum set this layout needs |
| Priority | `fetchPriority="high"` on the hero, `loading="lazy"` on all others | LCP protected, nothing wasted below the fold |
| Cache-busting | `-clear` in the filename instead of a query string | old soft images can't be reused from cache |
| Logo | source photo + CSS crop + `feColorMatrix` | no redrawing and no distortion — at 2.2 MB, which is fix #1 |

---

## 7. Voice & copy system (a token too, honestly)

The dictionary in `data/site-content.json` keeps a strict register: short sentences, lower-case display words (`velora`, `éclat`), no exclamation marks, and a fixed formula for section labels — `0N / <two-word concept>` ("01 / The art of feeling").

French is *written*, not translated literally, so lengths differ per locale — which is exactly why the motion effect is keyed on `[lang]` and ScrollTrigger re-measures after a switch.

House rules that keep the page from reading like a template:

- never invent prices, provenance, awards or brand history;
- no filler paragraphs — if a section has nothing true to say, the section doesn't exist;
- every capability claim stays hedged to what's real ("Online ordering is not open yet").
