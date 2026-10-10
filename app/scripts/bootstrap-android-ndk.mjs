// Recovery for an Android SDK installer stalled on this Flutter toolchain.
// Downloads only Google's official r28c archive and checks its SDK checksum.
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const ndkVersion = "28.2.13676358";
const archiveName = "android-ndk-r28c-windows.zip";
const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const properties = readFileSync(join(appDir, "android/local.properties"), "utf8");
const sdkDirectory = resolve(properties.match(/^sdk\.dir=(.+)$/m)[1].trim().replace(/\\\\/g, "\\"));
const destination = resolve(sdkDirectory, "ndk", ndkVersion);
if (dirname(destination) !== resolve(sdkDirectory, "ndk")) throw new Error("Invalid NDK destination");
if (existsSync(join(destination, "source.properties"))) {
  console.log("This NDK is already installed. Nothing was changed.");
  process.exit(0);
}
const cache = join(homedir(), ".android/cache");
let archive;
for (const name of readdirSync(cache).filter((entry) => entry.endsWith("repository2-3_xml"))) {
  const xml = readFileSync(join(cache, name), "utf8");
  const packageXml = xml.match(/<remotePackage\b[^>]*path="ndk;28\.2\.13676358"[^>]*>([\s\S]*?)<\/remotePackage>/)?.[1];
  if (!packageXml) continue;
  archive = [...packageXml.matchAll(/<archive>([\s\S]*?)<\/archive>/g)]
    .map((match) => match[1]).find((entry) => entry.includes("<host-os>windows</host-os>"));
  if (archive) break;
}
if (!archive || !archive.includes(`<url>${archiveName}</url>`)) throw new Error("Official Android SDK archive metadata not found");
const total = Number(archive.match(/<size>(\d+)<\/size>/)[1]);
const checksum = archive.match(/<checksum[^>]*>([a-f\d]{40})<\/checksum>/i)?.[1].toLowerCase();
if (total !== 748118221 || !checksum) throw new Error("Unexpected SDK archive metadata");
const work = join(appDir, "build/android-toolchain", ndkVersion);
mkdirSync(work, { recursive: true });
const chunkSize = 4 * 1024 * 1024;
const count = Math.ceil(total / chunkSize);
let next = 0, completed = 0, finishedBytes = 0;
const children = new Set();
const progress = setInterval(() => console.log(`NDK download: ${(100 * finishedBytes / total).toFixed(1)}% (${completed}/${count} parts verified)`), 30000);
const run = (args) => new Promise((resolveRun, reject) => {
  const child = spawn("curl.exe", args, { windowsHide: true, stdio: "ignore" });
  children.add(child);
  child.once("error", reject);
  child.once("exit", (code) => { children.delete(child); code === 0 ? resolveRun() : reject(new Error(`curl exited ${code}`)); });
});
const parts = Array.from({ length: count }, (_, index) => join(work, `${index}.part`));
const validPart = (index) => {
  const start = index * chunkSize, end = Math.min(total, start + chunkSize) - 1;
  const header = `${parts[index]}.headers`;
  return existsSync(parts[index]) && statSync(parts[index]).size === end - start + 1 &&
    existsSync(header) && new RegExp(`content-range:\\s*bytes ${start}-${end}/${total}`, "i").test(readFileSync(header, "utf8"));
};
try {
  console.log(`Resumable official NDK download: ${(total / 1024 / 1024).toFixed(0)} MB; existing SDK versions will not be removed.`);
  await Promise.all(Array.from({ length: 12 }, async () => {
    while (next < count) {
      const index = next++;
      if (!validPart(index)) {
        const start = index * chunkSize, end = Math.min(total, start + chunkSize) - 1;
        await run(["--fail", "--location", "--silent", "--show-error", "--retry", "5", "--retry-all-errors",
          "--connect-timeout", "20", "--max-time", "180", "--range", `${start}-${end}`,
          "--dump-header", `${parts[index]}.headers`, "--output", parts[index],
          `https://dl.google.com/android/repository/${archiveName}?pakhlai_ndk_part=${index}`]);
        if (!validPart(index)) throw new Error(`Invalid HTTP range in part ${index}; retained for diagnosis.`);
      }
      completed++;
      finishedBytes += statSync(parts[index]).size;
    }
  }));
} finally {
  clearInterval(progress);
  for (const child of children) child.kill();
}
const zipPath = join(work, archiveName);
const output = createWriteStream(zipPath);
// pipeline retains listeners on a reused stream; each part is verified above.
output.setMaxListeners(0);
for (const part of parts) await pipeline(createReadStream(part), output, { end: false });
output.end();
await new Promise((resolveClosed, reject) => { output.once("close", resolveClosed); output.once("error", reject); });
const hash = createHash("sha1");
for await (const chunk of createReadStream(zipPath)) hash.update(chunk);
if (hash.digest("hex") !== checksum) throw new Error("Official Android SDK checksum mismatch; installation was not attempted.");
console.log("Google SDK checksum verified. Extracting the NDK.");
const extracted = join(work, "extracted");
mkdirSync(extracted, { recursive: true });
execFileSync("tar.exe", ["-xf", zipPath, "-C", extracted]);
const extractedNdk = join(extracted, "android-ndk-r28c");
if (!readFileSync(join(extractedNdk, "source.properties"), "utf8").includes(`Pkg.Revision = ${ndkVersion}`)) {
  throw new Error("The extracted NDK version is invalid");
}
// The target was checked above: only the missing version, not the SDK root.
try {
  execFileSync("robocopy.exe", [extractedNdk, destination, "/E", "/NFL", "/NDL", "/NJH", "/NJS"], { stdio: "ignore" });
} catch (error) {
  // Robocopy uses codes 1–7 for successful copies with additional information.
  if (!Number.isInteger(error.status) || error.status < 1 || error.status >= 8) throw error;
}
console.log(`Installed verified NDK ${ndkVersion}. Download parts remain cached in app/build/android-toolchain for recovery.`);
