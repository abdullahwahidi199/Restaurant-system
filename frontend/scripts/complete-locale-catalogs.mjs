import fs from "node:fs";
import path from "node:path";

const localeDirectory = path.resolve("src/locals");
const english = JSON.parse(fs.readFileSync(path.join(localeDirectory, "en.json"), "utf8"));
const endpoint = "https://edge.microsoft.com/translate/translatetext";

const migrations = {
  fa: {
    "checkout.location": "location",
    "checkout.order": "order",
  },
  ps: {
    "checkout.location": "location",
    "checkout.order": "order",
    "orders.no_orders": "orders.empty",
    "orders.labels.cancel_available_for": "orders.cancelAvailable",
    "orders.labels.cancel_order": "orders.cancelButton",
    "orders.labels.rate": "orders.rate",
    "orders.labels.total": "orders.total",
  },
};

function get(value, dottedKey) {
  return dottedKey.split(".").reduce((current, key) => current?.[key], value);
}

function set(value, dottedKey, entry) {
  const segments = dottedKey.split(".");
  const finalKey = segments.pop();
  const target = segments.reduce((current, key) => (current[key] ||= {}), value);
  target[finalKey] = entry;
}

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

function rebuild(reference, translated, prefix = "") {
  return Object.fromEntries(
    Object.entries(reference).map(([key, entry]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        return [key, rebuild(entry, translated, fullKey)];
      }
      return [key, translated[fullKey]];
    }),
  );
}

function maskPlaceholders(text) {
  const placeholders = [];
  const masked = text.replace(/\{\{[^}]+\}\}/g, (placeholder) => {
    const marker = `ZXQVAR${placeholders.length}QXZ`;
    placeholders.push([marker, placeholder]);
    return marker;
  });
  return { masked, placeholders };
}

async function translate(texts, target) {
  const prepared = texts.map(maskPlaceholders);
  const response = await fetch(
    `${endpoint}?from=en&to=${target}&isEnterpriseClient=false`,
    {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify(prepared.map(({ masked }) => masked)),
    },
  );
  if (!response.ok) throw new Error(`Translation request failed with HTTP ${response.status}`);
  const payload = await response.json();
  return payload.map((entry, index) => {
    let result = entry.translations?.[0]?.text?.trim() || texts[index];
    for (const [marker, placeholder] of prepared[index].placeholders) {
      result = result.replaceAll(marker, placeholder);
    }
    return result;
  });
}

const englishFlat = flatten(english);

for (const [language, targetLanguage] of Object.entries({ fa: "prs", ps: "ps" })) {
  const file = path.join(localeDirectory, `${language}.json`);
  const locale = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const [destination, source] of Object.entries(migrations[language])) {
    const migrated = get(locale, source);
    if (migrated !== undefined) set(locale, destination, migrated);
  }

  const localeFlat = flatten(locale);
  const reusableByEnglish = new Map();
  for (const [key, englishValue] of Object.entries(englishFlat)) {
    const translatedValue = localeFlat[key];
    if (
      typeof englishValue === "string" &&
      typeof translatedValue === "string" &&
      translatedValue !== englishValue &&
      !reusableByEnglish.has(englishValue)
    ) {
      reusableByEnglish.set(englishValue, translatedValue);
    }
  }

  const pendingKeys = [];
  for (const [key, englishValue] of Object.entries(englishFlat)) {
    if (localeFlat[key] === undefined && reusableByEnglish.has(englishValue)) {
      localeFlat[key] = reusableByEnglish.get(englishValue);
    }
    const missing = localeFlat[key] === undefined;
    const unfinishedSettings =
      (key === "nav.inventory" || key.startsWith("settings_center.")) &&
      localeFlat[key] === englishValue &&
      typeof englishValue === "string" &&
      /[A-Za-z]/.test(englishValue);
    if (missing || unfinishedSettings) pendingKeys.push(key);
  }

  for (let offset = 0; offset < pendingKeys.length; offset += 50) {
    const keys = pendingKeys.slice(offset, offset + 50);
    const results = await translate(keys.map((key) => englishFlat[key]), targetLanguage);
    keys.forEach((key, index) => {
      localeFlat[key] = results[index];
    });
  }

  const completed = rebuild(english, localeFlat);
  fs.writeFileSync(file, `${JSON.stringify(completed, null, 2)}\n`);
  console.log(`${language}: completed ${pendingKeys.length} missing or untranslated entries.`);
}
