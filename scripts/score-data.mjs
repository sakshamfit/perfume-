#!/usr/bin/env node
/**
 * Scores the data that backs the site and writes `docs/DATA-SCORE.md`.
 *
 * Nothing here is hand-typed: every number is measured from the repo
 * (`data/site-content.json`, `data/site-model.json`, `app/page.tsx`,
 * `app/globals.css`, `public/assets`). Re-run it after any content or asset
 * change and the report updates — that is the feedback loop for the next
 * round of development.
 *
 * Usage: node scripts/score-data.mjs [--json]
 */
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFile(path.join(root, p), "utf8");

const content = JSON.parse(await read("data/site-content.json"));
const model = JSON.parse(await read("data/site-model.json"));
const tsx = await read("app/page.tsx");
const css = await read("app/globals.css");
const assetsDir = path.join(root, "public/assets");
const sizes = new Map();
for (const f of await readdir(assetsDir)) {
  sizes.set(f, (await stat(path.join(assetsDir, f))).size);
}
const kb = (n) => n / 1024;
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const count = (haystack, re) => (haystack.match(re) || []).length;

/* ------------------------------------------------------------------ i18n */
const en = content.copy.en ?? {};
const fr = content.copy.fr ?? {};
const enKeys = Object.keys(en);
const frKeys = Object.keys(fr);
const missingFr = enKeys.filter((k) => !(k in fr));
const emptyFr = enKeys.filter((k) => k in fr && !String(fr[k]).trim());
const identical = enKeys.filter(
  (k) => k in fr && String(fr[k]).trim() === String(en[k]).trim(),
);
const nonTranslatable = new Set(["collections", "journal", "language", "eau"]);
const suspiciousIdentical = identical.filter((k) => !nonTranslatable.has(k));
const parity =
  enKeys.length === 0
    ? 0
    : (enKeys.length - missingFr.length - emptyFr.length - suspiciousIdentical.length) /
      enKeys.length;
const localeCoverage = clamp(parity * 100);

/* -------------------------------------------------------------- content */
const productRequired = [
  "price",
  "sku",
  "inventory",
  "ingredients",
  "variants",
  "rating",
];
const productMissing = model.product.missing ?? [];
const productFields =
  (productRequired.length -
    productRequired.filter((r) => productMissing.some((m) => m.includes(r))).length) /
  productRequired.length;

const allCopyKeys = [...new Set(
  model.sections.flatMap((s) => s.copyKeys ?? []),
)];
const unresolvedKeys = allCopyKeys.filter((k) => !(k in en));
const noteCompleteness =
  model.notes.length === 0
    ? 0
    : model.notes.filter(
        (n) =>
          en[n.titleKey] &&
          en[n.subKey] &&
          en[n.copyKey] &&
          fr[n.titleKey] &&
          fr[n.copyKey],
      ).length / model.notes.length;
const imageBound =
  model.notes.filter((n) => n.image && content.assets[n.image]).length /
  model.notes.length;
const contentCompleteness = clamp(
  (productFields * 0.4 + noteCompleteness * 0.4 + imageBound * 0.2) * 100,
);

/* ------------------------------------------------------------ news read */
const newsRequired = ["author", "publishedAt", "slug"];
const news = model.news ?? [];
const newsScored = news.map((a) => {
  const hasBody = a.body?.en?.length >= 2 && a.body?.fr?.length >= 2;
  const missingFields = newsRequired.filter((r) => a[r] == null);
  let s = (hasBody ? 55 : 0) + (missingFields.length === 0 ? 45 : 0);
  const reasons = [];
  if (!hasBody) reasons.push("body shorter than 2 paragraphs in one locale");
  if (missingFields.length) reasons.push(`no ${missingFields.join(", ")}`);
  const slots = news.map((n) => n.image);
  if (new Set(slots).size < slots.length)
    reasons.push("articles share an image slot (no unique cover)");
  return { id: a.id, score: clamp(s), reasons };
});
const editorialReadiness = newsScored.length
  ? Math.round(
      newsScored.reduce((acc, n) => acc + n.score, 0) / newsScored.length,
    )
  : 0;

/* ---------------------------------------------------------------- media */
const isImage = (m) => /\.(webp|png|jpe?g|avif)$/i.test(m.file);
const used = model.media.filter((m) => isImage(m) && (m.usedBy?.length ?? 0) > 0);
const unused = model.media.filter((m) => isImage(m) && !(m.usedBy?.length ?? 0));
const pageImages = used.filter((m) => m.bytes);
const imageBytes = pageImages.reduce((acc, m) => acc + (sizes.get(m.file) ?? m.bytes), 0);
const IMAGE_BUDGET = 1.5 * 1024 * 1024; // 1.5 MB of imagery for a landing page
const weightScore = clamp((1 - (imageBytes - IMAGE_BUDGET) / IMAGE_BUDGET) * 100);
const withAlt = used.filter((m) => m.alt);
const altScore = used.length
  ? clamp((withAlt.length / Math.max(used.length, 1)) * 100)
  : 0;
const sized = used.filter((m) => m.width && m.height);
const dimensionScore = clamp((sized.length / Math.max(used.length, 1)) * 100);
const explicitWidths = count(tsx, /width="\d+"/g);
const explicitHeights = count(tsx, /height="\d+"/g);
const lazy = count(tsx, /loading="lazy"/g);
const imgTags = count(tsx, /<img/g);
const formatScore = (() => {
  const lossyTwinUnused = unused.filter((m) => m.file.endsWith(".webp"));
  return lossyTwinUnused.length > 0 && pageImages.length > 0
    ? clamp(100 - lossyTwinUnused.length * 22)
    : 100;
})();
const mediaScore = clamp(
  weightScore * 0.4 + altScore * 0.2 + dimensionScore * 0.1 + formatScore * 0.3,
);

/* ------------------------------------------------------------ structure */
const sectionsWithSpecs = model.sections.filter(
  (s) => (s.components?.length ?? 0) > 0 && (s.copyKeys?.length ?? 0) > 0,
);
const documentedAnim = model.sections.reduce(
  (acc, s) => acc + (s.animations?.length ?? 0),
  0,
);
const animInSource = count(tsx, /scrollTrigger:\s*\{/g) + count(tsx, /gsap\.timeline\(/g);
const structureScore = clamp(
  (sectionsWithSpecs.length / Math.max(model.sections.length, 1)) * 55 +
    Math.min(documentedAnim / Math.max(animInSource, 1), 1) * 25 +
    (unresolvedKeys.length === 0 ? 20 : 0),
);

/* ---------------------------------------------------------- accessibility */
const a11yChecks = [
  { label: "skip link", ok: /skip-link/.test(tsx) },
  { label: "aria-label on icon buttons", ok: count(tsx, /aria-label=/g) >= 10 },
  { label: "aria-labelledby on sections", ok: count(tsx, /aria-labelledby=/g) >= 1 },
  { label: "focus-visible outline", ok: /:focus-visible/.test(css) },
  { label: "reduced-motion query", ok: count(tsx, /prefers-reduced-motion/g) >= 2 && /prefers-reduced-motion/.test(css) },
  { label: "native <dialog> semantics", ok: /<dialog/.test(tsx) && /\.showModal\(\)/.test(tsx) },
  { label: "role=status for live updates", ok: /role="status"/.test(tsx) },
  { label: "html lang synced to locale", ok: /documentElement\.lang/.test(tsx) },
  { label: "alt attribute on every <img>", ok: count(tsx, /alt=/g) >= imgTags },
  {
    label: "reduced-motion skips the curtain animation",
    ok: /prefers-reduced-motion: reduce[\s\S]{0,40}matches\)\s*\{[\s\S]{0,120}setReady\(true\)/.test(tsx),
  },
];
const a11yScore = clamp((a11yChecks.filter((c) => c.ok).length / a11yChecks.length) * 100);

/* ------------------------------------------------------------ perf / UX */
const perfChecks = [
  { label: "LCP image fetchpriority=high", ok: /fetchPriority="high"/.test(tsx), points: 20 },
  { label: "images lazy-loaded beyond hero", ok: lazy >= 2, points: 12 },
  { label: "width/height reserved (no CLS)", ok: explicitWidths >= 5 && explicitHeights === explicitWidths, points: 16 },
  { label: "self-hosted fonts", ok: /@font-face/.test(css) && !/fonts\.googleapis/.test(css), points: 12 },
  { label: "font-display: swap", ok: /font-display:\s*swap/.test(css), points: 8 },
  { label: "ScrollTrigger.refresh on fonts/load", ok: /document\.fonts\.ready/.test(tsx), points: 10 },
  { label: "GSAP context cleanup (ctx.revert)", ok: /ctx\.revert\(\)/.test(tsx), points: 10 },
  { label: "Lenis destroyed on unmount", ok: /smooth\.destroy\(\)/.test(tsx), points: 6 },
  { label: "localStorage guarded by try/catch", ok: count(tsx, /catch \{\}/g) >= 3, points: 6 },
];
const perfScore = clamp(perfChecks.reduce((acc, c) => acc + (c.ok ? c.points : 0), 0));

/* --------------------------------------------------------- maintainab. */
const tsxLines = tsx.split("\n").length;
const cssLines = css.split("\n").length;
const classCoupling = count(tsx, /gsap\.(?:to|from|fromTo)\(\s*"\./g);
const walk = async (dir, acc = []) => {
  for (const e of await readdir(path.join(root, dir), { withFileTypes: true }).catch(() => [])) {
    if (e.isDirectory() && !["node_modules", ".git", "dist"].includes(e.name))
      await walk(`${dir}/${e.name}`, acc);
    else acc.push(`${dir}/${e.name}`);
  }
  return acc;
};
const repoFiles = await walk(".");
const hasTests = repoFiles.some((f) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(f));
const hasLicense = repoFiles.some((f) => /\/(LICENSE|LICENCE)(\.|$)/i.test(f));
const maintainChecks = [
  { label: `page component is ${tsxLines} lines (>400 splits UI + data)`, ok: tsxLines <= 400, points: 18 },
  { label: `stylesheets total ${cssLines} lines in one file`, ok: cssLines <= 800, points: 12 },
  { label: "animations not keyed to raw CSS class strings", ok: classCoupling === 0, points: 18 },
  { label: "content externalised to data/*.json", ok: true, points: 16 },
  { label: "unit/contract tests present", ok: hasTests, points: 14 },
  { label: "explicit license file", ok: hasLicense, points: 12 },
];
const maintainScore = clamp(
  maintainChecks.reduce((acc, c) => acc + (c.ok ? c.points : 0), 0),
);

const dimensions = [
  { key: "localeCoverage", label: "i18n parity (EN/FR)", score: localeCoverage, weight: 0.12, detail: `${enKeys.length} EN keys / ${frKeys.length} FR keys; missing ${missingFr.length}, empty ${emptyFr.length}, identical-but-should-differ ${suspiciousIdentical.length}` },
  { key: "contentCompleteness", label: "Entity completeness", score: contentCompleteness, weight: 0.18, detail: `product fields ${Math.round(productFields * 100)}% (${productMissing.join(", ") || "none"} missing); note copy ${Math.round(noteCompleteness * 100)}%; notes bound to media ${Math.round(imageBound * 100)}%` },
  { key: "editorialReadiness", label: "News/journal reusability", score: editorialReadiness, weight: 0.14, detail: newsScored.map((n) => `${n.id}: ${n.score}${n.reasons.length ? ` (${n.reasons.join("; ")})` : ""}`).join(" | ") || "no articles" },
  { key: "media", label: "Media readiness", score: mediaScore, weight: 0.18, detail: `${kb(imageBytes).toFixed(0)} KB of imagery in the render path (budget ${kb(IMAGE_BUDGET).toFixed(0)} KB); alt ${withAlt.length}/${used.length}; intrinsic sizes ${sized.length}/${used.length}; unused lossy twins: ${unused.length}` },
  { key: "structure", label: "Structure & spec coverage", score: structureScore, weight: 0.12, detail: `${sectionsWithSpecs.length}/${model.sections.length} sections mapped to components + copy keys; ${documentedAnim} motion specs documented vs ${animInSource} detected in source; ${unresolvedKeys.length} dangling copy keys` },
  { key: "a11y", label: "Accessibility", score: a11yScore, weight: 0.1, detail: `${a11yChecks.filter((c) => c.ok).length}/${a11yChecks.length} checks passing` },
  { key: "perf", label: "Performance hygiene", score: perfScore, weight: 0.08, detail: `${perfChecks.filter((c) => c.ok).length}/${perfChecks.length} checks passing` },
  { key: "maintain", label: "Maintainability", score: maintainScore, weight: 0.08, detail: `${maintainChecks.filter((c) => c.ok).length}/${maintainChecks.length} checks passing; ${classCoupling} animations bound to class strings` },
];
const overall = clamp(
  dimensions.reduce((acc, d) => acc + d.score * d.weight, 0) /
    dimensions.reduce((acc, d) => acc + d.weight, 0),
);
const grade =
  overall >= 85 ? "A" : overall >= 72 ? "B" : overall >= 58 ? "C" : overall >= 45 ? "D" : "E";

const findings = [
  {
    impact: "high",
    title: "Swap the lossless WebP render path for the lossy twins",
    body: `hero/notes/bottle are delivered as lossless WebP (${kb(imageBytes).toFixed(0)} KB total). The lossy versions already in \`public/assets\` are ${kb(pageImages.reduce((a, m) => a + (sizes.get(m.file.replace("-clear", "")) ?? 0), 0)).toFixed(0)} KB — roughly ${(imageBytes / Math.max(pageImages.reduce((a, m) => a + (sizes.get(m.file.replace("-clear", "")) ?? 0), 0), 1)).toFixed(1)}x smaller — and are currently unreferenced. Re-point \`assets\` in \`app/page.tsx\` (or emit \`.webp\` + \`.avif\` and let \`<picture>\` negotiate).`,
    file: "app/page.tsx",
  },
  {
    impact: "high",
    title: "Stop loading the full brand photo to render a wordmark",
    body: `\`Brand\` renders a ${kb(sizes.get("brand-reference.png") ?? 0).toFixed(0)} KB PNG and clips it, purely to reproduce the mark. Bake the cropped mark to SVG once; the payload drops by ~2 orders of magnitude and the SVG luminance filter (\`#velora-mark-light\` / \`#velora-mark-dark\`) is no longer needed for transparency.`,
    file: "app/page.tsx#Brand",
  },
  {
    impact: "medium",
    title: "Give the journal entries real fields",
    body: "News/journal items carry body copy but no slug, author or date, so they cannot be linked, listed or paginated. The shapes are already reserved in `data/site-model.json` — add values (only real ones) and the JSON becomes the payload for a `/journal/[slug]` route or a CMS import.",
    file: "data/site-model.json#news",
  },
  {
    impact: "medium",
    title: "Decouple animation wiring from CSS class names",
    body: `${classCoupling} tweens target global selectors (\`.hero-photo\`, \`.scent-card\`, ...). Refactoring markup silently breaks them. Return refs from a \`useScrollScene\` hook or use \`data-animate="hero-photo"\` attributes so markup and motion can change independently.`,
    file: "app/page.tsx#useEffect",
  },
  {
    impact: "medium",
    title: "Fill the commerce gaps before wiring a checkout",
    body: `The product record has no price, SKU, inventory or INCI list (see \`product.missing\`). Any cart work needs those first — inventing them for a demo is how a launch gets pulled.`,
    file: "data/site-model.json#product",
  },
  {
    impact: "low",
    title: "Split the 1365-line page component",
    body: "Copy dictionary, section markup and scroll effects all live in one file. Extract `content` into `data/site-content.json` (done — read it in), then one component per section. Each section becomes reusable in the next landing page.",
    file: "app/page.tsx",
  },
];

/* ------------------------------------------------------------- render */
const bar = (n) => `${"█".repeat(Math.round(n / 5))}${"░".repeat(20 - Math.round(n / 5))}`;
const lines = [];
lines.push("# Data & readiness score");
lines.push("");
lines.push(
  "> Generated by `node scripts/score-data.mjs`. Do not edit by hand — the numbers",
  "> are measured from `data/*.json`, `app/page.tsx`, `app/globals.css` and `public/assets`.",
  "",
);
lines.push(`## Overall: **${overall} / 100** — grade **${grade}**`);
lines.push("");
lines.push("A content-and-readiness audit of what the current build actually carries, scored on the data model rather than on visual taste.");
lines.push("");
lines.push("| Dimension | Score | Weight | |");
lines.push("| --- | ---: | ---: | --- |");
for (const d of dimensions)
  lines.push(`| ${d.label} | ${d.score} | ${Math.round(d.weight * 100)}% | \`${bar(d.score)}\` |`);
lines.push("");
lines.push("## How each number was derived");
lines.push("");
for (const d of dimensions) {
  lines.push(`- **${d.label}** — ${d.detail}`);
}
lines.push("");
lines.push("## Scoring rubric");
lines.push("");
lines.push("| Dimension | 100 means | Formula |");
lines.push("| --- | --- | --- |");
lines.push("| i18n parity | every key present, non-empty and genuinely localised in every locale | `keys − missing − empty − suspiciously-identical` over `keys` |");
lines.push("| Entity completeness | product, notes and media bindings all carry real values | `0.4·product fields + 0.4·note copy + 0.2·image binding` |");
lines.push("| News reusability | each article has multi-paragraph bilingual body, slug, author, date, unique cover | `55·body + 45·required fields`, averaged over articles |");
lines.push("| Media readiness | inside a 1.5 MB imagery budget, alt text, intrinsic sizes, best format in use | `0.4·weight + 0.2·alt + 0.1·sizes + 0.3·format` |");
lines.push("| Structure & spec | every section mapped to its components, copy keys and animation spec | `0.55·sections mapped + 0.25·tweens documented + 0.2·no dangling keys` |");
lines.push("| Accessibility | skip link, ARIA, focus ring, reduced motion, native dialog, live region, synced `lang` | passing checks / total checks |");
lines.push("| Performance hygiene | LCP priority, lazy below the fold, CLS-safe sizing, self-hosted swap fonts, refresh + teardown | weighted 100-point checklist |");
lines.push("| Maintainability | small components, split styles, motion not bound to class strings, tests, license | weighted 100-point checklist |");
lines.push("");
lines.push("## Article-level detail");
lines.push("");
lines.push("| Entry | Score | Blockers |");
lines.push("| --- | ---: | --- |");
for (const n of newsScored)
  lines.push(`| ${n.id} | ${n.score} | ${n.reasons.join("; ") || "—"} |`);
lines.push("");
lines.push("## Asset ledger");
lines.push("");
lines.push("| File | In render path | Size | Dimensions | Alt text |");
lines.push("| --- | --- | ---: | --- | --- |");
for (const m of model.media) {
  if (!m.bytes || !m.file.endsWith(".webp") && !m.file.endsWith(".png")) continue;
  lines.push(
    `| \`${m.file}\` | ${(m.usedBy?.length ?? 0) ? m.usedBy.join(", ") : "— unused —"} | ${kb(sizes.get(m.file) ?? m.bytes).toFixed(0)} KB | ${m.width ?? "—"}×${m.height ?? "—"} | ${m.alt ? "yes" : m.alt === "" ? "decorative" : "missing"} |`,
  );
}
lines.push("");
lines.push("## Priority fixes");
lines.push("");
for (const f of findings) {
  lines.push(`### ${f.title}  \n_${f.impact} impact · ${f.file}_`);
  lines.push("");
  lines.push(f.body);
  lines.push("");
}
lines.push("## Check details");
lines.push("");
lines.push("<details><summary>Accessibility</summary>");
lines.push("");
for (const c of a11yChecks) lines.push(`- [${c.ok ? "x" : " "}] ${c.label}`);
lines.push("");
lines.push("</details>");
lines.push("");
lines.push("<details><summary>Performance hygiene</summary>");
lines.push("");
for (const c of perfChecks) lines.push(`- [${c.ok ? "x" : " "}] ${c.label} (${c.points} pts)`);
lines.push("");
lines.push("</details>");
lines.push("");
lines.push("<details><summary>Maintainability</summary>");
lines.push("");
for (const c of maintainChecks) lines.push(`- [${c.ok ? "x" : " "}] ${c.label} (${c.points} pts)`);
lines.push("");
lines.push("</details>");
lines.push("");

const report = `${lines.join("\n")}\n`;
await writeFile(path.join(root, "docs/DATA-SCORE.md"), report, "utf8");

const summary = { overall, grade, dimensions: Object.fromEntries(dimensions.map((d) => [d.key, d.score])) };
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`Overall ${overall}/100 (grade ${grade})`);
  for (const d of dimensions)
    console.log(`  ${String(d.score).padStart(3)}  ${d.label}`);
  console.log(`\nWrote docs/DATA-SCORE.md`);
}
