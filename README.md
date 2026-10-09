# VELORA Paris — Éclat

A single-page fragrance launch site: an ivory curtain intro, a full-bleed product hero, a scroll-scrubbed manifesto, staggered note cards, a pinned bottle stage, interactive composition tabs, journal cards and a closing campaign. All motion is driven by one scroll playhead.

Made by [sakshamfit](https://github.com/sakshamfit).

---

## Features

- **Scroll-driven motion** built on GSAP and ScrollTrigger, with Lenis smooth scrolling on the same ticker.
- **Bilingual copy** in English and French (`en` / `fr`), switchable in the page.
- **Accessible overlays** using native `<dialog>` elements for search, bag, product, menu, journal and care panels.
- **Reduced-motion support**: the scroll effects are skipped and the intro curtain is released immediately.
- **Selection-only commerce**: bag quantities are stored in `localStorage` and can be exported as a text file. There is no payment or order flow.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | [vinext](https://vinext.dev) (Next.js 16 App Router API on Vite 8), React 19 |
| Motion | GSAP 3 + ScrollTrigger, Lenis |
| Styling | Tailwind CSS 4 + a hand-written CSS system in `app/globals.css` |
| UI primitives | shadcn-style components in `components/ui/` (vendored, not used by the page) |
| Hosting | Vercel (Build Output API via Nitro) or Cloudflare Workers (`@cloudflare/vite-plugin`) |
| Tooling | pnpm 11, TypeScript 5.9, ESLint 9, Prettier |

## Requirements

- Node.js `>= 22.13.0`
- pnpm `11.25.0` (pinned by `packageManager`; use Corepack)

## Getting started

```bash
corepack enable
pnpm install

pnpm dev        # dev server on http://localhost:5173
pnpm build      # production build
pnpm start      # run the Cloudflare Worker build locally (after pnpm build)
```

To expose the dev server through a proxy or tunnel, opt in explicitly. This binds to all interfaces and disables the Host allow-list, so only use it on a trusted network:

```bash
DEV_ALLOW_ALL_HOSTS=1 pnpm dev
```

### Other scripts

| Script | What it does |
| --- | --- |
| `pnpm lint` | ESLint over the project |
| `npx tsc --noEmit` | Strict type-check |
| `pnpm data:extract` | Regenerates `data/site-content.json` from `app/page.tsx` |
| `pnpm data:check` | Fails if `data/site-content.json` is stale (for CI) |
| `pnpm data:score` | Scores the data and assets, writes `docs/DATA-SCORE.md` |
| `pnpm docs:components` | Regenerates `docs/COMPONENT-CATALOG.md` |
| `pnpm docs:build` | Runs all three generators in order |
| `pnpm db:generate` | Drizzle migration generation (the schema is currently empty) |

## Deployment

### Vercel

`vercel.json` sets the framework to "Other" and the build command to `pnpm run build`. The Next.js preset is turned off on purpose: this app is built with vinext, which does not write the `.next/routes-manifest.json` that Vercel's Next.js builder expects.

When Vercel builds the project, it sets `VERCEL=1`. In that case `vite.config.ts` uses the [Nitro](https://nitro.build) Vite plugin instead of the Cloudflare plugin. Nitro writes Vercel's Build Output API to `.vercel/output` (a Node 22 function plus static assets), which Vercel deploys as-is.

To test the Vercel output locally:

```bash
VERCEL=1 pnpm build
# output: .vercel/output/  (config.json, functions/__server.func, static/)
```

### Cloudflare Workers

Without `VERCEL=1`, `pnpm build` produces a Worker bundle in `dist/` (`dist/server/wrangler.json` and `dist/client`). `pnpm start` runs it with `wrangler dev`. D1 and R2 bindings are read from `.openai/hosting.json`; both are currently unused.

## Project structure

```
app/
  layout.tsx          metadata and root layout
  page.tsx            the page: copy dictionary, sections, motion, overlays
  globals.css         design tokens, sections, overlays, responsive and reduced-motion rules
  chatgpt-auth.ts     dormant auth helper for the hosting platform
components/
  ui/                 shadcn-style primitives (not imported by the page)
data/
  site-content.json   generated EN/FR dictionary and asset map
  site-model.json     curated product, sections, journal and media model
docs/                 generated reports and design/reuse documentation
lib/utils.ts          cn() helper
public/assets/        hero, bottle and notes imagery (WebP), brand reference, fonts
scripts/              data extraction, scoring, catalogue generation, install and build helpers
build/                Worker and Vite plugin source imported by vite.config.ts (not build output)
vendor/               third-party CSS with its licence
vite.config.ts        vinext + Cloudflare (or Nitro on Vercel) configuration
vercel.json           Vercel project settings
```

`build/` contains source files, not build output. Do not delete it: `vite.config.ts` imports it, and the dev server will not start without it. The build output is `dist/` (Cloudflare) or `.vercel/output/` (Vercel).

## Content

All page copy lives in the `content` dictionary in `app/page.tsx`. Run `pnpm data:extract` after changing it so that `data/site-content.json` stays in sync, and `pnpm data:check` will tell you if it has drifted.

Images are versioned by filename (for example `hero-clear.webp`) rather than by query string, so a cached asset is never reused after it changes.

## Notes

- `pnpm-workspace.yaml` is not a monorepo file. It is a supply-chain policy: a seven-day minimum release age, explicit `allowBuilds`, and `strictDepBuilds`.
- `eslint.config.mjs` relaxes three rules for `components/ui/**`, because those files are vendored.
- `799px` (CSS) and `800px` (GSAP `matchMedia`) are the same breakpoint written twice. Change both together.

## Known issues

- `pnpm lint` currently reports 2 errors (`react-hooks/set-state-in-effect`) and 15 `no-img-element` warnings. `tsc --noEmit` is clean.
- The page is one client component of about 1,400 lines, and the stylesheet is about 2,200 lines.
- Imagery is larger than needed: lossless WebP is used in the render path, while lossy versions already exist in `public/assets/`.

## Licence

No licence file is included yet. All rights reserved by sakshamfit unless a licence is added. Vendored files keep their own licences: `vendor/shadcn-tailwind-4.13.0.css` is MIT © 2023 shadcn.
