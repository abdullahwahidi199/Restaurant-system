import assert from "node:assert/strict";
import test from "node:test";
import { loadAndroidRelease, parseAndroidRelease } from "./appDownload.js";

const release = {
  applicationId: "com.pakhlai.mobile", version: "1.0.0", buildNumber: 1,
  sizeBytes: 1024, sha256: "a".repeat(64), url: "/downloads/pakhlai-1.0.0-1.apk",
};

test("accepts a versioned Pakhlai APK but rejects invalid or external download links", () => {
  assert.equal(parseAndroidRelease(release).filename, "pakhlai-1.0.0-1.apk");
  for (const changes of [
    { url: "https://other.example/app.apk" }, { url: "javascript:alert(1)" },
    { applicationId: "other.application" }, { version: "../app" },
    { buildNumber: 0 }, { sizeBytes: 0 }, { sha256: "invalid" },
  ]) assert.equal(parseAndroidRelease({ ...release, ...changes }), null);
});

test("downloads use public requests and verify the APK exists without fetching its body", async () => {
  const calls = [];
  const result = await loadAndroidRelease({ fetcher: async (url, options) => {
    calls.push({ url, ...options });
    return url.endsWith(".json")
      ? new Response(JSON.stringify(release), { headers: { "content-type": "application/json" } })
      : new Response(null, { headers: { "content-type": "application/vnd.android.package-archive", "content-length": "1024" } });
  } });
  assert.equal(result.url, release.url);
  assert.equal(calls[0].credentials, "omit");
  assert.equal(calls[1].method, "HEAD");
});

test("missing files, SPA fallback HTML, and partial uploads do not enable download", async () => {
  for (const apkResponse of [
    new Response(null, { status: 404 }),
    new Response(null, { headers: { "content-type": "text/html" } }),
    new Response(null, { headers: { "content-length": "4" } }),
  ]) {
    await assert.rejects(loadAndroidRelease({ fetcher: async (url) => url.endsWith(".json")
      ? new Response(JSON.stringify(release), { headers: { "content-type": "application/json" } })
      : apkResponse }));
  }
  await assert.rejects(loadAndroidRelease({ fetcher: async () => new Response("index", { headers: { "content-type": "text/html" } }) }));
});
