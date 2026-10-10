export const ANDROID_RELEASE_MANIFEST = "/downloads/android.json";

export function parseAndroidRelease(value) {
  if (!value || value.applicationId !== "com.pakhlai.mobile") return null;
  if (!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(value.version || "")) return null;
  if (!Number.isSafeInteger(value.buildNumber) || value.buildNumber < 1) return null;
  if (!Number.isSafeInteger(value.sizeBytes) || value.sizeBytes <= 0) return null;
  if (!/^[a-f0-9]{64}$/i.test(value.sha256 || "")) return null;
  const filename = `pakhlai-${value.version}-${value.buildNumber}.apk`;
  if (value.url !== `/downloads/${filename}`) return null;
  return Object.freeze({ ...value, filename });
}

export async function loadAndroidRelease({ signal, fetcher = fetch } = {}) {
  const manifest = await fetcher(ANDROID_RELEASE_MANIFEST, {
    signal,
    cache: "no-cache",
    credentials: "omit",
  });
  if (!manifest.ok || !manifest.headers.get("content-type")?.includes("application/json")) {
    throw new Error("The Android download has not been published yet.");
  }
  const release = parseAndroidRelease(await manifest.json());
  if (!release) throw new Error("The Android release information is invalid.");
  // SPA hosts sometimes return index.html with HTTP 200 for a missing APK.
  const apk = await fetcher(release.url, { method: "HEAD", signal, credentials: "omit" });
  if (!apk.ok || apk.headers.get("content-type")?.includes("text/html")) {
    throw new Error("The APK is not available for download.");
  }
  const size = apk.headers.get("content-length");
  if (size && Number(size) !== release.sizeBytes) {
    throw new Error("The APK upload is incomplete.");
  }
  return release;
}
