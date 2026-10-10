import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apkPath = resolve(process.argv[2] || join(frontendDir, "../app/build/app/outputs/flutter-apk/app-release.apk"));
if (!existsSync(apkPath)) throw new Error(`Build the signed release APK first: ${apkPath}`);

const localPropertiesPath = resolve(frontendDir, "../app/android/local.properties");
const localProperties = existsSync(localPropertiesPath) ? readFileSync(localPropertiesPath, "utf8") : "";
const sdkSetting = localProperties.match(/^sdk\.dir=(.+)$/m)?.[1].trim().replace(/\\\\/g, "\\");
const sdkDirectory = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME || sdkSetting;
if (!sdkDirectory) throw new Error("Set ANDROID_SDK_ROOT to verify this APK before publishing.");
const buildTools = join(sdkDirectory, "build-tools");
const version = readdirSync(buildTools)
  .filter((entry) => /^\d+\.\d+\.\d+$/.test(entry))
  .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
if (!version) throw new Error("Android build-tools are required to verify the release.");
const toolsDir = join(buildTools, version);
const java = process.env.JAVA_HOME
  ? join(process.env.JAVA_HOME, "bin", process.platform === "win32" ? "java.exe" : "java")
  : "java";
const signature = execFileSync(java, ["-jar", join(toolsDir, "lib/apksigner.jar"), "verify", "--verbose", "--print-certs", apkPath], { encoding: "utf8" });
if (/CN=Android Debug/i.test(signature)) throw new Error("Debug-signed APKs cannot be published. Configure the private release key.");
const certificateSha256 = signature.match(/certificate SHA-256 digest:\s*([a-f\d]{64})/i)?.[1].toLowerCase();
if (!certificateSha256) throw new Error("The APK signature could not be verified.");
const badging = execFileSync(join(toolsDir, process.platform === "win32" ? "aapt2.exe" : "aapt2"), ["dump", "badging", apkPath], { encoding: "utf8" });
const appPackage = badging.match(/^package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'/m);
if (!appPackage || appPackage[1] !== "com.pakhlai.mobile" || /application-debuggable/.test(badging)) {
  throw new Error("Only a non-debuggable Pakhlai release APK can be published.");
}
const [, applicationId, buildNumberText, appVersion] = appPackage;
if (!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(appVersion)) throw new Error("Invalid release version.");
const buildNumber = Number(buildNumberText);
if (!Number.isSafeInteger(buildNumber) || buildNumber < 1) throw new Error("Invalid build number.");
const apkBytes = readFileSync(apkPath);
const sha256 = createHash("sha256").update(apkBytes).digest("hex");
const filename = `pakhlai-${appVersion}-${buildNumber}.apk`;
const downloadsDir = join(frontendDir, "public/downloads");
mkdirSync(downloadsDir, { recursive: true });
const destination = join(downloadsDir, filename);
if (existsSync(destination)) {
  const existingHash = createHash("sha256").update(readFileSync(destination)).digest("hex");
  if (existingHash !== sha256) throw new Error("This release version already exists with a different APK. Increment the Flutter build number before publishing an update.");
} else {
  const temporaryPath = `${destination}.partial`;
  copyFileSync(apkPath, temporaryPath);
  renameSync(temporaryPath, destination);
}
const manifest = {
  applicationId, version: appVersion, buildNumber,
  url: `/downloads/${filename}`,
  sizeBytes: apkBytes.length, sha256, certificateSha256,
};
const temporaryManifest = join(downloadsDir, "android.json.partial");
writeFileSync(temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`);
renameSync(temporaryManifest, join(downloadsDir, "android.json"));
console.log(`Verified and prepared ${filename} (${(apkBytes.length / 1024 / 1024).toFixed(1)} MB). Run npm run build and deploy dist, including downloads/.`);
