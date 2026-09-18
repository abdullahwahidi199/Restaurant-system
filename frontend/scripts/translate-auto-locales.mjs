import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const localeDirectory = path.resolve("src/locals/auto");
const english = JSON.parse(fs.readFileSync(path.join(localeDirectory, "en.json"), "utf8"));
const endpoint = "https://edge.microsoft.com/translate/translatetext";
const batchSize = 50;
const languageTargets = {
  fa: "prs",
  ps: "ps",
};

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function ordered(value) {
  return Object.fromEntries(Object.keys(english).map((key) => [key, value[key]]));
}

async function translateBatch(texts, target, attempt = 1) {
  const url = `${endpoint}?from=en&to=${target}&isEnterpriseClient=false`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(texts),
    });
    if (!response.ok) throw new Error(`Translation request failed with HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload) || payload.length !== texts.length) {
      throw new Error("Translation response did not match the request batch.");
    }
    return payload.map((entry, index) => entry.translations?.[0]?.text?.trim() || texts[index]);
  } catch (error) {
    if (attempt >= 4) throw error;
    await delay(500 * 2 ** attempt);
    return translateBatch(texts, target, attempt + 1);
  }
}

for (const [language, target] of Object.entries(languageTargets)) {
  const localeFile = path.join(localeDirectory, `${language}.json`);
  const translated = fs.existsSync(localeFile)
    ? JSON.parse(fs.readFileSync(localeFile, "utf8"))
    : {};
  const pending = Object.keys(english).filter((key) => !translated[key]);

  for (let offset = 0; offset < pending.length; offset += batchSize) {
    const keys = pending.slice(offset, offset + batchSize);
    const values = keys.map((key) => english[key]);
    const results = await translateBatch(values, target);
    keys.forEach((key, index) => {
      translated[key] = results[index];
    });
    fs.writeFileSync(localeFile, `${JSON.stringify(ordered(translated), null, 2)}\n`);
    console.log(`${language}: ${Math.min(offset + keys.length, pending.length)}/${pending.length}`);
  }

  fs.writeFileSync(localeFile, `${JSON.stringify(ordered(translated), null, 2)}\n`);
}

console.log(`Completed automatic locale catalogs in ${path.relative(process.cwd(), localeDirectory)}.`);
