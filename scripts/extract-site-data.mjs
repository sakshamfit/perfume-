#!/usr/bin/env node
/**
 * Extracts the site's content data out of `app/page.tsx` and writes it to
 * `data/site-content.json` as the single source of truth for future work
 * (new locales, CMS migration, marketing pages, tests, copy audits).
 *
 * Why: every string in the current build lives inside a React component. Once
 * it is a JSON file we can score it, diff it, translate it and feed it to a
 * database without opening the TSX again.
 *
 * Usage: node scripts/extract-site-data.mjs [--check]
 *   --check  exit 1 if the committed JSON is stale (used by CI / pre-commit)
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "app/page.tsx");
const outFile = path.join(root, "data/site-content.json");

/** Returns the object-literal text that starts at `open` (index of `{`). */
function matchBraces(text, open) {
  let depth = 0;
  let i = open;
  let quote = null;
  while (i < text.length) {
    const ch = text[i];
    const prev = text[i - 1];
    if (quote) {
      if (ch === quote && prev !== "\\") quote = null;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(open, i + 1);
    }
    i++;
  }
  throw new Error("Unbalanced braces while extracting an object literal");
}

function extractLiteral(text, name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*\\{`);
  const found = re.exec(text);
  if (!found) throw new Error(`Could not find "const ${name} = {"`);
  const open = found.index + found[0].length - 1;
  const literal = matchBraces(text, open);
  // The literals are plain data (strings, arrays, numbers) so evaluating them
  // in a closed Function scope is safe and keeps us from re-writing a parser.
  return new Function(`return (${literal});`)();
}

const keyOrder = (obj) => Object.keys(obj).sort();

const text = await readFile(source, "utf8");
const assets = extractLiteral(text, "assets");
const content = extractLiteral(text, "content");

// Pull the section outline straight out of the JSX so the structural data
// stays in sync with the markup instead of drifting in a hand-written doc.
const sections = [...text.matchAll(/<section[^>]*?id="([^"]+)"[^>]*?className="([^"]+)"/g)]
  .map(([, id, className]) => ({ id, className }))
  .concat(
    [...text.matchAll(/<section[^>]*?className="([^"]+)"[^>]*?id="([^"]+)"/g)].map(
      ([, className, id]) => ({ id, className }),
    ),
  )
  .filter((s) => s.id && s.className);

const uniqueSections = [
  ...new Map(sections.map((s) => [`${s.id}#${s.className}`, s])).values(),
];

const data = {
  generatedFrom: "app/page.tsx",
  generatedBy: "scripts/extract-site-data.mjs",
  locales: keyOrder(content),
  assets,
  copy: content,
  sections: uniqueSections,
};

const json = `${JSON.stringify(data, null, 2)}\n`;

if (process.argv.includes("--check")) {
  if (!existsSync(outFile) || (await readFile(outFile, "utf8")) !== json) {
    console.error("data/site-content.json is stale. Run: node scripts/extract-site-data.mjs");
    process.exit(1);
  }
  console.log("data/site-content.json is up to date.");
  process.exit(0);
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, json, "utf8");

const keyCount = keyOrder(content.en).length;
console.log(`Wrote ${path.relative(root, outFile)}`);
console.log(`  locales        : ${data.locales.join(", ")}`);
console.log(`  copy keys/lang : ${keyCount}`);
console.log(`  asset entries  : ${Object.keys(assets).length}`);
console.log(`  sections found : ${data.sections.length}`);
