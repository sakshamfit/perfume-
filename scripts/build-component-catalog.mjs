#!/usr/bin/env node
/**
 * Builds `docs/COMPONENT-CATALOG.md`: every component in the repo, what it is
 * for, what it drags in as a dependency, and how to lift it into another site.
 *
 * The mechanical facts (exports, deps, line counts, `data-slot` names, whether
 * a `cva` variant map exists) are read from the source. The judgement — when to
 * reuse, what breaks — is curated in `NOTES` below and keyed by file name, so
 * a new component only needs a new entry.
 *
 * Usage: node scripts/build-component-catalog.mjs
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ------------------------------------------------------- curated knowledge */
const GROUPS = {
  controls: "Controls & selection",
  forms: "Forms & fields",
  overlays: "Overlays & popups",
  navigation: "Navigation & disclosure",
  data: "Data display",
  feedback: "Feedback & status",
  chat: "Chat / agent surface",
  misc: "Utility primitives",
};

/** [group, reuse note, gotcha] */
const NOTES = {
  "accordion.tsx": ["navigation", "FAQ, spec sheets, filters in a sidebar. Pairs with the `note-tabs` idea on this site for product details.", "Animated with the `accordion-down/up` keyframes that live in `vendor/shadcn-tailwind-4.13.0.css` — import that file or the height animation snaps."],
  "alert-dialog.tsx": ["overlays", "Destructive confirmations (clear cart, delete draft). 12 exports including `AlertDialogMedia`.", "Focus is trapped and the dialog is modal by default — never nest it inside another modal host."],
  "alert.tsx": ["feedback", "Inline validation summary, out-of-stock banner.", "Has `cva` variants (`default | destructive`) — extend the variant map instead of overriding class strings."],
  "aspect-ratio.tsx": ["data", "Lock product imagery to a design ratio so scroll parallax never shifts layout.", "Trivial wrapper; the real win is combining it with explicit `width`/`height` to stay CLS-free."],
  "attachment.tsx": ["chat", "File chips in an upload area or a composer.", "Part of the chat family; assumes the `data-slot` styling layer."],
  "avatar.tsx": ["data", "Reviewer initials, testimonial rows, fallback when a photo 404s.", "Needs the `radix-ui` Avatar primitive plus a `Fallback` delay if images are slow."],
  "badge.tsx": ["feedback", "'New', 'Limited edition', stock status. Four exports incl. `badgeVariants`.", "Export `badgeVariants` and reuse it in your own `cva` compositions instead of copying classes."],
  "breadcrumb.tsx": ["navigation", "Category pages once the catalogue grows past one product.", "Remember `aria-current=\"page\"` on the last item — the component sets it for you."],
  "bubble.tsx": ["chat", "Message bubbles with reaction row — useful for any conversational support widget.", "Chat family: needs the `bubble-content` / `bubble-reactions` data-slots from the theme layer."],
  "button-group.tsx": ["controls", "Segmented size picker (30/50/100 ml), unit toggles.", "Handles border collapsing between siblings; don't add margins yourself."],
  "button.tsx": ["controls", "Every CTA. `buttonVariants` also lets you style an `<a>` as a button.", "The site's own `.pill` (globals.css) is a hand-written alternative — pick one system per project, not both."],
  "calendar.tsx": ["forms", "Delivery-date pickers, 'when do you need it by'.", "Depends on `react-day-picker` v10 API plus `date-fns`; heavy (~220 lines) — code-split it out of the landing page bundle."],
  "card.tsx": ["data", "Journal/news cards, product tiles, admin tiles.", "Composition-only: CardHeader/Title/Description/Action/Content/Footer — bring all the parts you style."],
  "carousel.tsx": ["data", "Gallery of product shots, testimonial slider.", "Wrap-around state uses `embla-carousel-react`; also needs the lucide chevrons and `useCarousel()` context — the whole file is the unit, not individual exports."],
  "chart.tsx": ["data", "Dashboards: sales by note family, traffic by locale.", "The most coupled file here (377 lines, `recharts`, a `ChartConfig` type, tooltip primitives). Bring it whole and edit `ChartContainer`, never the internals."],
  "checkbox.tsx": ["forms", "Consent box, filter facets.", "Native form submission needs a hidden input; the Radix one provides `name`/`value` props."],
  "collapsible.tsx": ["navigation", "Read-more on the journal cards without a modal.", "Trigger must stay inside `Collapsible` — outside it the chevron rotation loses its state."],
  "combobox.tsx": ["controls", "Autocomplete shade/skin-type selectors.", "This one is built on `@base-ui/react`, not Radix, so its data attributes differ from the rest of the folder."],
  "command.tsx": ["overlays", "⌘K palette. Direct upgrade path from this site's hand-written search panel.", "`cmdk` handles fuzzy matching for free — the site's substring `keywords` approach exists only to avoid this dep."],
  "context-menu.tsx": ["overlays", "Right-click actions in an admin/editor surface.", "Not for touch-first marketing pages."],
  "dialog.tsx": ["overlays", "Product quick-view. Compare with the site's single-`<dialog>` multiplexer (see part 2).", "Radix traps focus and restores it on close; if you animate with GSAP, disable `exit` while ScrollTrigger still holds the layout."],
  "direction.tsx": ["misc", "RTL support — wrap the tree once, every other primitive flips.", "Only worth lifting if the project actually needs RTL; it's a provider with no styling."],
  "drawer.tsx": ["overlays", "Mobile bottom sheet for the bag/filter panel — exactly what this site approximates with `.side-modal`.", "Uses `vaul` on top of `@react-spring`; it renders through a portal, so `data-lenis-prevent` must be applied to its scroll body."],
  "dropdown-menu.tsx": ["overlays", "Locale switcher, account menu, multi-select filters.", "Checkboxes/radios inside a menu are first-class here (`DropdownMenuCheckboxItem`)."],
  "empty.tsx": ["feedback", "Empty search results, empty cart, 'no posts yet'. Six exports incl. `emptyMediaVariants`.", "Prefer it over hand-rolled empty markup — the media/title/description grid is what makes it look intentional."],
  "field.tsx": ["forms", "Label + control + helper + error in one grid; the layout half of a form system.", "It is presentation only — pair with `form.tsx` or your own controller for state."],
  "form.tsx": ["forms", "react-hook-form wiring (`Form`, `FormField`, `FormItem`, `FormControl`, `FormMessage`).", "Needs `react-hook-form` + `@hookform/resolvers` + `zod` to be worth the weight; three deps for one component."],
  "hover-card.tsx": ["overlays", "Note preview on hover in the composition section.", "Never rely on hover-only for essential info — no hover on touch."],
  "input-group.tsx": ["forms", "Search field with leading icon and trailing clear/kbd; quantity inputs with unit suffix.", "Addon positioning uses `data-slot` + `group` classes; the addon is an absolute-positioned sibling, so pad the input yourself if you change sizes."],
  "input-otp.tsx": ["forms", "6-digit verification for a membership or a locker code.", "Needs `input-otp` and registers its own clipboard/paste handling; paste works because of that lib, not the wrapper."],
  "input.tsx": ["forms", "Plain text input, 21 lines, zero deps.", "The most portable file in the folder — copy-paste into any project."],
  "item.tsx": ["data", "Dense list rows: order line items, wishlist entries, bag contents.", "Good replacement for the bespoke `.bag-item` markup on this site."],
  "kbd.tsx": ["misc", "Shortcut hints inside the command palette.", "Needs the `kbd-group` styling to space siblings."],
  "label.tsx": ["forms", "Accessible labels for Radix controls (wires `htmlFor`/`id`).", "Also used here for the language select in the header."],
  "marker.tsx": ["chat", "Inline 'assistant is thinking' / step marker in a timeline.", "Chat family; `markerVariants` covers sizes."],
  "menubar.tsx": ["navigation", "Desktop app-style menu bar in a dashboard shell.", "Overkill for marketing pages; keep it in the admin bundle only."],
  "message-scroller.tsx": ["chat", "Auto-scrolling transcript container for streaming output.", "Provider + viewport + rails: lift all four exports together."],
  "message.tsx": ["chat", "One chat row: avatar, name, content, actions.", "Chat family."],
  "native-select.tsx": ["controls", "A real `<select>` styled to match — form-safe on mobile and for keyboards.", "Use this before `select.tsx`: no portal, no focus trap, no JS. The site's language switcher does exactly this by hand."],
  "navigation-menu.tsx": ["navigation", "Mega-menu in the header (this site's `.nav-left` is a stub of the idea).", "Keyboard grid navigation comes free; the styling layer is what takes time."],
  "pagination.tsx": ["navigation", "Journal listing once there are more than two entries.", "Ellipsis logic lives in `PaginationEllipsis`."],
  "popover.tsx": ["overlays", "Sizing help text, colour swatch detail, mini-cart preview.", "Focus trap is off by default (`trapFocus={false}`) — set it if the content has inputs."],
  "progress.tsx": ["feedback", "Upload and checkout steps; also a nice analogue for this site's intro curtain line.", "Needs a `value` update loop if it should animate while indeterminate."],
  "radio-group.tsx": ["controls", "Single choice among 3–5 options (concentration, size).", "Give every item an `id` + `Label`, or it's inaccessible."],
  "resizable.tsx": ["data", "Split view in a back-office (editor + preview).", "Wraps `react-resizable-panels`; persisted layout needs your own storage code."],
  "scroll-area.tsx": ["data", "Custom-scrollbar panel inside a fixed-height modal list.", "Beware the interaction with Lenis: mark the scroll node `data-lenis-prevent` or smooth scroll fights it."],
  "select.tsx": ["controls", "Styled select with search-free option list, groups and labels.", "Heavier than `native-select.tsx` and worse on mobile keyboards; reach for it only when the design needs per-option layout."],
  "separator.tsx": ["misc", "Rule between footer columns or in menus.", "One line: `orientation` and `decorative` handled."],
  "sheet.tsx": ["overlays", "Side panel for filters or bag. Five side positions.", "Same caution as drawer: portal + body scroll lock collide with Lenis."],
  "sidebar.tsx": ["navigation", "Full app sidebar: collapsible, mobile sheet, persistence, active state, `useSidebar()`.", "723 lines and the only component that owns state + context + localStorage. Lift it deliberately, not casually — but it saves a week in an admin UI."],
  "skeleton.tsx": ["feedback", "Suspense fallbacks; matches the site's preloader aesthetic better than a spinner.", "Pair with `prefers-reduced-motion` (the pulse is animation)."],
  "slider.tsx": ["controls", "Intensity/longevity filters in a fragrance finder.", "Radix slider needs an accessible label; the wrapper does not add one."],
  "sonner.tsx": ["feedback", "Production-grade toasts (stacking, promises, action buttons) — replaces this site's 3-line `toast` state.", "Needs `sonner` + `next-themes` and one `<Toaster/>` mounted in the layout."],
  "spinner.tsx": ["feedback", "Loading state on a button.", "4 lines of styling on top of `animate-spin`."],
  "switch.tsx": ["controls", "Boolean settings in a dashboard, 'notify me'.", "Use a checkbox for anything inside a submitted form — switch semantics confuse assistive tech there."],
  "table.tsx": ["data", "Spec tables, order history, admin grids.", "No virtualisation — add `@tanstack/react-table` if rows grow."],
  "tabs.tsx": ["controls", "Note tabs (Opening / Heart / Trail) — the site hand-rolls this exact pattern.", "`tabsListVariants` gives you the trigger-row styling; Radix handles roving focus and arrow keys for free."],
  "textarea.tsx": ["forms", "Message box, review body.", "Autosize isn't included; add `field-sizing-content` in Tailwind v4."],
  "toggle-group.tsx": ["controls", "Multi-select chips (note families, occasion tags).", "Supports `type=\"multiple\"` and `variant=\"single\"` — same component, two semantics."],
  "toggle.tsx": ["controls", "Pressed-state icon buttons (wishlist, compare).", "`toggleVariants` exposed for size styling."],
  "tooltip.tsx": ["overlays", "Icon-only button labels.", "Needs a `TooltipProvider` ancestor; the file exports one — mount it once at the root."],
};

/* ------------------------------------------------------------- extraction */
const uiDir = path.join(root, "components/ui");
const files = (await readdir(uiDir)).filter((f) => f.endsWith(".tsx")).sort();
const catalog = [];
for (const file of files) {
  const src = await readFile(path.join(uiDir, file), "utf8");
  const deps = [
    ...new Set(
      [...src.matchAll(/from "([^"]+)"/g)]
        .map((m) => m[1])
        .filter((d) => !d.startsWith("@/") && d !== "react" && d !== "react-dom"),
    ),
  ];
  const exports = [
    ...new Set(
      [...src.matchAll(/export\s*\{([\s\S]*?)\}/g)]
        .flatMap((m) => m[1].split(","))
        .map((x) => x.trim().split(/\s+as\s+/).pop())
        .filter(Boolean),
    ),
  ];
  const slots = [...new Set([...src.matchAll(/data-slot="([^"]+)"/g)].map((m) => m[1]))];
  catalog.push({
    file,
    name: file.replace(/\.tsx$/, ""),
    exports,
    deps,
    slots,
    variants: /const\s+\w*[Vv]ariants\s*=\s*cva\(/.test(src),
    lines: src.split("\n").length,
    note: NOTES[file] ?? null,
  });
}

const missing = catalog.filter((c) => !c.note);
if (missing.length)
  console.warn(`No curated note for: ${missing.map((m) => m.file).join(", ")}`);

/* ------------------------------------------------- site-level CSS classes */
const css = await readFile(path.join(root, "app/globals.css"), "utf8");
const buckets = new Map();
for (const m of css.matchAll(/^\.([a-z][a-z0-9-]*)\s*[,{:]/gm)) {
  const key = m[1];
  buckets.set(key, (buckets.get(key) ?? 0) + 1);
}
const families = new Map();
for (const [cls, n] of buckets) {
  const fam = cls.split("-")[0];
  const e = families.get(fam) ?? { count: 0, rules: 0, members: [] };
  e.count++;
  e.rules += n;
  e.members.push(cls);
  families.set(fam, e);
}
const familyRows = [...families.entries()]
  .sort((a, b) => b[1].count - a[1].count)
  .map(([fam, e]) => ({ fam, ...e }));

/* ------------------------------------------------- site-level patterns */
const PATTERNS_MD = `These are the 14 patterns that make the page what it is. Every one is anchored by a grep-able name rather than a line number, because line numbers rot and selectors don't.

### 1. Logo curtain / preloader
- **Anchors:** \`app/page.tsx\` → \`.intro-curtain\`, state \`ready\` · \`app/globals.css\` → \`.intro-curtain\`, \`.is-ready\`, \`.is-loading\`, \`@keyframes loading\`
- **What it does:** an ivory full-bleed panel with the brand mark, a hairline progress rule and an eyebrow line; it lifts upward once \`ready\` flips (1800 ms timer, or immediately under \`prefers-reduced-motion\`).
- **Why it's worth stealing:** it hides font + image loading behind a brand moment instead of a spinner, and costs one div plus one transition.
- **Lift it:** keep the timer, but set \`ready\` from \`document.fonts.ready\` + the hero image's \`decode()\` and use the timeout as a fallback ceiling — that removes the arbitrary 1800 ms wait.

### 2. Scrolled-state header
- **Anchors:** \`app/page.tsx\` → state \`sticky\`, \`window.scrollY > 60\` · \`.header\`, \`.header.is-scrolled\`
- **What it does:** transparent over the hero, gains a translucent warm-brown tint once scrolled. Passive scroll listener, no rAF throttle.
- **Watch:** a passive scroll listener doing setState on every pixel is cheap here because the render is tiny; add a \`> 60\` hysteresis (already present) or a threshold comparison before you copy it into a heavier page.

### 3. Photo-painted wordmark (image → logo, no redraw)
- **Anchors:** \`app/page.tsx\` → \`function Brand()\`, inline \`<svg>\` with \`#velora-mark-light\` / \`#velora-mark-dark\` \`feColorMatrix\` filters · \`app/globals.css\` → \`.brand-crop\`
- **What it does:** displays the source photo clipped to a window, then an SVG colour matrix turns luminance into alpha, so a white-on-photo logo becomes a transparent cut-out with zero manual masking. Two filters = light and dark treatments from one asset.
- **Why it's worth stealing:** the fastest way to get a clean mark out of a supplied asset without a design tool.
- **Lift it:** the matrix row \`-1.8 -1.8 -1.8 0 3.6\` is the alpha row — tune those two numbers to control the threshold and softness. Note the payload cost: it ships the whole 2.2 MB PNG to crop it. Bake an SVG before production.

### 4. Line-mask reveal (\`Lines\`)
- **Anchors:** \`app/page.tsx\` → \`function Lines\`, \`.text-mask\`, \`.reveal-line\` · \`app/globals.css\` → \`.text-mask\`
- **What it does:** splits a string on \`\\n\`, wraps each line in an overflow-hidden mask and animates the inner span from \`yPercent: 110\` with \`power3.out\`, \`once: true\`.
- **Why it's worth stealing:** it is the single highest-value motion primitive on the page — reads as expensive editorial type, is 12 lines of JSX and one tween.
- **Lift it:** masks must be \`overflow: hidden\` with \`display: block\` children or descenders clip. For multi-line paragraphs, don't use this — line breaks are visual, not textual; use per-word or per-character instead.

### 5. Per-word scroll scrub (statement)
- **Anchors:** \`app/page.tsx\` → \`t.statement.split(" ").map(...\`, \`.statement-word\` · \`.statement\`
- **What it does:** every word becomes a span; opacity scrubs \`0.2 → 1\` across the section with \`stagger: 0.12\`, so the sentence "focuses" as you read it.
- **Why it's worth stealing:** the effect is legible in a screenshot and works on any long sentence — hero, manifesto, feature intro.
- **Lift it:** scrubbing (\`scrub: 0.6\`) means the user controls the playhead; that's why it feels editorial rather than animated. Keep \`ease: "none"\` on scrubbed tweens or the mapping feels elastic.

### 6. Staggered card grid
- **Anchors:** \`app/page.tsx\` → \`.scent-grid\`, \`.scent-card\` with per-index \`y: [150, 260, 170, 240]\` · \`app/globals.css\` → \`.peach-card\`, \`.jasmine-card\`, \`.bottle-card\`, \`.wood-card\`, \`.card-tag\`, \`.card-plus\`
- **What it does:** four cards each start at a different vertical offset and converge to \`y: 0\` scrubbed to the grid's entry — asymmetric layout that assembles itself.
- **Watch:** the offsets are a positional array indexed by card order. Reorder the markup and the rhythm breaks silently; move the offsets into \`data-offset\` attributes or the model JSON if this becomes a real component.

### 7. Pinned product stage
- **Anchors:** \`app/page.tsx\` → \`gsap.matchMedia().add("(min-width: 800px)", ...)\`, \`pin: ".signature-stage"\`, \`end: "+=1100"\` · \`.signature-stage\`, \`.signature-bottle\`, \`.signature-ghost\`, \`.signature-info\`
- **What it does:** inside a 1100 px scroll track the bottle scales/rotates up, a giant ghost wordmark slides across, and the info column drifts — one timeline, four targets, pinned.
- **Why it's worth stealing:** this is the "product hero you can sell" pattern, and it's gated behind \`gsap.matchMedia()\` so mobile never runs it.
- **Lift it:** \`pin\` creates a spacer; any ScrollTrigger measured *after* it (e.g. lazy images loading) needs \`ScrollTrigger.refresh()\` — the page already schedules refresh on \`document.fonts.ready\`, \`load\`, and a 2500 ms timer. Keep all three.

### 8. Ghost/outline typography
- **Anchors:** \`app/globals.css\` → \`.hero-wordmark\`, \`.signature-ghost\`, \`.footer-wordmark\` (\`-webkit-text-stroke\` / very large clamp)
- **What it does:** oversized brand word sitting under imagery, animated with parallax rather than entrance.
- **Lift it:** needs \`aria-hidden="true"\` (it duplicates the brand name) and \`clamp()\` sizing or it overflows narrow viewports.

### 9. Pointer parallax scene
- **Anchors:** \`app/page.tsx\` → \`.hero-scene\` \`onPointerMove\` / \`onPointerLeave\`, \`gsap.to(..., { duration: 1.6 })\`
- **What it does:** the hero image container follows the cursor by ±9 px / ±5 px with heavy easing; guarded by \`e.pointerType === "mouse"\` and \`prefers-reduced-motion\`.
- **Why it's worth stealing:** correct pointer gating is the part everyone forgets — no parallax on touch, no nausea.
- **Lift it:** keep the motion under ~1.5% of viewport size and always tween back to 0 on leave, or the scene sticks.

### 10. Ken-Burns image breathing
- **Anchors:** \`app/page.tsx\` → \`.world-image img\` (\`yPercent\` + \`scale: 1.15\`), \`.closing-image\` (\`scale 1.2 → 1\`) · \`app/globals.css\` → \`@keyframes floatDown\`
- **What it does:** scroll-scrubbed scale/translate on full-bleed images so photography never sits still.
- **Lift it:** always scale \`> 1\` first, or scrubbing exposes empty edges at the seam.

### 11. One \`<dialog>\`, many panels
- **Anchors:** \`app/page.tsx\` → \`type Panel = "search" | "bag" | "product" | "menu" | "journal" | "care" | null\`, \`dialog\` ref, effect calling \`showModal()\` / \`close()\`, \`onClick\` backdrop hit-test · \`app/globals.css\` → \`.modal\`, \`.side-modal\`, \`.modal-inner\`, \`@keyframes dialogIn\`, \`@keyframes sideIn\`
- **What it does:** a single native dialog whose content is switched by the \`panel\` state — centre modal for product/search/article, \`side-modal\` for bag/menu. Backdrop click closes because \`e.target === e.currentTarget\`.
- **Why it's worth stealing:** native \`<dialog>\` + \`showModal()\` gives you focus trap, \`Esc\`, inertness and top-layer stacking for free. One host means one place to handle Lenis pause, focus restore and \`aria-label\`.
- **Lift it:** the \`panel\` union type *is* the API — add a variant by adding a key to the union, a conditional block, and an \`aria-label\` branch. Keep \`data-lenis-prevent\` on the scrollable inner element.

### 12. Note tabs (accessible, hand-rolled)
- **Anchors:** \`app/page.tsx\` → \`.note-tabs\` with \`role="tablist"\`, state \`note\` · \`app/globals.css\` → \`.note-tabs\`, \`.note-description\`, \`@keyframes noteIn\`
- **What it does:** three tabs driving a crossfading description block, keyboard operable.
- **Lift it:** \`role="tablist"\` is a promise — it requires arrow-key roving focus and \`aria-selected\`. That's exactly the logic \`components/ui/tabs.tsx\` (Radix) already implements; use the primitive instead of re-writing it.

### 13. Bag + offline "save my selection"
- **Anchors:** \`app/page.tsx\` → \`updateBag()\` (clamped 0..20, mirrors to localStorage), \`saveBag()\` (Blob → object URL → \`a.download\` → revoke) · \`.quantity\`, \`<output>\`, \`.bag-item\`, \`.pill\`
- **What it does:** quantity stepper with persisted state, plus a text-file download of the selection instead of a checkout.
- **Why it's worth stealing:** pre-launch commerce done in ~15 lines with no backend, no fake "order placed" lie, and it hands the customer a tangible artifact.
- **Lift it:** always \`URL.revokeObjectURL\` after click; \`<output>\` is the semantically right element for a computed quantity.

### 14. In-page agent tools
- **Anchors:** \`app/page.tsx\` → effect registering \`get_eclat_details\` and \`set_fragrance_selection\` on \`document.modelContext\`, guarded by \`AbortController\`
- **What it does:** exposes typed, JSON-schema'd, read-only-or-scoped tools to the browser's AI layer so an assistant can read product facts or set the bag quantity — with \`readOnlyHint\` annotations and validation that throws on bad input.
- **Why it's worth stealing:** the first place I've seen this shape in a landing page. It degrades to a no-op where \`modelContext\` is absent, so it costs nothing to keep.
- **Lift it:** keep tool state effects routed through the same setters the UI uses (\`updateBag\`, \`setPanel\`) so the AI can't desync the render; always \`signal\`-abort on unmount.

---

## Cross-cutting behaviours (not components, but you re-implement them every time)

| Concern | Implementation here | Reuse rule |
| --- | --- | --- |
| Smooth scroll | \`Lenis({ duration: 1.05, smoothWheel, touchMultiplier: 1, anchors: true })\`, fed by \`gsap.ticker\`, \`smooth.on("scroll", ScrollTrigger.update)\` | Never run Lenis' own rAF alongside GSAP's — one clock, or the scrub jitters |
| Anchor nav | \`go(id)\`: close panel → \`lenis.scrollTo(id, { offset: -90 })\`, fallback \`scrollIntoView\`, \`behavior\` chosen by reduced-motion query | Always offset by header height; here \`scroll-padding-top: 100px\` covers the CSS side |
| Reduced motion | \`matchMedia\` guard returns early from the whole motion effect and sets \`ready\` immediately; CSS has a \`prefers-reduced-motion\` block | Gate at the top of the effect, not per-tween |
| Persistence | \`velora-selection\`, \`velora-language\` keys, each read/write inside \`try/catch\` | Storage throws in private mode and in some embeds; treat every access as fallible |
| Locale | \`content\` dictionary keyed by \`lang\`; \`document.documentElement.lang\` synced in an effect; GSAP effect re-runs on \`[lang]\` so ScrollTrigger re-measures new text heights | Re-registering triggers on locale change is the bug everyone ships — copy this |
| Toast | \`toast\` string state + 3200 ms auto-dismiss + \`role="status"\` | Fine at one per page; reach for \`components/ui/sonner.tsx\` when you need stacking or actions |
| Live region | \`<div className="toast" role="status">\` | Announce async results, never decorative state |

`;

/* ---------------------------------------------------------------- render */
const L = [];
const push = (...s) => L.push(...s);
const byGroup = new Map();
for (const c of catalog) {
  const g = c.note?.[0] ?? "misc";
  if (!byGroup.has(g)) byGroup.set(g, []);
  byGroup.get(g).push(c);
}

push("# Component catalogue");
push("");
push("Two libraries live in this repo and they behave very differently:");
push("");
push("1. **`components/ui/*` — 61 shadcn-style primitives.** Complete, typed, importable, and **not used by a single line of the page**. They came with the starter. `app/globals.css` also never imports the theme layer they depend on, so they render unstyled until you wire it up (see below).");
push("2. **The site's own patterns**, hand-written inside `app/page.tsx` + `app/globals.css` — the curtain, hero parallax, staggered cards, pinned stage, modal multiplexer, toast. These are the pieces worth stealing between projects, and they are *not* extracted into files yet.");
push("");
push("Regenerate this file with `node scripts/build-component-catalog.mjs`.");
push("");
push("## Before you import anything from `components/ui`");
push("");
push("Those files style themselves with semantic tokens (`bg-background`, `text-muted-foreground`, `border-input`, `ring`) that this project does not define. Verified state of the repo:");
push("");
push("```bash");
push(`grep -c -- \"--background\" app/globals.css   # 0 -> no token layer`);
push(`grep -c \"@import\" app/globals.css          # 1 -> only \"tailwindcss\"`);
push("```");
push("");
push("So one of these is required, once per project:");
push("");
push("- run `npx shadcn@latest init` (adds the `:root` / `.dark` token block and `tw-animate-css`), or");
push("- hand-paste a minimal token block and keep `vendor/shadcn-tailwind-4.13.0.css` (MIT, © 2023 shadcn) imported for its `@theme` keyframes + `data-*` custom variants — that file defines motion and variants, **not** colours.");
push("");
push("Then the components drop in as-is. Everything below assumes that step is done.");
push("");
push("## Index of primitives");
push("");
push(`| File | Exports | Direct deps | cva variants | data-slots | Lines |`);
push("| --- | --- | --- | :---: | --- | ---: |");
for (const c of catalog)
  push(
    `| \`${c.file}\` | ${c.exports.map((e) => `\`${e}\``).join(" ") || "—"} | ${c.deps.map((d) => `\`${d}\``).join(" ") || "—"} | ${c.variants ? "●" : ""} | ${c.slots.slice(0, 4).map((s) => `\`${s}\``).join(" ") || "—"}${c.slots.length > 4 ? ` +${c.slots.length - 4}` : ""} | ${c.lines} |`,
  );
push("");
push("## Reuse notes, by group");
push("");
for (const [group, items] of byGroup) {
  push(`### ${GROUPS[group] ?? group}`);
  push("");
  for (const c of items) {
    push(`- **\`${c.file}\`** — ${c.note[1]}`);
    push(`  - *Watch:* ${c.note[2]}`);
    if (c.exports.length)
      push(`  - *Import:* \`${c.exports.join(", ")}\` from \`@/components/ui/${c.name}\``);
  }
  push("");
}

push("## Part 2 — the site's own components");
push("");
push("Everything the page actually renders. Each entry is a pattern you can lift into any marketing site: what it does, where it lives, and the minimum you have to carry over.");
push("");
push(PATTERNS_MD);
push("## Part 3 — CSS class families");
push("");
push("`app/globals.css` is the styling layer for all of the above (no Tailwind utilities in the markup). Family sizes, so you know the blast radius before you lift a pattern:");
push("");
push("| Family | Selectors | Rules | Members |");
push("| --- | ---: | ---: | --- |");
for (const f of familyRows)
  push(
    `| \`.${f.fam}-*\` | ${f.count} | ${f.rules} | ${f.members.slice(0, 8).map((m) => `\`${m}\``).join(" ")}${f.members.length > 8 ? ` +${f.members.length - 8}` : ""} |`,
  );
push("");
push(`Total: ${buckets.size} selectors, ${[...buckets.values()].reduce((a, b) => a + b, 0)} rule blocks, ${css.split("\n").length} lines.`);
push("");

await writeFile(path.join(root, "docs/COMPONENT-CATALOG.md"), `${L.join("\n")}\n`, "utf8");
console.log(`Wrote docs/COMPONENT-CATALOG.md (${catalog.length} primitives, ${familyRows.length} CSS families)`);

/* placeholder replaced below in a second pass */
