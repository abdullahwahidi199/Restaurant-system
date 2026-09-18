import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";

const traverse = traverseModule.default;
const root = path.resolve(process.argv[2] || "src");
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

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    return sourceExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isUserFacing(value) {
  const text = normalize(value);
  return text.length > 1 && /[A-Za-z]/.test(text) && !/^(https?:|\/|\.\/|\.\.\/)/.test(text);
}

const findings = [];
const allAttributeFindings = [];

for (const file of listFiles(root)) {
  const source = fs.readFileSync(file, "utf8");
  let ast;
  try {
    ast = parse(source, {
      sourceType: "module",
      plugins: ["jsx", "classProperties", "optionalChaining"],
    });
  } catch (error) {
    findings.push({ file, line: 1, kind: "parse-error", text: error.message });
    continue;
  }

  traverse(ast, {
    JSXText(nodePath) {
      const text = normalize(nodePath.node.value);
      if (isUserFacing(text)) {
        findings.push({ file, line: nodePath.node.loc?.start.line, kind: "text", text });
      }
    },
    JSXAttribute(nodePath) {
      const name = nodePath.node.name?.name;
      const value = nodePath.node.value;
      if (value?.type === "StringLiteral" && isUserFacing(value.value)) {
        allAttributeFindings.push({ name, text: normalize(value.value) });
      }
      if (
        userFacingAttributes.has(name) &&
        value?.type === "StringLiteral" &&
        isUserFacing(value.value)
      ) {
        findings.push({ file, line: value.loc?.start.line, kind: name, text: normalize(value.value) });
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
          file,
          line: nodePath.node.loc?.start.line,
          kind: isObjectCopy ? "object-copy" : "expression-copy",
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
          file,
          line: right.loc?.start.line,
          kind: "default-copy",
          text: normalize(right.value),
        });
      }
    },
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;
      const firstArgument = nodePath.node.arguments[0];
      const isToast =
        callee?.type === "MemberExpression" &&
        callee.object?.type === "Identifier" &&
        callee.object.name === "toast" &&
        ["success", "error"].includes(callee.property?.name);
      const isMessageSetter =
        callee?.type === "Identifier" &&
        /^(setError|setMessage)$/.test(callee.name);

      if (
        (isToast || isMessageSetter) &&
        firstArgument?.type === "StringLiteral" &&
        isUserFacing(firstArgument.value)
      ) {
        findings.push({
          file,
          line: firstArgument.loc?.start.line,
          kind: isToast ? `toast.${callee.property.name}` : callee.name,
          text: normalize(firstArgument.value),
        });
      }
    },
  });
}

const relative = (file) => path.relative(process.cwd(), file).replaceAll(path.sep, "/");
const grouped = findings.reduce((result, finding) => {
  (result[finding.text] ||= []).push(finding);
  return result;
}, {});
const summary = Object.entries(grouped)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([text, entries]) => ({
    text,
    occurrences: entries.length,
    locations: entries.map(({ file, line, kind }) => `${relative(file)}:${line} (${kind})`),
  }));

const flatten = (value, prefix = "", result = {}) => {
  for (const [key, entry] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      flatten(entry, fullKey, result);
    } else {
      result[fullKey] = entry;
    }
  }
  return result;
};

const englishValues = new Set(
  ["src/locals/en.json", "src/locals/landing/en.json"].flatMap((file) => {
    if (!fs.existsSync(file)) return [];
    return Object.values(flatten(JSON.parse(fs.readFileSync(file, "utf8"))));
  }),
);

const unmatched = summary.filter(({ text }) => !englishValues.has(text));

if (process.argv.includes("--attribute-stats")) {
  const counts = allAttributeFindings.reduce((result, { name }) => {
    result[name] = (result[name] || 0) + 1;
    return result;
  }, {});
  for (const [name, count] of Object.entries(counts).sort((left, right) => right[1] - left[1])) {
    console.log(`${count}\t${name}`);
  }
} else if (process.argv.includes("--json")) {
  console.log(JSON.stringify(summary, null, 2));
} else if (process.argv.includes("--unmatched")) {
  for (const item of unmatched) console.log(item.text);
  console.log(`\n${unmatched.length} strings are not present in the English catalog.`);
} else if (process.argv.includes("--stats")) {
  console.log(
    JSON.stringify(
      {
        occurrences: findings.length,
        uniqueStrings: summary.length,
        uniqueStringsAlreadyInCatalog: summary.length - unmatched.length,
        unmatchedUniqueStrings: unmatched.length,
      },
      null,
      2,
    ),
  );
} else {
  for (const item of summary) {
    console.log(`${item.text}\n  ${item.locations.join("\n  ")}`);
  }
  console.log(`\n${findings.length} occurrences; ${summary.length} unique strings.`);
}

process.exitCode = findings.length ? 1 : 0;
