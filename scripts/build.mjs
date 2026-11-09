// Build Orca themes + terminal themes from the KTRZ Monokai palettes.
//
//   node scripts/build.mjs          regenerate themes/ and terminal/
//   node scripts/build.mjs --check  fail if the generated files are stale
//
// Palette sources (derived from ixkaito/ktrz-monokai, MIT):
//   scripts/ktrz-palette.json        dark
//   scripts/ktrz-palette-light.json  light companion (darkened hues)
// Do not edit themes/*.json or terminal/*.json by hand — change a palette or the
// mapping below and rebuild.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = (f) => JSON.parse(readFileSync(join(root, "scripts", f), "utf8"));

// --- color helpers ---------------------------------------------------------
const hex = (c) => {
  const m = c.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
};
const toHex = (rgb) =>
  "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
// mix(base, over, t): composite `over` onto `base` at opacity t (0..1).
const mix = (base, over, t) => {
  const a = hex(base), b = hex(over);
  return toHex([0, 1, 2].map((i) => a[i] * (1 - t) + b[i] * t));
};

// --- UI tokens (Orca app chrome) ------------------------------------------
const buildTokens = (p) => ({
  "--background": p.bg,
  "--editor-surface": p.bg,
  "--foreground": p.fg,
  "--card": p.bgDark,
  "--card-foreground": p.fg,
  "--popover": p.bgLight,
  "--popover-foreground": p.fg,
  "--primary": p.accent,
  "--primary-foreground": p.onAccent,
  "--secondary": p.bgLight,
  "--secondary-foreground": p.fg,
  "--muted": p.bgDark,
  "--muted-foreground": p.muted,
  "--accent": p.bgLight,
  "--accent-foreground": p.fg,
  "--border": p.line,
  "--input": p.line,
  "--ring": p.accent,
  "--chart-1": p.cyan,
  "--chart-2": p.yellow,
  "--chart-3": p.green,
  "--chart-4": p.orange,
  "--chart-5": p.purple,
  "--sidebar": p.bgLight,
  "--sidebar-foreground": p.muted,
  "--sidebar-primary": p.accent,
  "--sidebar-primary-foreground": p.onAccent,
  "--sidebar-accent": p.bg,
  "--sidebar-accent-foreground": p.fg,
  "--sidebar-border": p.bgDark,
  "--sidebar-ring": p.accent,
  "--worktree-sidebar-active": mix(p.bg, p.accent, 0.18), // derived accent tint
  "--tab-bar": p.bgLight,
  "--tab-active": p.bg,
  "--tab-active-foreground": p.fg,
  "--tab-active-indicator": p.accent,
  "--tab-inactive": p.bgLight,
  "--tab-inactive-foreground": p.mutedDim,
  "--split-divider": p.line,
  "--split-divider-hover": p.accent,
  "--chat-user-message": p.bgDark,
  "--text-link": p.accent,
  "--diff-added": p.green,
  "--diff-added-background": mix(p.bgDark, p.green, 0.12),     // derived
  "--diff-added-emphasis": mix(p.bgDark, p.green, 0.22),       // derived
  "--diff-removed": p.deleted,
  "--diff-removed-background": mix(p.bgDark, p.deleted, 0.12), // derived
  "--diff-removed-emphasis": mix(p.bgDark, p.deleted, 0.22),   // derived
  "--git-decoration-added": p.green,
  "--git-decoration-modified": p.yellow,
  "--git-decoration-deleted": p.deleted,
  "--git-decoration-renamed": p.cyan,
  "--git-decoration-untracked": p.green,
  "--git-decoration-copied": p.green,
  "--git-decoration-ignored": p.comment,
});

// --- Syntax (TextMate scopes), faithful to KTRZ Monokai -------------------
const fg = (foreground, fontStyle) => (fontStyle ? { foreground, fontStyle } : { foreground });
const buildTokenColors = (p) => [
  { name: "Comments", scope: ["comment", "punctuation.definition.comment"], settings: fg(p.comment) },
  { name: "Strings", scope: ["string", "punctuation.definition.string", "markup.inline.raw", "markup.raw"], settings: fg(p.yellow) },
  { name: "Regular expressions", scope: ["string.regexp"], settings: fg(p.yellow) },
  { name: "Numbers", scope: ["constant.numeric"], settings: fg(p.purple) },
  { name: "Built-in constants", scope: ["constant.language", "constant.character", "constant.other"], settings: fg(p.purple) },
  { name: "Constants", scope: ["constant", "variable.other.constant", "variable.other.enummember"], settings: fg(p.purple) },
  { name: "Variables", scope: ["variable", "variable.other"], settings: fg(p.fg) },
  { name: "Parameters", scope: ["variable.parameter"], settings: fg(p.orange, "italic") },
  { name: "Keywords", scope: ["keyword", "keyword.control"], settings: fg(p.red) },
  { name: "Operators", scope: ["keyword.operator"], settings: fg(p.red) },
  { name: "Storage", scope: ["storage", "storage.modifier"], settings: fg(p.red) },
  { name: "Storage type", scope: ["storage.type"], settings: fg(p.cyan, "italic") },
  { name: "Class name", scope: ["entity.name.class", "entity.name.type.class"], settings: fg(p.green) },
  { name: "Inherited class", scope: ["entity.other.inherited-class"], settings: fg(p.green, "italic") },
  { name: "Types", scope: ["entity.name.type", "support.type", "support.class"], settings: fg(p.cyan, "italic") },
  { name: "Function name", scope: ["entity.name.function", "meta.function-call.generic", "variable.function", "variable.annotation", "support.function.go"], settings: fg(p.green) },
  { name: "Library functions", scope: ["support.function"], settings: fg(p.cyan) },
  { name: "Library constants", scope: ["support.constant"], settings: fg(p.cyan) },
  { name: "Tags", scope: ["entity.name.tag"], settings: fg(p.red) },
  { name: "Tag attributes", scope: ["entity.other.attribute-name"], settings: fg(p.green) },
  // Markdown — Orca is a markdown-first knowledge base, so these carry weight.
  { name: "Headings", scope: ["markup.heading", "markup.heading entity.name", "entity.name.section"], settings: fg(p.green, "bold") },
  { name: "Bold", scope: ["markup.bold"], settings: fg(p.red, "bold") },
  { name: "Italic", scope: ["markup.italic"], settings: fg(p.purple, "italic") },
  { name: "Bold italic", scope: ["markup.italic markup.bold", "markup.bold markup.italic"], settings: { fontStyle: "bold italic" } },
  { name: "Links", scope: ["markup.underline.link", "string.other.link"], settings: fg(p.cyan) },
  { name: "Quotes", scope: ["markup.quote"], settings: fg(p.yellow, "italic") },
  { name: "List markers", scope: ["markup.list punctuation.definition.list.begin", "punctuation.definition.list"], settings: fg(p.yellow) },
  { name: "Tables", scope: ["markup.table"], settings: fg(p.cyan) },
  { name: "Separators", scope: ["meta.separator"], settings: fg(p.comment, "bold") },
  { name: "Inserted", scope: ["markup.inserted"], settings: fg(p.green) },
  { name: "Changed", scope: ["markup.changed"], settings: fg(p.yellow) },
  { name: "Deleted", scope: ["markup.deleted"], settings: fg(p.deleted) },
  { name: "Strikethrough", scope: ["markup.strike", "markup.strikethrough"], settings: fg(p.strike, "strikethrough") },
  { name: "Invalid", scope: ["invalid", "invalid.deprecated"], settings: fg(p.fg) },
];

const buildTheme = (p, base) => ({ base, tokens: buildTokens(p), tokenColors: buildTokenColors(p) });

const buildTerminal = (p, mode) => ({
  schemaVersion: 1,
  mode,
  terminal: {
    background: p.termBg,
    foreground: p.termFg,
    cursor: p.fg,
    selectionBackground: mix(p.bg, p.fg, 0.18),
    selectionForeground: p.fg,
    cursorAccent: p.termBg,
    black: p.ansiBlack,
    red: p.red,
    green: p.green,
    yellow: p.yellow,
    blue: p.purple,
    magenta: p.red,
    cyan: p.cyan,
    white: p.ansiWhite,
    brightBlack: p.ansiBrightBlack,
    brightRed: p.deleted,
    brightGreen: p.green,
    brightYellow: p.yellow,
    brightBlue: p.purple,
    brightMagenta: p.red,
    brightCyan: p.cyan,
    brightWhite: p.ansiBrightWhite,
  },
});

// --- variants --------------------------------------------------------------
const dark = load("ktrz-palette.json");
const light = load("ktrz-palette-light.json");
const outputs = {
  "themes/ktrz-monokai.json": buildTheme(dark, "dark"),
  "themes/ktrz-monokai-light.json": buildTheme(light, "light"),
  "terminal/ktrz-monokai.json": buildTerminal(dark, "dark"),
  "terminal/ktrz-monokai-light.json": buildTerminal(light, "light"),
};

// --- emit ------------------------------------------------------------------
const check = process.argv.includes("--check");
let stale = false;
for (const [rel, data] of Object.entries(outputs)) {
  const text = JSON.stringify(data, null, 2) + "\n";
  const full = join(root, rel);
  if (check) {
    let cur = "";
    try { cur = readFileSync(full, "utf8"); } catch {}
    if (cur !== text) { stale = true; console.error(`stale: ${rel}`); }
  } else {
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, text);
    console.log(`wrote ${rel}`);
  }
}
if (check && stale) { console.error("run: node scripts/build.mjs"); process.exit(1); }
if (check) console.log("themes are up to date");
