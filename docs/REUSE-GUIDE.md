# Reuse guide

The point of this repo beyond the page itself: a kit you can drop into the next site. Each recipe is "copy these files, add this code, watch for this".

Everything here is ordered by how much value it saves per minute of copying.

---

## 0. The kit at a glance

| Want | Take | Leave behind |
| --- | --- | --- |
| The motion language | `app/page.tsx` → the single `useEffect` that registers ScrollTrigger, plus `.text-mask`, `.reveal-line`, `@keyframes loading` in `globals.css` | the copy dictionary |
| The preloader/curtain | `.intro-curtain`, `.intro-inner`, `.intro-line`, `@keyframes loading`, the `ready` state | the brand mark (replace `Brand()`) |
| The header behaviour | `.header`, `.header.is-scrolled`, `scroll-padding-top: 100px`, the `sticky` scroll listener | the three-column brand grid if your logo isn't centred |
| The overlay system | `<dialog>` host + `Panel` union + `showModal()/close()` effect + `.modal`/`.side-modal` CSS | the bag panels |
| The commerce placeholder | `updateBag()` + `saveBag()` (Blob download) | the product copy |
| The primitives | any file from `components/ui/*` — after adding the shadcn token layer | the ones you don't use |
| The data pipeline | `data/*.json`, `scripts/extract-site-data.mjs`, `scripts/score-data.mjs`, `scripts/build-component-catalog.mjs` | nothing — it's brand-agnostic |

---

## 1. Mask reveal — the 12-line keeper

The highest value-per-line pattern in the repo. Any headline that needs to look expensive.

```tsx
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span className="text-mask" key={i}>
          <span className="reveal-line">{line}</span>
        </span>
      ))}
    </>
  );
}
```

```css
.text-mask { display: block; overflow: hidden; }
.reveal-line { display: block; }
```

```ts
gsap.utils.toArray<HTMLElement>(".reveal-line").forEach((el) =>
  gsap.from(el, {
    yPercent: 110, duration: 1.2, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 95%", once: true },
  }),
);
```

**Dependencies:** none beyond GSAP. **Gotchas:** the mask needs `display: block` or an inline element won't clip; `overflow: hidden` clips descenders — add `padding-bottom: 0.08em` to `.reveal-line` for type with `g`/`y`; and because each line is authored with `\n`, don't use it for paragraphs that reflow.

---

## 2. Per-word opacity scrub (statement focus effect)

```tsx
<h2 className="statement">
  {t.statement.split(" ").map((word, i) => (
    <span className="statement-word" key={i}>{word}{" "}</span>
  ))}
</h2>
```

```ts
gsap.fromTo(".statement-word", { opacity: 0.2 }, {
  opacity: 1, stagger: 0.12, ease: "none",
  scrollTrigger: { trigger: ".statement", start: "top 82%", end: "bottom 45%", scrub: 0.6 },
});
```

Works on any 2–4 sentence block: manifesto, product claim, case-study pull-quote. **Do not** animate `color` instead of `opacity` — the compositing cost is higher and the anti-aliasing shifts.

---

## 3. Pinned product stage

```ts
gsap.matchMedia().add("(min-width: 800px)", () => {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: ".signature", start: "top top", end: "+=1100", pin: ".signature-stage", scrub: 1 },
  });
  tl.fromTo(".signature-bottle", { y: 55, rotation: -8, scale: 0.84 },
    { y: -25, rotation: 5, scale: 1.06, duration: 2.2, ease: "none" }, 0)
    .fromTo(".signature-ghost", { xPercent: -7 }, { xPercent: 8, duration: 2.2, ease: "none" }, 0)
    .fromTo(".signature-info", { y: 80 }, { y: -35, duration: 2.2, ease: "none" }, 0);
});
```

Three targets at time `0` = one shared scroll playhead, which is what makes it feel choreographed rather than stacked. `end: "+=1100"` is the scroll distance budget — keep pins under ~1.5 viewport heights or users feel trapped.

**Mandatory companions:** `ScrollTrigger.refresh()` on `document.fonts.ready`, on `load`, and on a 2.5 s timer; and `matchMedia` so mobile never pins.

---

## 4. One `<dialog>`, many panels

```tsx
type Panel = "search" | "bag" | "product" | "menu" | "journal" | "care" | null;
const dialog = useRef<HTMLDialogElement>(null);

useEffect(() => {
  if (panel && dialog.current && !dialog.current.open) { dialog.current.showModal(); lenis.current?.stop(); }
  if (!panel) { dialog.current?.close(); lenis.current?.start(); }
}, [panel]);

<dialog ref={dialog} className={`modal ${sidePanels.has(panel) ? "side-modal" : ""}`}
        onClose={() => setPanel(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setPanel(null); }}
        aria-label={labels[panel ?? "product"]}>
  <div className="modal-inner" data-lenis-prevent>{/* switch on panel */}</div>
</dialog>
```

Why it's better than three library modals here: one focus trap, one `Esc` path, one scroll-lock, one place to set the label, and no portal juggling. **Scale it by adding a key to the union, a block, and a label — nothing else.** If you need nested overlays or animated exits, switch to `components/ui/dialog.tsx` + `sheet.tsx`.

---

## 5. Ken-Burns / image breathing

```ts
gsap.fromTo(".world-image img", { yPercent: -10, scale: 1.15 },
  { yPercent: 10, ease: "none",
    scrollTrigger: { trigger: ".world", start: "top bottom", end: "bottom top", scrub: 1 } });
```

Always start `scale > 1` (`1.15` here) so the translate never exposes an edge. Pair with a `.hero-shade`-style overlay div for legibility of text over photography, and keep `will-change: transform` on the element only while animating.

---

## 6. Staggered card offsets

```ts
gsap.utils.toArray<HTMLElement>(".scent-card").forEach((card, i) =>
  gsap.fromTo(card, { y: [150, 260, 170, 240][i] }, {
    y: 0, ease: "none",
    scrollTrigger: { trigger: ".scent-grid", start: "top 95%", end: "center 48%", scrub: 0.8 },
  }));
```

```css
.scent-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; align-items: start; }
```

The asymmetry comes from the *start* offsets, not from CSS `nth-child` margins — so the resting layout stays a clean grid. **Move the offsets into markup before you reuse it**, otherwise reordering cards breaks the rhythm:

```tsx
<article className="scent-card" data-offset={150}>
```
```ts
gsap.fromTo(card, { y: Number(card.dataset.offset) }, …)
```

---

## 7. Image → logo without a design tool

```tsx
<filter id="mark-light" colorInterpolationFilters="sRGB">
  <feColorMatrix type="matrix"
    values="0 0 0 0 0.98  0 0 0 0 0.945  0 0 0 0 0.875  -1.8 -1.8 -1.8 0 3.6" />
</filter>
```

The RGB rows set the flat output colour, the fourth row computes alpha from luminance (`-1.8` per channel = threshold slope, `3.6` = offset). Two filters (light/dark) give you both treatments from one asset. Ship an SVG to production; keep the filter as the prototype trick.

---

## 8. Pointer parallax that behaves

```tsx
<div className="hero-scene"
  onPointerMove={(e) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    gsap.to(e.currentTarget, { x: (e.clientX / r.width - 0.5) * -9, y: (e.clientY / r.height - 0.5) * -5, duration: 1.6 });
  }}
  onPointerLeave={(e) => gsap.to(e.currentTarget, { x: 0, y: 0, duration: 1.6 })} />
```

Keep displacement under ~1% of viewport, always ease back to zero on leave, never on touch.

---

## 9. Lenis + GSAP bootstrapping (the whole file you need)

```ts
gsap.registerPlugin(ScrollTrigger);
if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setReady(true); return; }
const smooth = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1, anchors: true });
smooth.on("scroll", ScrollTrigger.update);
const tick = (time: number) => smooth.raf(time * 1000);
gsap.ticker.add(tick);
const ctx = gsap.context(() => { /* tweens */ }, root);
const refresh = () => ScrollTrigger.refresh();
document.fonts.ready.then(refresh);
window.addEventListener("load", refresh);
const timer = setTimeout(refresh, 2500);
return () => { clearTimeout(timer); window.removeEventListener("load", refresh); ctx.revert(); smooth.destroy(); gsap.ticker.remove(tick); };
```

Copy this block into every scroll-driven project and you will never re-debug the double-rAF jitter, the stale pin measurements, or the un-reverted ScrollTrigger leaks.

---

## 10. i18n dictionary + refresh

```ts
const content = { en: {…}, fr: {…} } as const;
type Language = keyof typeof content;
const [lang, setLang] = useState<Language>("en");
const t = content[lang];

useEffect(() => { document.documentElement.lang = lang; /* persist */ }, [lang]);
useEffect(() => { /* all tweens */ }, [lang]);   // re-measure after text length changes
```

`data/site-content.json` is generated from that dictionary; `scripts/extract-site-data.mjs --check` fails CI if the two drift. To add a third locale: add the object, extend the union, add an `<option>`, re-run the extractor, and the scorer tells you whether it's complete.

---

## 11. Reusing the *data*, not just the markup

```bash
node scripts/extract-site-data.mjs          # app/page.tsx -> data/site-content.json
node scripts/score-data.mjs                 # data/*.json + assets -> docs/DATA-SCORE.md
node scripts/build-component-catalog.mjs    # components/* -> docs/COMPONENT-CATALOG.md
```

For the next build:

- **New landing page for a different product:** copy `data/site-model.json` as a template — its `sections[]` records (id, components, media, copyKeys, animations) are the brief; fill it in, then generate markup from it instead of the reverse.
- **Move to a database:** `db/schema.ts` is `export {};` on purpose. Add tables mirroring `data/site-model.json` (`product`, `note`, `section`, `article` — `author`/`publishedAt`/`slug` are already reserved there), then `pnpm db:generate`. `examples/d1/` shows the route + schema pairing the starter expects.
- **Give the journal real URLs:** `news[]` entries already carry `id`, `slot`, `category`, `image`, `author`, `publishedAt`, `body.{en,fr}`. A `app/journal/[slug]/page.tsx` can be written straight against that shape; the score jumps from 55 as soon as the fields are populated with true values.
- **Kill the hardcoded animation coupling:** read `sections[].animations[].target` from the JSON into `gsap.utils.toArray(`[data-animate="${t.target}"]`)` and put matching `data-animate` attributes in the markup. Then the JSON is genuinely the source of truth for both content and motion.

---

## 12. Suggested split, when you refactor

```
components/site/
  intro-curtain.tsx        # ready state + Brand + progress line
  sticky-header.tsx        # sticky listener, nav, lang, bag count
  hero.tsx                 # photo, pointer parallax, ghost wordmark, cue
  statement.tsx            # per-word scrub
  note-cards.tsx           # staggered grid (offsets from data-*)
  pinned-product.tsx       # signature stage + timeline
  note-tabs.tsx            # -> replace with components/ui/tabs.tsx
  editorial-image.tsx      # ken-burns block, reusable for world/closing
  journal-grid.tsx         # cards -> link to /journal/[slug]
  overlay-dialog.tsx       # <dialog> host + panel switch
  quantity-stepper.tsx     # +/- with clamp, <output>
  selection-download.ts    # saveBag() extracted, unit-testable
  use-scroll-scenes.ts     # the Lenis/GSAP bootstrap block, returns { refresh }
  use-local-prefs.ts       # validated read, clamped write, try/catch
```

Each file is independently portable; `use-scroll-scenes.ts`, `selection-download.ts` and `use-local-prefs.ts` are portable to literally any project.

---

## 13. What not to reuse

- Loading a full-size photo to crop a logo.
- A timer as the source of "ready" (use it as the ceiling).
- Setting state from every scroll pixel on a page with a large render tree.
- Substring search with hand-typed keyword strings when `components/ui/command.tsx` (`cmdk`) ships fuzzy matching.
- Carrying the 61 unused primitives into the next repo "just in case" — install what you use; `npx shadcn@latest add <name>` is one command.
- Importing the connector/preview/auth layer (`lib/connector*`, `build/connector-preview*`, `app/chatgpt-auth.ts`) unless you deploy to the host that supplies those headers.
