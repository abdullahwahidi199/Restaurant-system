import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";

const traverse = traverseModule.default;
const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "src");
const autoLocaleDirectory = path.join(sourceRoot, "locals", "auto");
const writeSources = process.argv.includes("--write");
const extractOnly = process.argv.includes("--extract");
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const userFacingAttributes = new Set([
  "alt",
  "aria-label",
  "label",
  "placeholder",
  "title",
  "description",
  "empty",
  "emptyText",
  "subtitle",
  "trendLabel",
  "helper",
  "message",
  "eyebrow",
  "confirmLabel",
  "loadingLabel",
  "hint",
  "subtext",
  "breadcrumb",
]);
const userFacingProperties = new Set([
  "label",
  "title",
  "description",
  "empty",
  "emptyText",
  "subtitle",
  "trendLabel",
  "helper",
  "message",
  "eyebrow",
  "confirmLabel",
  "loadingLabel",
  "hint",
  "subtext",
  "breadcrumb",
]);
const userFacingDefaults = new Set([
  "label",
  "title",
  "description",
  "empty",
  "emptyText",
  "subtitle",
  "placeholder",
  "message",
  "hint",
  "restaurantName",
]);

if (!writeSources && !extractOnly) {
  console.error("Use --extract to create the English catalog or --write to update sources.");
  process.exit(2);
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "locals") return [];
      return listFiles(fullPath);
    }
    return sourceExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
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

function loadLocale(language) {
  const base = flatten(
    JSON.parse(fs.readFileSync(path.join(sourceRoot, "locals", `${language}.json`), "utf8")),
  );
  const landing = flatten(
    JSON.parse(
      fs.readFileSync(path.join(sourceRoot, "locals", "landing", `${language}.json`), "utf8"),
    ),
  );
  for (const [key, value] of Object.entries(landing)) base[`landing.${key}`] = value;
  return base;
}

const locales = Object.fromEntries(["en", "fa", "ps"].map((language) => [language, loadLocale(language)]));
const existingKeysByEnglish = new Map();

for (const [key, value] of Object.entries(locales.en)) {
  if (typeof value !== "string") continue;
  if (!(key in locales.fa) || !(key in locales.ps)) continue;
  if (!existingKeysByEnglish.has(value.trim())) existingKeysByEnglish.set(value.trim(), key);
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isUserFacing(value) {
  const text = normalize(value);
  return text.length > 1 && /[A-Za-z]/.test(text) && !/^(https?:|\/|\.\/|\.\.\/)/.test(text);
}

function generatedKey(text) {
  const slug = text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 54) || "text";
  const hash = crypto.createHash("sha1").update(text).digest("hex").slice(0, 8);
  return `${slug}_${hash}`;
}

function translationKey(text, autoEnglish) {
  const existing = existingKeysByEnglish.get(text);
  if (existing) return existing;
  const key = generatedKey(text);
  autoEnglish[key] = text;
  return `legacy.${key}`;
}

function componentName(functionPath) {
  if (functionPath.node.id?.name) return functionPath.node.id.name;
  const parent = functionPath.parentPath;
  if (parent?.isVariableDeclarator() && parent.node.id.type === "Identifier") {
    return parent.node.id.name;
  }
  if (parent?.isExportDefaultDeclaration()) return "DefaultComponent";
  if (parent?.isCallExpression()) {
    const variable = parent.parentPath;
    if (variable?.isVariableDeclarator() && variable.node.id.type === "Identifier") {
      return variable.node.id.name;
    }
  }
  return "";
}

function findComponentOwner(nodePath) {
  const functions = [];
  for (let current = nodePath.parentPath; current; current = current.parentPath) {
    if (current.isFunction()) functions.push(current);
  }
  return functions.find((candidate) => /^[A-Z]/.test(componentName(candidate))) || null;
}

function existingTranslator(owner) {
  let translator = null;
  owner.traverse({
    Function(innerPath) {
      if (innerPath.node !== owner.node) innerPath.skip();
    },
    VariableDeclarator(variablePath) {
      const { id, init } = variablePath.node;
      if (
        init?.type !== "CallExpression" ||
        init.callee?.type !== "Identifier" ||
        !["useTranslation", "useAutoTranslation"].includes(init.callee.name) ||
        id?.type !== "ObjectPattern"
      ) {
        return;
      }
      const property = id.properties.find(
        (entry) => entry.type === "ObjectProperty" && entry.key?.name === "t",
      );
      if (property?.value?.type === "Identifier") translator = property.value.name;
    },
  });
  return translator;
}

function importPath(fromFile, targetFile) {
  let relativePath = path.relative(path.dirname(fromFile), targetFile).replaceAll(path.sep, "/");
  relativePath = relativePath.replace(/\.[jt]sx?$/, "");
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

function applyEdits(source, edits) {
  const sorted = [...edits].sort((left, right) => {
    if (right.start !== left.start) return right.start - left.start;
    return right.end - left.end;
  });
  let result = source;
  let previousStart = source.length + 1;
  for (const edit of sorted) {
    if (edit.end > previousStart && edit.start !== edit.end) {
      throw new Error(`Overlapping localization edits near offset ${edit.start}`);
    }
    result = `${result.slice(0, edit.start)}${edit.value}${result.slice(edit.end)}`;
    previousStart = edit.start;
  }
  return result;
}

const existingAutoEnglishFile = path.join(autoLocaleDirectory, "en.json");
const autoEnglish = fs.existsSync(existingAutoEnglishFile)
  ? JSON.parse(fs.readFileSync(existingAutoEnglishFile, "utf8"))
  : {};
let changedFileCount = 0;
let replacementCount = 0;

for (const file of listFiles(sourceRoot)) {
  const source = fs.readFileSync(file, "utf8");
  let ast;
  try {
    ast = parse(source, {
      sourceType: "module",
      plugins: ["jsx", "classProperties", "optionalChaining"],
    });
  } catch (error) {
    console.error(`Could not parse ${path.relative(projectRoot, file)}: ${error.message}`);
    process.exitCode = 1;
    continue;
  }

  const findings = [];
  let lastImportEnd = 0;

  traverse(ast, {
    ImportDeclaration(importPath) {
      lastImportEnd = Math.max(lastImportEnd, importPath.node.end);
    },
    JSXText(nodePath) {
      const text = normalize(nodePath.node.value);
      if (isUserFacing(text)) findings.push({ kind: "jsxText", nodePath, text });
    },
    JSXAttribute(nodePath) {
      const name = nodePath.node.name?.name;
      const value = nodePath.node.value;
      if (
        userFacingAttributes.has(name) &&
        value?.type === "StringLiteral" &&
        isUserFacing(value.value)
      ) {
        findings.push({ kind: "attribute", nodePath, valueNode: value, text: normalize(value.value) });
      }
    },
    StringLiteral(nodePath) {
      if (!isUserFacing(nodePath.node.value)) return;
      const parent = nodePath.parentPath;
      if (parent?.isJSXAttribute()) return;

      const isObjectCopy =
        parent?.isObjectProperty() &&
        parent.node.value === nodePath.node &&
        userFacingProperties.has(parent.node.key?.name || parent.node.key?.value);

      let expressionContainer = parent?.isJSXExpressionContainer() ? parent : null;
      let current = parent;
      while (!expressionContainer && current && (current.isConditionalExpression() || current.isLogicalExpression())) {
        current = current.parentPath;
        if (current?.isJSXExpressionContainer()) expressionContainer = current;
      }
      const containerAttribute = expressionContainer?.parentPath?.isJSXAttribute()
        ? expressionContainer.parentPath.node.name?.name
        : null;
      const displayExpression =
        Boolean(expressionContainer) &&
        (!containerAttribute || userFacingAttributes.has(containerAttribute));

      if (isObjectCopy || displayExpression) {
        findings.push({
          kind: isObjectCopy ? "objectCopy" : "expressionCopy",
          nodePath,
          valueNode: nodePath.node,
          text: normalize(nodePath.node.value),
        });
      }
    },
    AssignmentPattern(nodePath) {
      const { left, right } = nodePath.node;
      if (
        left.type === "Identifier" &&
        userFacingDefaults.has(left.name) &&
        right.type === "StringLiteral" &&
        isUserFacing(right.value)
      ) {
        findings.push({
          kind: "defaultCopy",
          nodePath,
          valueNode: right,
          text: normalize(right.value),
          forceGlobal: true,
        });
      }
    },
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;
      const argument = nodePath.node.arguments[0];
      const isToast =
        callee?.type === "MemberExpression" &&
        callee.object?.type === "Identifier" &&
        callee.object.name === "toast" &&
        ["success", "error"].includes(callee.property?.name);
      const isMessageSetter =
        callee?.type === "Identifier" && /^(setError|setMessage)$/.test(callee.name);
      if (
        (isToast || isMessageSetter) &&
        argument?.type === "StringLiteral" &&
        isUserFacing(argument.value)
      ) {
        findings.push({ kind: "callArgument", nodePath, valueNode: argument, text: normalize(argument.value) });
      }
    },
  });

  if (!findings.length) continue;

  const ownerDetails = new Map();
  let needsGlobalI18n = false;
  const edits = [];

  for (const finding of findings) {
    const owner = finding.forceGlobal ? null : findComponentOwner(finding.nodePath);
    let translator = "i18n.t";

    if (owner) {
      if (!ownerDetails.has(owner.node)) {
        ownerDetails.set(owner.node, {
          owner,
          translator: existingTranslator(owner) || "autoT",
        });
      }
      translator = ownerDetails.get(owner.node).translator;
    } else {
      needsGlobalI18n = true;
    }

    const key = translationKey(finding.text, autoEnglish);
    const call = `${translator}(${JSON.stringify(key)})`;

    if (finding.kind === "jsxText") {
      const raw = source.slice(finding.nodePath.node.start, finding.nodePath.node.end);
      const firstVisible = raw.search(/\S/);
      const lastVisible = raw.search(/\s*$/);
      const prefix = raw.slice(0, firstVisible);
      const suffix = raw.slice(lastVisible);
      edits.push({
        start: finding.nodePath.node.start,
        end: finding.nodePath.node.end,
        value: `${prefix}{${call}}${suffix}`,
      });
    } else if (finding.kind === "attribute") {
      edits.push({
        start: finding.valueNode.start,
        end: finding.valueNode.end,
        value: `{${call}}`,
      });
    } else {
      edits.push({
        start: finding.valueNode.start,
        end: finding.valueNode.end,
        value: call,
      });
    }
    replacementCount += 1;
  }

  let needsAutoTranslationImport = false;
  for (const { owner, translator } of ownerDetails.values()) {
    if (translator !== "autoT") continue;
    needsAutoTranslationImport = true;
    const body = owner.node.body;
    if (body.type === "BlockStatement") {
      const indentation = " ".repeat((owner.node.loc?.start.column || 0) + 2);
      edits.push({
        start: body.start + 1,
        end: body.start + 1,
        value: `\n${indentation}const { t: autoT } = useAutoTranslation();`,
      });
    } else {
      edits.push({
        start: body.start,
        end: body.start,
        value: "{ const { t: autoT } = useAutoTranslation(); return ",
      });
      edits.push({ start: body.end, end: body.end, value: "; }" });
    }
  }

  const imports = [];
  if (needsAutoTranslationImport && !source.includes("useTranslation as useAutoTranslation")) {
    imports.push('import { useTranslation as useAutoTranslation } from "react-i18next";');
  }
  if (needsGlobalI18n && !/import\s+i18n\s+from/.test(source)) {
    const i18nModule = importPath(file, path.join(sourceRoot, "i18n.js"));
    imports.push(`import i18n from ${JSON.stringify(i18nModule)};`);
  }
  if (imports.length) {
    edits.push({
      start: lastImportEnd,
      end: lastImportEnd,
      value: `${lastImportEnd ? "\n" : ""}${imports.join("\n")}`,
    });
  }

  if (writeSources) {
    const localized = applyEdits(source, edits);
    if (localized !== source) {
      fs.writeFileSync(file, localized);
      changedFileCount += 1;
    }
  }
}

if (writeSources) {
  const duplicateHook =
    /([ \t]*const \{ t: autoT \} = useAutoTranslation\(\);\r?\n)(?:[ \t]*const \{ t: autoT \} = useAutoTranslation\(\);\r?\n)+/g;
  for (const file of listFiles(sourceRoot)) {
    const source = fs.readFileSync(file, "utf8");
    const deduplicated = source.replace(duplicateHook, "$1");
    if (deduplicated !== source) fs.writeFileSync(file, deduplicated);
  }
}

fs.mkdirSync(autoLocaleDirectory, { recursive: true });
const orderedEnglish = Object.fromEntries(
  Object.entries(autoEnglish).sort(([, left], [, right]) => left.localeCompare(right)),
);
fs.writeFileSync(
  path.join(autoLocaleDirectory, "en.json"),
  `${JSON.stringify(orderedEnglish, null, 2)}\n`,
);

if (writeSources) {
  for (const language of ["fa", "ps"]) {
    const localeFile = path.join(autoLocaleDirectory, `${language}.json`);
    if (!fs.existsSync(localeFile)) {
      throw new Error(`Missing generated translation catalog: ${localeFile}`);
    }
    const translated = JSON.parse(fs.readFileSync(localeFile, "utf8"));
    const missing = Object.keys(orderedEnglish).filter((key) => !translated[key]);
    if (missing.length) {
      throw new Error(`${language}.json is missing ${missing.length} generated translations.`);
    }
  }
}

console.log(
  `${writeSources ? `Updated ${changedFileCount} files with` : "Extracted"} ${replacementCount} ` +
    `occurrences and ${Object.keys(orderedEnglish).length} generated translation keys.`,
);
