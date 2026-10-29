// The repository already uses headless Chrome + Node's built-in runner for UI
// checks. Keep that approach: no additional browser/testing dependency.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";

export let site = process.env.AI_CHAT_TEST_URL || "http://127.0.0.1:5174";
export const artifacts = resolve("../artifacts/ai-chat");
async function availablePort() {
  return new Promise((done) => {
    const server = createServer(); server.listen(0, "127.0.0.1", () => { const selected = server.address().port; server.close(() => done(selected)); });
  });
}
export async function browserSession() {
  mkdirSync(artifacts, { recursive: true });
  let vite;
  if (!process.env.AI_CHAT_TEST_URL) {
    const webPort = await availablePort();
    site = `http://127.0.0.1:${webPort}`;
    vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(webPort), "--strictPort"],
      { windowsHide: true, stdio: "ignore", env: { ...process.env, VITE_API_URL: "/api" } });
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      try { if ((await fetch(site)).ok) { ready = true; break; } } catch { /* starting */ }
      await delay(150);
    }
    if (!ready) { vite.kill(); throw new Error("Isolated Vite fixture server did not start"); }
  }
  const port = await availablePort();
  const profile = mkdtempSync(join(tmpdir(), "pakhlai-ai-ui-"));
  const browser = spawn(process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--disable-gpu", "--no-first-run",
    "--no-default-browser-check", `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, "--remote-debugging-address=127.0.0.1", "about:blank"],
    { windowsHide: true, stdio: "ignore" });
  let socket;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      socket = new WebSocket(pages.find((page) => page.type === "page").webSocketDebuggerUrl);
      await new Promise((done, fail) => { socket.addEventListener("open", done, { once: true }); socket.addEventListener("error", fail, { once: true }); });
      break;
    } catch { await delay(150); }
  }
  assert.ok(socket, "Headless Chrome must be available (CHROME_PATH can override)");
  const pending = new Map();
  const handlers = new Map();
  let sequence = 0;
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (pending.has(message.id)) {
      const entry = pending.get(message.id); pending.delete(message.id); clearTimeout(entry.timer);
      if (message.error) entry.reject(new Error(message.error.message)); else entry.resolve(message.result);
    } else if (handlers.has(message.method)) handlers.get(message.method)(message.params);
  });
  const send = (method, params = {}) => new Promise((resolveResult, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve: resolveResult, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async (expression, description = expression, milliseconds = 10000) => {
    const deadline = Date.now() + milliseconds;
    while (Date.now() < deadline) { if (await evaluate(expression)) return; await delay(40); }
    throw new Error(`UI wait failed: ${description}`);
  };
  const errors = [];
  let documents = 0;
  handlers.set("Page.domContentEventFired", () => { documents += 1; });
  handlers.set("Runtime.exceptionThrown", (event) => errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  await send("Page.enable"); await send("Runtime.enable");
  const screenshot = async (name) => {
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(artifacts, name + ".png"), Buffer.from(shot.data, "base64"));
  };
  return { send, evaluate, waitFor, screenshot, errors,
    on: (name, handler) => handlers.set(name, handler),
    async navigate(path) {
      const previous = documents;
      await send("Page.navigate", { url: new URL(path, site).href });
      const deadline = Date.now() + 20000;
      while (documents === previous && Date.now() < deadline) await delay(25);
      assert.ok(documents > previous, "Fixture document navigation completed");
    },
    viewport: (width, height) => send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false }),
    fulfill: (id, body, status = 200) => send("Fetch.fulfillRequest", { requestId: id, responseCode: status,
      responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(body)).toString("base64") }),
    async referenceTemplate() {
      const content = readFileSync(resolve("../../ai_chat_interface.html"), "utf8");
      await send("Page.navigate", { url: site + "/tests/ai-chat.html?reference=1" });
      await waitFor("location.search.includes('reference')");
      await send("Page.setDocumentContent", { frameId: (await send("Page.getFrameTree")).frameTree.frame.id, html: content });
      await waitFor("Boolean(document.querySelector('.app-shell'))");
    },
    async close() { await send("Browser.close").catch(() => {}); socket.close(); browser.kill(); vite?.kill(); for (const entry of pending.values()) clearTimeout(entry.timer); },
  };
}

export async function input(browser, text) {
  await browser.evaluate(`(() => { const el = document.querySelector('.composer textarea'); const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; set.call(el, ${JSON.stringify(text)}); el.dispatchEvent(new Event('input',{bubbles:true})); })()`);
}

export const click = (browser, selector) => browser.evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`);
