import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { createServer } from "node:net";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { parseAndroidRelease } from "../src/config/appDownload.js";

const site = process.argv[2] || "http://localhost:5173";
const allowUnavailable = process.argv.includes("--allow-unavailable");
if (!allowUnavailable) {
  const manifest = await fetch(new URL("/downloads/android.json", site));
  assert.ok(manifest.ok && manifest.headers.get("content-type")?.includes("application/json"), "Release manifest must be public JSON, not a SPA fallback");
  const release = parseAndroidRelease(await manifest.json());
  assert.ok(release, "Release manifest must describe a versioned Pakhlai APK");
  const response = await fetch(new URL(release.url, site));
  assert.ok(response.ok && !response.headers.get("content-type")?.includes("text/html"), "APK must download without authentication");
  const hash = createHash("sha256");
  let downloadedBytes = 0;
  for await (const chunk of response.body) {
    hash.update(chunk);
    downloadedBytes += chunk.length;
  }
  assert.equal(downloadedBytes, release.sizeBytes, "APK must download completely");
  assert.equal(hash.digest("hex"), release.sha256, "Downloaded APK checksum must match the signed release");
  console.log(`PASS public APK download: ${release.filename}, size and SHA-256 verified`);
}
assert.equal(typeof WebSocket, "function", "Run npm run check:download (Node 20 needs --experimental-websocket)");
const browserPath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = mkdtempSync(join(tmpdir(), "pakhlai-download-ui-"));
const outputDirectory = resolve("../artifacts/app-download");
mkdirSync(outputDirectory, { recursive: true });
const port = await new Promise((resolvePort, reject) => {
  const listener = createServer();
  listener.once("error", reject);
  listener.listen(0, "127.0.0.1", () => {
    const availablePort = listener.address().port;
    listener.close(() => resolvePort(availablePort));
  });
});
const browser = spawn(browserPath, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--no-default-browser-check", `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`,
  "--remote-debugging-address=127.0.0.1", "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket;
let closeBrowser;
try {
  let targets;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); break; }
    catch { await delay(250); }
  }
  const target = targets?.find((entry) => entry.type === "page");
  assert.ok(target, "Chrome did not start");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveOpen, reject) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!pending.has(message.id)) return;
    const { resolveResult, reject, timeout } = pending.get(message.id);
    clearTimeout(timeout);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolveResult(message.result);
  });
  const send = (method, params = {}) => new Promise((resolveResult, reject) => {
    const requestId = ++id;
    const timeout = setTimeout(() => { pending.delete(requestId); reject(new Error(`Timed out: ${method}`)); }, 15000);
    pending.set(requestId, { resolveResult, reject, timeout });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  closeBrowser = () => send("Browser.close").catch(() => {});
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await send("Page.enable");
  await send("Page.navigate", { url: site });
  for (const { width, height, language } of [
    { width: 1440, height: 1000, language: "en" },
    { width: 1280, height: 900, language: "en" },
    { width: 1280, height: 900, language: "fa" },
    { width: 1280, height: 900, language: "ps" },
    { width: 1024, height: 900, language: "en" },
    { width: 390, height: 844, language: "en" },
    { width: 390, height: 844, language: "fa" },
    { width: 390, height: 844, language: "ps" },
  ]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    // Wait until this origin is available before accessing its localStorage.
    for (let attempt = 0; attempt < 40; attempt++) {
      if (await evaluate("location.origin !== 'null'")) break;
      await delay(250);
    }
    await evaluate(`localStorage.setItem('i18nextLng', ${JSON.stringify(language)})`);
    await send("Page.reload");
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      ready = await evaluate(allowUnavailable
        ? "Boolean(document.querySelector('#download-app .marketplace-app-download'))"
        : "Boolean(document.querySelector('#download-app a[download]'))");
      if (ready) break;
      await delay(250);
    }
    if (!ready) {
      console.log(await evaluate("JSON.stringify({url: location.href, title: document.title, text: document.body?.innerText?.slice(0, 1500)})"));
      const screenshot = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(join(outputDirectory, 'download-page-failure.png'), Buffer.from(screenshot.data, 'base64'));
    }
    assert.ok(ready, "The landing page did not render the expected download control");
    await evaluate("document.fonts.ready.then(() => true)");
    // Let the existing landing-page entrance animation settle before layout checks.
    await delay(750);
    const snapshot = await evaluate(`(() => {
      const button = document.querySelector('#download-app .marketplace-app-download');
      const bounds = button.getBoundingClientRect();
      const nav = document.querySelector('.marketplace-navbar-inner').getBoundingClientRect();
      return { dir: document.documentElement.dir, url: button.getAttribute('href'),
        filename: button.getAttribute('download'),
        disabled: button.matches(':disabled'),
        overflow: document.documentElement.scrollWidth > innerWidth,
        buttonFits: bounds.left >= 0 && bounds.right <= innerWidth,
        navFits: nav.left >= 0 && nav.right <= innerWidth };
    })()`);
    if (snapshot.url) {
      assert.match(snapshot.url, /^\/downloads\/pakhlai-[\w.+-]+\.apk$/);
      assert.equal(snapshot.filename, snapshot.url.split("/").at(-1));
    } else {
      assert.ok(allowUnavailable && snapshot.disabled, "Missing APK must not enable a download");
    }
    assert.equal(snapshot.overflow, false, `Page overflow at ${width}px`);
    assert.equal(snapshot.buttonFits && snapshot.navFits, true, `Download/header overflow at ${width}px`);
    assert.equal(snapshot.dir, ["fa", "ps"].includes(language) ? "rtl" : "ltr");
    if (width < 1280) {
      await evaluate("document.querySelector('button[aria-controls=marketplace-mobile-navigation]').click()");
      assert.ok(await evaluate("Boolean(document.querySelector('#marketplace-mobile-navigation a.marketplace-app-download'))"));
      await evaluate("document.querySelector('button[aria-controls=marketplace-mobile-navigation]').click()");
    }
    const screenshot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(outputDirectory, `download-${width}-${language}.png`), Buffer.from(screenshot.data, "base64"));
    console.log(`PASS ${width}px ${language}: ${snapshot.url || 'unavailable / safely disabled'}`);
  }
  console.log(`Screenshots: ${outputDirectory}`);
} finally {
  if (closeBrowser) await closeBrowser();
  socket?.close();
  browser.kill();
}
