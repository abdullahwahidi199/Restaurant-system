import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");
const languages = ["en", "fa", "ps"];

function flatten(value, prefix = "", result = {}) {
  for (const [key, entry] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      flatten(entry, fullKey, result);
    } else {
      result[fullKey] = entry;
    }
  }
  return result;
}

function load(language) {
  const base = JSON.parse(fs.readFileSync(path.join(root, "locals", `${language}.json`), "utf8"));
  base.landing = JSON.parse(
    fs.readFileSync(path.join(root, "locals", "landing", `${language}.json`), "utf8"),
  );
  base.legacy = JSON.parse(
    fs.readFileSync(path.join(root, "locals", "auto", `${language}.json`), "utf8"),
  );
  return flatten(base);
}

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "locals" ? [] : files(fullPath);
    return /\.[jt]sx?$/.test(entry.name) ? [fullPath] : [];
  });
}

const catalogs = Object.fromEntries(languages.map((language) => [language, load(language)]));
const englishKeys = Object.keys(catalogs.en);
let failed = false;

for (const language of languages.slice(1)) {
  const missing = englishKeys.filter((key) => !(key in catalogs[language]));
  const extra = Object.keys(catalogs[language]).filter((key) => !(key in catalogs.en));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`${language}: ${missing.length} missing; ${extra.length} extra keys.`);
    if (missing.length) console.error(`  Missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`  Extra: ${extra.join(", ")}`);
  }
}

const usedKeys = new Map();
const staticTranslation = /\b(?:t|autoT)\(\s*["']([^"']+)["']/g;
for (const file of files(root)) {
  const source = fs.readFileSync(file, "utf8");
  let match;
  while ((match = staticTranslation.exec(source))) {
    const key = match[1];
    if (!usedKeys.has(key)) usedKeys.set(key, []);
    usedKeys.get(key).push(path.relative(process.cwd(), file).replaceAll(path.sep, "/"));
  }
}

const missingUsedKeys = [...usedKeys].filter(([key]) => {
  if (key in catalogs.en) return false;
  return !["_one", "_other"].some((suffix) => `${key}${suffix}` in catalogs.en);
});

if (missingUsedKeys.length) {
  failed = true;
  console.error(`${missingUsedKeys.length} statically used translation keys are missing:`);
  for (const [key, locations] of missingUsedKeys) {
    console.error(`  ${key}: ${[...new Set(locations)].join(", ")}`);
  }
}

if (!failed) {
  console.log(
    `Locale catalogs are aligned (${englishKeys.length} leaf keys); ` +
      `${usedKeys.size} static translation keys resolve.`,
  );
}

process.exitCode = failed ? 1 : 0;
