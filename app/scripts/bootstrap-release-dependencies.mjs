// Recover interrupted Maven downloads without changing Android/Flutter versions.
// Only Google's/Maven Central's published artifacts are used; every JAR is
// checked against its official SHA-1 before it enters the temporary local mirror.
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mirror = join(app, "build/android-toolchain/maven");
const work = join(app, "build/android-toolchain/maven-downloads");
mkdirSync(work, { recursive: true });
// Optional per-process DNS recovery; TLS hostname verification remains enabled.
// No system DNS settings or permanent host mappings are changed.
const googleIp = process.env.PAKHLAI_DOWNLOAD_GOOGLE_IP;
if (googleIp && !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(googleIp)) throw new Error("Invalid temporary Google download address");
if (googleIp && googleIp.split(".").some((part) => Number(part) > 255)) throw new Error("Invalid temporary Google download address");
const children = new Set();
process.once("SIGINT", () => { for (const child of children) child.kill(); process.exit(130); });
const modules = [
  ["com.android.tools.lint", "lint-checks", "32.1.0", "https://dl.google.com/dl/android/maven2"],
  ["com.android.tools.external.com-intellij", "intellij-core", "32.1.0", "https://dl.google.com/dl/android/maven2"],
  ["com.android.tools.external.com-intellij", "kotlin-compiler", "32.1.0", "https://dl.google.com/dl/android/maven2"],
  ["org.codehaus.groovy", "groovy", "3.0.22", "https://repo.maven.apache.org/maven2"],
];
const runCurl = (args) => new Promise((resolveRun, reject) => {
  const child = spawn("curl.exe", ["--fail", "--location", "--silent", "--show-error",
    "--retry", "5", "--retry-all-errors", "--connect-timeout", "20", "--max-time", "120",
    ...(googleIp ? ["--ipv4", "--resolve", `dl.google.com:443:${googleIp}`] : []), ...args],
    { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  children.add(child);
  let output = "", errors = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { errors += chunk; });
  child.once("error", (error) => { children.delete(child); reject(error); });
  child.once("exit", (code) => {
    children.delete(child);
    code === 0 ? resolveRun(output) : reject(new Error(`Official download failed (${code}): ${errors.slice(-500)}`));
  });
});
const sha1 = async (path) => {
  const hash = createHash("sha1");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
};
for (const [group, name, version, repository] of modules) {
  const modulePath = `${group.replaceAll(".", "/")}/${name}/${version}`;
  const filename = `${name}-${version}.jar`;
  const url = `${repository}/${modulePath}/${filename}`;
  const destination = join(mirror, modulePath);
  mkdirSync(destination, { recursive: true });
  const checksum = (await runCurl([`${url}.sha1`])).trim().toLowerCase();
  if (!/^[a-f\d]{40}$/.test(checksum)) throw new Error(`Missing official checksum: ${name}`);
  const jar = join(destination, filename);
  if (!existsSync(jar) || await sha1(jar) !== checksum) {
    const headers = await runCurl(["--head", url]);
    const sizes = [...headers.matchAll(/^Content-Length:\s*(\d+)/gmi)];
    const total = Number(sizes.at(-1)?.[1]);
    if (!Number.isSafeInteger(total) || total < 1 || total > 100 * 1024 * 1024) throw new Error(`Invalid official artifact size: ${name}`);
    const chunkSize = 2 * 1024 * 1024;
    const count = Math.ceil(total / chunkSize);
    const directory = join(work, `${name}-${version}`);
    mkdirSync(directory, { recursive: true });
    const parts = Array.from({ length: count }, (_, index) => join(directory, `${index}.part`));
    let next = 0, finished = 0;
    const validPart = (index) => {
      const start = index * chunkSize, end = Math.min(total, start + chunkSize) - 1;
      const header = `${parts[index]}.headers`;
      return existsSync(parts[index]) && statSync(parts[index]).size === end - start + 1 && existsSync(header) &&
        new RegExp(`content-range:\\s*bytes ${start}-${end}/${total}`, "i").test(readFileSync(header, "utf8"));
    };
    console.log(`Recovering ${filename}: ${(total / 1024 / 1024).toFixed(1)} MB`);
    const progress = setInterval(() => console.log(`${name}: ${finished}/${count} chunks verified`), 30000);
    try {
      await Promise.all(Array.from({ length: 8 }, async () => {
        while (next < count) {
          const index = next++;
          if (!validPart(index)) {
            const start = index * chunkSize, end = Math.min(total, start + chunkSize) - 1;
            await runCurl(["--range", `${start}-${end}`, "--dump-header", `${parts[index]}.headers`,
              "--output", parts[index], `${url}?pakhlai_release_part=${index}`]);
            if (!validPart(index)) throw new Error(`Invalid HTTP range: ${name}, chunk ${index}`);
          }
          finished++;
        }
      }));
    } finally { clearInterval(progress); for (const child of children) child.kill(); }
    const temporary = `${jar}.partial`;
    const output = createWriteStream(temporary);
    output.setMaxListeners(0);
    for (const part of parts) await pipeline(createReadStream(part), output, { end: false });
    output.end();
    await new Promise((resolveClosed, reject) => { output.once("close", resolveClosed); output.once("error", reject); });
    if (await sha1(temporary) !== checksum) throw new Error(`Official checksum mismatch: ${filename}`);
    renameSync(temporary, jar);
  }
  const pom = `${name}-${version}.pom`;
  const pomChecksum = (await runCurl([`${repository}/${modulePath}/${pom}.sha1`])).trim().toLowerCase();
  if (!/^[a-f\d]{40}$/.test(pomChecksum)) throw new Error(`Missing official POM checksum: ${name}`);
  const temporaryPom = join(destination, `${pom}.partial`);
  await runCurl(["--output", temporaryPom, `${repository}/${modulePath}/${pom}`]);
  if (await sha1(temporaryPom) !== pomChecksum) throw new Error(`Official POM checksum mismatch: ${name}`);
  renameSync(temporaryPom, join(destination, pom));
  console.log(`Verified official JAR and POM: ${name} ${version}`);
}
console.log(`Verified temporary Maven mirror: ${mirror}`);
