# Stack, skills & techniques used

An inventory of every tool and technique in this build, what it is actually doing here, and the exact wiring to reproduce it elsewhere. Facts are read from `package.json`, `vite.config.ts`, `scripts/`, `app/*`.

Legend: **used** = runs in the page today · **dormant** = installed/shipped but not imported by any page · **infra** = build/runtime plumbing.

---

## 1. Framework & runtime

| Package | Version | State | What it does here |
| --- | --- | --- | --- |
| `next` | 16.3.4 | used | App Router shape (`app/layout.tsx`, `app/page.tsx`), `Metadata` export, `next/headers` in the auth helper. Built through Vite rather than `next build`. |
| `vinext` | 1.0.0-beta.5 | **infra** | Runs a Next-style app on Vite so dev/build share one pipeline. `scripts/run-framework.mjs` swaps between the `vinext` CLI and raw `vite` depending on the execution profile. |
| `react` / `react-dom` | 19.2.6 | used | Client component only — the whole page is `"use client"`, no server components in the render path. |
| `@vitejs/plugin-rsc` | 0.5.26 | infra | React Server Components transport for the Vite pipeline. Present, unused by the page. |
| `@cloudflare/vite-plugin`, `wrangler`, `@cloudflare/workers-types` | 1.37.1 / 4.92.0 / 4.20260515.1 | infra | The app is deployed as a Worker. `build/sites-worker.ts` is the entry; local bindings come from `.openai/hosting.json`. |
| `typescript` | 5.9.3 | used | `strict: true`, `noEmit`, `moduleResolution: "bundler"`, path alias `@/* → ./*`. |
| `prettier` | ^3.9.9 | dormant | Configured only through editor defaults; no `.prettierrc` in the repo, so it runs with defaults. |

### Reproduce-the-pipeline notes

- `package.json` scripts deliberately do **not** call `next`: `dev`/`build` go through `node scripts/run-framework.mjs`, and `start` runs `wrangler dev` against `dist/server/wrangler.json` with `--persist-to .wrangler/state`.
- `pnpm-workspace.yaml` is not a monorepo — it is a **supply-chain policy file**: `minimumReleaseAge: 10080` (7-day quarantine on new package versions), `trustLockfile: false`, `strictDepBuilds: true`, an explicit `allowBuilds` list (`esbuild`, `fsevents`, `sharp`, `unrs-resolver`, `workerd`), and a project-local store. Worth copying into any project; it is the cheapest defence against a malicious fresh release.
- `.npmrc` disables audit/fund/update-notifier — noise off in CI.
- `packageManager: "pnpm@11.25.0"` + `corepack` means the lockfile version is authoritative: `pnpm-lock.yaml` is the only lockfile, so don't mix managers.

---

## 2. Styling

| Item | State | Detail |
| --- | --- | --- |
| `tailwindcss` 4.2.1 + `@tailwindcss/postcss` | used (layer present) | Single `@import "tailwindcss";` at the top of `app/globals.css`. No `tailwind.config.js` — v4 configures through CSS. |
| `tw-animate-css` | installed, **not imported** | Keyframe/animation utilities are available but the file isn't imported, so `animate-in`/`fade-in` classes would not resolve. |
| `vendor/shadcn-tailwind-4.13.0.css` (MIT, © 2023 shadcn) | shipped, **not imported** | 629 lines of `@theme inline` keyframes + `@custom-variant data-open` style variants. It defines **no colours**, so importing it alone does not make `components/ui/*` work. |
| Hand-written CSS | used | 2 247 lines, ~106 selectors, 121 rule blocks. The page markup carries only semantic class names (`.hero-copy`, `.scent-card`), **zero Tailwind utilities**. |

**The decision worth keeping:** utility framework in place, editorial layout written in plain CSS. `clamp()`, vw-based type, `grid-template-columns: 1fr 140px 1fr` and `-webkit-text-stroke` typography are far clearer in a stylesheet than as 30 utilities inline. Tailwind stays available for the 61 primitives and for quick admin/dashboard screens. If you continue in this style, add `@layer components` boundaries first so utilities keep beating the hand-written rules.

**Key techniques**

- Fluid type without breakpoints: `font-size: clamp(45px, 4.3vw, 80px)` (hero), `clamp(33px, 3.55vw, 60px)` (statement), plus viewport-relative display type — `.hero-wordmark { font-size: 34.5vw }` → `43.5vw` at ≥1700 px, `.signature-ghost { font-size: 54vw }`, `.footer-wordmark { font-size: 33.6vw }`.
- Oversized type tucks under the fold: `bottom: -0.11em` + `line-height: 0.78` + `letter-spacing: -0.075em` is the whole trick behind the "cut-off brand word" look.
- Tight negative tracking only above 30 px (`-0.035em` to `-0.075em`); body copy stays at `0`.
- Header underline sweep with pure CSS: `button:after` scaled on `transform: scaleX()` with `transform-origin` flipping between hover states.
- `.header.is-scrolled` = height 106 → 80 px, `background: #38271ce0`, `backdrop-filter: blur(16px)`, and the brand scales to `0.87` with `transform-origin: top center`.
- Alpha-as-suffix colours (`#422c2030`, `#faf1dfdb`, `#f9e8d85c`) instead of `rgba()` — fewer bytes, same result, and easy to derive from the token hex.

---

## 3. Motion (the real skill in this project)

| Package | Version | Role |
| --- | --- | --- |
| `gsap` | ^3.15.0 | All scroll animation: `ScrollTrigger`, `gsap.context`, `gsap.matchMedia`, `gsap.ticker`, `gsap.utils.toArray` |
| `lenis` | ^1.3.26 | Smooth wheel/anchor scrolling, `data-lenis-prevent`, `scrollTo(id, { offset })` |

### The wiring, verbatim logic

```ts
gsap.registerPlugin(ScrollTrigger);
if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setReady(true); return; }   // 1. bail early

const smooth = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1, anchors: true });
smooth.on("scroll", ScrollTrigger.update);                    // 2. one clock drives both
const tick = (time: number) => smooth.raf(time * 1000);
gsap.ticker.add(tick);                                        // 3. Lenis rides GSAP's rAF, not its own

const ctx = gsap.context(() => { /* all tweens */ }, root);   // 4. scoped to the container ref
// ...
return () => { ctx.revert(); smooth.destroy(); gsap.ticker.remove(tick); };  // 5. full teardown
```

Rules that fall out of this and are worth re-applying on every project:

1. **One rAF owner.** Letting Lenis run its own loop next to GSAP's ticker produces a visible jitter on scrubbed tweens.
2. **`ease: "none"` on every scrubbed tween.** The user is the playhead; any easing makes the mapping elastic and cheap-looking.
3. **`gsap.context(scope)` + `revert()`** is what makes the effect safe under Strict Mode double-invocation and route changes. Without it, ScrollTriggers accumulate per mount.
4. **`gsap.matchMedia().add("(min-width: 800px)", …)`** for pinned desktop-only scenes — cheaper than a resize listener and re-evaluated automatically.
5. **Pin → refresh discipline.** `document.fonts.ready.then(refresh)`, `window.addEventListener("load", refresh)` and a `setTimeout(refresh, 2500)` belt-and-braces. Pinned triggers mis-measure until webfonts and lazy images settle; all three are needed in practice.
6. **Re-run the whole motion effect on locale change** (`}, [lang]);`). French copy is longer, every section height changes, and every start/end position was measured in English. This is the most commonly missed bug in i18n + scroll builds.
7. **Guard `scrollTo` with a fallback.** `lenis.current?.scrollTo(id, { offset: -90 })` else `scrollIntoView` with `behavior` chosen by the reduced-motion query — smooth scroll still works where Lenis bailed out.

### Tween vocabulary used here

| Technique | Instance |
| --- | --- |
| Parallax + scale on media | `.hero-photo` (`yPercent: 15, scale: 1.13`, scrub 1.2) |
| Copy fade/lift out | `.hero-copy` (`y: -110, opacity: 0`) |
| Word-by-word opacity scrub with stagger | `.statement-word` (`0.2 → 1`, `stagger: 0.12`) |
| Per-element offsets from an array | `.scent-card` (`y: [150, 260, 170, 240][i]`) |
| Mask reveal, once | `.reveal-line` (`yPercent: 110`, `power3.out`, `once: true`) |
| Pinned timeline, multi-target | `.signature-stage` pin, `end: "+=1100"`, bottle rotate+scale, ghost x%, info y |
| Image breathing | `.world-image img` (`yPercent: ±10, scale: 1.15`), `.closing-image` (`scale: 1.2 → 1`) |
| Pointer-follow | `.hero-scene` (`onPointerMove`, `gsap.to(..., { duration: 1.6 })`) |

---

## 4. UI primitives & icons

- `lucide-react` ^1.31.0 — **used** by the page for 9 icons (`Search, ShoppingBag, X, Menu, Plus, Minus, ChevronDown, Check, MoveDown`), and by 23 of the primitives. Tree-shaken, so the cost is the individual glyphs.
- `radix-ui` ^1.6.7 — **dormant**, and it backs 37 of the 61 primitives. `combobox.tsx` alone uses `@base-ui/react` (hence its different data attributes) and `message-scroller.tsx` pulls `@shadcn/react/message-scroller`. The 7 files that import **no** package at all — `card.tsx`, `input.tsx`, `kbd.tsx`, `message.tsx`, `skeleton.tsx`, `table.tsx`, `textarea.tsx` (only `cn()`) — are the paste-ready ones: drop them in any Tailwind project and they work.
- `class-variance-authority` 0.7.1 + `clsx` + `tailwind-merge` — the `cn()` helper in `lib/utils.ts` is the only one wired into app code, and even that is unused by the page.
- `components.json` — shadcn registry manifest (`style: "new-york"`, `cssVariables: true`, aliases `@/components`, `@/lib/utils`, `@/components/ui`, `@/hooks`). Keep it if you want `npx shadcn add` to work; without the token layer it will add components that look unstyled.
- `hooks/use-mobile.ts` — `matchMedia("(max-width: 767px)")` hook, 19 lines, shipped with the starter and unused here; it's still the right snippet for any "desktop-only motion" decision.

---

## 5. State, data & persistence

| Concern | Implementation |
| --- | --- |
| Local state | 9 `useState` in one `Home()` component: `lang, panel, query, bag, note, article, toast, ready, sticky` |
| Persistence | `localStorage` keys `velora-selection` (number, validated `Number.isInteger && 0..20` on read) and `velora-language`. Every read **and** write is wrapped in `try/catch` |
| Derived state | `searchItems` built per render from the copy dictionary, then `.filter()`ed by `query` (substring over `title + keywords`, lower-cased) |
| Server data | **None.** `db/schema.ts` is `export {};` by design; `examples/d1/` holds an opt-in D1 example |
| ORM | `drizzle-orm` 0.45.2 + `drizzle-kit` (config in `drizzle.config.ts`, `drizzle/meta/_journal.json` present) — dormant until a table is added |
| Validation | `zod` ^3.25.76 + `@hookform/resolvers` — dormant |

Two habits worth stealing from the persistence code:

```ts
const b = Number(localStorage.getItem("velora-selection"));
if (Number.isInteger(b) && b >= 0 && b <= 20) setBag(b);   // never trust stored state
const next = Math.max(0, Math.min(20, value));             // clamp once, in the setter
```

…and the "no backend yet" download pattern, which is a genuinely useful pre-launch commerce move:

```ts
const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
const a = document.createElement("a");
a.href = url; a.download = "VELORA-my-selection.txt"; a.click();
URL.revokeObjectURL(url);   // always revoke
```

---

## 6. Overlay engineering (no library used)

The page implements a modal system directly on the platform:

- one native `<dialog>` element, `showModal()` / `close()` driven by the `panel` union state;
- backdrop dismissal via `onClick` with `e.target === e.currentTarget` (no overlay div needed);
- `onClose` handler so `Esc` keeps React state in sync — the effect everyone forgets;
- `aria-label` selected per panel; `data-lenis-prevent` on `.modal-inner` so wheel scrolling inside the panel doesn't move the page;
- Lenis is explicitly `stop()`ped while open and `start()`ed after, so the scrollbar doesn't resume mid-animation;
- two visual variants from one host (`.modal` centre vs `.side-modal` edge sheet) chosen from the panel name.

That is roughly 40 lines of code for a system that a `dialog`+`sheet`+`drawer` trio of libraries would otherwise occupy. Worth knowing how to do by hand before adding a dependency.

---

## 7. Accessibility engineering

| Technique | Where |
| --- | --- |
| Skip link | `<a className="skip-link" href="#main">`, locale-aware text |
| Section labelling | `aria-labelledby="hero-title"` on the hero, `aria-label` on each `nav` |
| Decorative isolation | `aria-hidden="true"` on ghost wordmarks, curtain, decorative `<img alt="">` |
| Focus ring that survives the palette | `:focus-visible { outline: 2px solid #a75e38; outline-offset: 5px }` on `button, a, input, select` |
| Roving keyboard for tabs | `role="tablist"` + `aria-selected` on the note tabs |
| Live region | `role="status"` on the toast |
| Reduced motion | single `matchMedia` gate that skips the whole motion effect *and* releases the curtain instantly; separate CSS `@media (prefers-reduced-motion: reduce)` block at the end of `globals.css` |
| Language semantics | `document.documentElement.lang = lang` in an effect |
| Intrinsic sizing | every `<img>` carries `width`/`height`, so scrubbed parallax never shifts layout |
| Tap targets | `.pill { min-height: 55px }`, `.quantity button { 35×36 }`, `scroll-padding-top: 100px` so anchors never land under the fixed header |

---

## 8. Platform integrations (starter features, dormant but wired)

- **Agent tool surface** — `document.modelContext.registerTool()` in `app/page.tsx`: `get_eclat_details` (readOnly) and `set_fragrance_selection` (validates integer 0..20, throws otherwise). JSON Schema per tool, `AbortController` teardown, silently no-ops where the API is absent.
- **ChatGPT auth** — `app/chatgpt-auth.ts` reads `oai-authenticated-user-id/-email/-full-name` headers (percent-encoded UTF-8 aware) and exposes `getChatGPTUser()`, with `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback` path constants. Nothing on this page imports it, but it is the whole auth layer if you ever need one.
- **Connector contract** — `lib/connector-contract.mts`, `lib/connector-context.ts`, `lib/connector-errors.mts`, `lib/connectors.ts`, plus `build/connector-preview-*.{ts,mjs}` and `scripts/connector-preview/`. That's the in-app preview harness for external connectors (see `components/connector-error.tsx`). Delete it if you never deploy to that host; keep it if you do.

---

## 9. Quality gates

| Gate | Command | Notes |
| --- | --- | --- |
| Lint | `pnpm lint` | Flat config, `eslint-config-next/core-web-vitals` + `/typescript`, ESLint 9. Vendored `components/ui/**` and `hooks/use-mobile.ts` get `no-unused-vars`, `react-hooks/purity` and `react-hooks/set-state-in-effect` switched **off** so upstream source stays verbatim — a good pattern for any vendored directory. |
| Types | `npx tsc --noEmit` | `strict`, `skipLibCheck`, `noEmit`. `examples/` excluded from `include`. |
| Build | `pnpm build` | On `managed-linux` profiles this routes to `scripts/build-verified.sh` instead of the plain Vite build. |
| DB | `pnpm db:generate` | `drizzle-kit generate`; nothing to generate until `db/schema.ts` has tables. |

### Current gate status (as measured)

```
tsc --noEmit   0 errors
pnpm lint      2 errors, 15 warnings
```

Both errors are `react-hooks/set-state-in-effect` in the mount effect that hydrates
`bag`/`lang` from `localStorage` and releases the curtain, plus the reduced-motion
`setReady(true)`. They are inherited from the ported code, not introduced here. The
correct fix is a lazy `useState` initialiser guarded by `typeof window`, or
`useSyncExternalStore` over a storage subscription; the honest stopgap is a line-level
disable. The 15 warnings are all `@next/next/no-img-element` — deliberate here, since
`next/image` optimisation would fight the lossless-WebP + scrubbed-scale pipeline. If
you keep the plain `<img>` approach, add both rules to the override block in
`eslint.config.mjs` so the gate means something.
| Data | `pnpm data:extract` / `pnpm data:check` | Re-syncs `data/site-content.json` from `app/page.tsx`; `--check` is the CI guard. |
| Score | `pnpm data:score` | Rewrites `docs/DATA-SCORE.md` from measured data. |
| Catalogue | `pnpm docs:components` | Rewrites `docs/COMPONENT-CATALOG.md` from the real component files. |

---

## 10. Skills to have, in priority order

If the goal is to rebuild this class of site from a blank file, these are the skills in the order they actually block you:

1. **GSAP timeline + ScrollTrigger vocabulary** — `scrub`, `pin`, `start/end` in percentages, `stagger`, `once`. Nothing else on the page produces its look.
2. **`gsap.context()` / `revert()` lifecycle** and `matchMedia()` registration — the difference between a demo and a page that survives a route change.
3. **Lenis + GSAP cohabitation** — one ticker, `data-lenis-prevent`, `stop()/start()` around modals.
4. **Fluid type with `clamp()` and viewport units**, plus negative tracking on display sizes.
5. **Native `<dialog>` semantics** — `showModal()`, `onClose`, focus restore, top layer; then knowing when to swap in a library.
6. **Mask-reveal typography** (`.text-mask` + `yPercent: 110`) and per-word opacity scrubs.
7. **Scroll-driven image treatment** (scale > 1 first, `will-change: transform`, `loading="lazy"`, intrinsic sizes).
8. **`feColorMatrix` luminance-to-alpha** for extracting a mark from an image without a design tool.
9. **i18n as data** — a keyed dictionary object, `documentElement.lang` sync, and re-measuring scroll triggers after a locale swap.
10. **Tailwind v4 CSS-first config** (`@theme`, `@custom-variant`) — enough to plug in the shadcn primitives and their token layer.
11. **Client-side persistence done defensively** — validated reads, clamped setters, `try/catch` everywhere.
12. **Vite + Cloudflare Worker deployment model** (`@cloudflare/vite-plugin`, `wrangler.json`, `Request.cf`, D1/R2 bindings) — this is the part that makes the starter feel opaque.
13. **`document.modelContext` tool registration** — for making a site legible to in-browser agents.

---

## 11. What I would not copy

- The 1 388-line single-component page (copy dictionary + markup + all scroll effects in one file). See `docs/DATA-SCORE.md` → Maintainability 16/100.
- Shipping a 61-file component library that no page imports and that has no token layer. Either wire it or drop it; a dormant library reads as scaffolding.
- Lossless WebP as the render path when lossy twins exist 4× lighter and unreferenced.
- A 2.2 MB PNG loaded and CSS-cropped to paint a logo.
- Global CSS class names as the animation API.
- The 1800 ms curtain timer as the *source* of readiness rather than its ceiling.
