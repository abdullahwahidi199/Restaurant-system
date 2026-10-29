import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { browserSession, input, click, site, artifacts } from "./ai-chat-browser.mjs";

const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const requestId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const reference = { document_id: "operator_orders", section_id: "operator_orders__create", document_title: "Orders", heading: "Create an order",
  verification_status: "source_verified", index_version: "version", content_hash: "hash", path: "C:/private/hidden.md", url: "file:///secret" };
const message = (id, content, extra = {}) => ({ id, role: "assistant", content, kind: "answer", state: "complete", sources: [reference], stale_sources: false,
  created_at: "2026-10-29T08:00:00+04:30", ...extra });
const reply = (id = A, content = "Open **Orders** and use `Add Order`.", mid = 2) => ({ conversation_id: id, request_id: requestId, message: message(mid, content) });
const conversations = { results: [{ id: A, title: "Conversation A" }, { id: B, title: "Conversation B" }], next_page: null };

test("Pakhlai React AI chat — actual browser, mocked HTTP only", { timeout: 180000 }, async (t) => {
  const browser = await browserSession();
  const requests = [], held = [], failures = [];
  let route = () => null;
  let autoChat = true;
  browser.on("Fetch.requestPaused", async (event) => {
    const url = new URL(event.request.url);
    try {
      if (url.origin !== site) {
        await browser.send("Fetch.failRequest", { requestId: event.requestId, errorReason: "BlockedByClient" }); return;
      }
      if (!url.pathname.startsWith("/api/")) { await browser.send("Fetch.continueRequest", { requestId: event.requestId }); return; }
      const entry = { id: event.requestId, path: url.pathname, page: Number(url.searchParams.get("page") || 0), method: event.request.method,
        data: event.request.postData ? JSON.parse(event.request.postData) : null, headers: event.request.headers };
      requests.push(entry);
      const custom = await route(entry);
      if (custom?.hold) { held.push(entry); return; }
      if (custom?.network) { await browser.send("Fetch.failRequest", { requestId: entry.id, errorReason: "ConnectionFailed" }); return; }
      if (custom) { await browser.fulfill(entry.id, custom.body, custom.status || 200); return; }
      if (entry.path === "/api/restaurant/me/") await browser.fulfill(entry.id, { is_active: true, subscription: { is_valid: true } });
      else if (entry.path === "/api/assistant/conversations/") await browser.fulfill(entry.id, conversations);
      else if (entry.path.endsWith("/messages/")) {
        const id = entry.path.includes(A) ? A : B;
        await browser.fulfill(entry.id, { conversation_id: id, results: [message(id === A ? 100 : 200, `Historical ${id === A ? "A" : "B"} — **Add Order**`) ], next_page: null });
      } else if (entry.path === "/api/assistant/chat/" && autoChat) await browser.fulfill(entry.id, reply(entry.data.conversation_id || A));
      else if (entry.path === "/api/users/token/refresh/") await browser.fulfill(entry.id, { access: "synthetic-refreshed-access", refresh: "synthetic-test-refresh" });
      else { failures.push(entry.path); await browser.fulfill(entry.id, {}, 404); }
    } catch (error) { if (!/Invalid InterceptionId|Invalid interceptionId/.test(error.message)) failures.push(error.message); }
  });
  await browser.send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  const reset = async ({ handler = () => null, language = "en", reduced = false } = {}) => {
    route = handler; requests.length = 0; held.length = 0; autoChat = true;
    await browser.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }] });
    await browser.navigate("/tests/ai-chat.html");
    await browser.waitFor("Boolean(document.querySelector('.composer textarea'))");
    await browser.evaluate(`document.querySelector('.language-control select').value=${JSON.stringify(language)};document.querySelector('.language-control select').dispatchEvent(new Event('change',{bubbles:true}))`);
    await browser.waitFor(`document.querySelector('.pakhlai-ai').lang===${JSON.stringify(language)}`);
  };
  const submit = async (text) => { await input(browser, text); await click(browser, ".send-btn"); };
  const skip = async () => { await browser.waitFor("Boolean(document.querySelector('.message-row.assistant'))"); await click(browser, ".skip-animation"); await browser.waitFor("!document.querySelector('.typewriter-cursor')"); };
  const open = async (index) => {
    await click(browser, ".chat-card-header-right button:first-child");
    await browser.waitFor(`document.querySelectorAll('.history-item').length>${index}`);
    await browser.waitFor("document.querySelector('.history-items')?.getAttribute('aria-busy')==='false'");
    await browser.evaluate(`document.querySelectorAll('.history-item')[${index}].click()`);
    await browser.waitFor("Boolean(document.querySelector('.historical'))");
  };
  try {
    await browser.viewport(1280, 900);
    await t.test("immediate question, thinking until full HTTP result, duplicate guard, sources and follow-up", async () => {
      await reset({ handler: (entry) => entry.method === "POST" ? { hold: true } : null });
      await submit("How do I add an order?");
      await browser.waitFor("Boolean(document.querySelector('.thinking-row'))");
      assert.equal(await browser.evaluate("document.querySelector('.message-row.user .message-bubble').textContent"), "How do I add an order?");
      assert.equal(await browser.evaluate("document.querySelector('.composer textarea').value"), "");
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.typewriter-cursor'))"), false);
      await click(browser, ".send-btn");
      await browser.waitFor("document.querySelector('.send-btn').disabled");
      while (!held.length) await delay(20);
      assert.equal(requests.filter((entry) => entry.path.endsWith("/chat/")).length, 1);
      const post = held.shift();
      assert.equal(post.headers.Authorization, "Bearer synthetic-test-access");
      assert.equal(post.headers["X-Branch-ID"], "1");
      assert.deepEqual(post.data, { message: "How do I add an order?" });
      await browser.fulfill(post.id, reply());
      await browser.waitFor("!document.querySelector('.thinking-row') && Boolean(document.querySelector('.typewriter-cursor'))");
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.message-sources'))"), false);
      await skip();
      assert.equal(await browser.evaluate("document.querySelector('.message-row.assistant .message-bubble').textContent"), "Open Orders and use Add Order.");
      assert.equal(await browser.evaluate("document.querySelector('.message-sources').textContent.includes('Create an order')"), true);
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.message-sources a'))"), false);
      assert.equal(await browser.evaluate("document.body.textContent.includes('C:/private')"), false);
      route = () => null;
      await submit("And then?"); await skip();
      assert.equal(requests.filter((entry) => entry.path.endsWith("/chat/")).at(-1).data.conversation_id, A);
      await browser.screenshot("integrated-desktop");
    });
    await t.test("new conversation uses no invented ID and historical messages never replay", async () => {
      await reset(); await open(0);
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.typewriter-cursor'))"), false);
      await click(browser, ".chat-card-header-right button:last-child");
      assert.equal(await browser.evaluate("document.querySelectorAll('.message-row').length"), 0);
      await submit("A fresh question"); await skip();
      assert.equal(requests.filter((entry) => entry.method === "POST").at(-1).data.conversation_id, undefined);
    });
    await t.test("late response from A cannot appear in B", async () => {
      await reset(); await open(0);
      route = (entry) => entry.method === "POST" ? { hold: true } : null;
      await submit("Delayed question A"); while (!held.length) await delay(20);
      const post = held.shift();
      await open(1);
      await browser.fulfill(post.id, reply(A, "LATE A MUST NOT DISPLAY")).catch(() => {});
      await delay(100);
      assert.equal(await browser.evaluate("document.body.textContent.includes('LATE A MUST NOT DISPLAY')"), false);
      assert.equal(await browser.evaluate("document.querySelector('.chat-title').textContent"), "Conversation B");
    });
    await t.test("late history cannot overwrite the next conversation", async () => {
      await reset({ handler: (entry) => entry.path.includes(A) && entry.path.endsWith("/messages/") ? { hold: true } : null });
      await click(browser, ".chat-card-header-right button:first-child"); await browser.waitFor("document.querySelectorAll('.history-item').length===2");
      await browser.evaluate("document.querySelectorAll('.history-item')[0].click()");
      while (!held.length) await delay(20);
      const old = held.shift();
      await open(1);
      await browser.fulfill(old.id, { conversation_id: A, results: [message(1, "OLD A HISTORY")], next_page: null }).catch(() => {});
      assert.equal(await browser.evaluate("document.body.textContent.includes('OLD A HISTORY')"), false);
    });
    await t.test("history pagination stays ordered, blocks sending until latest page", async () => {
      await reset({ handler: (entry) => entry.path.includes(A) && entry.path.endsWith("/messages/") ? { body: { conversation_id: A,
        results: [message(entry.page ? 102 : 101, entry.page ? "Later page" : "First page")], next_page: entry.page ? null : 1 } } : null });
      await open(0);
      assert.equal(await browser.evaluate("document.querySelector('.composer textarea').disabled"), true);
      await click(browser, ".messages-scroll > .history-new");
      await browser.waitFor("document.querySelectorAll('.historical').length===2");
      assert.deepEqual(await browser.evaluate("Array.from(document.querySelectorAll('.historical .message-bubble'),e=>e.textContent)"), ["First page", "Later page"]);
      await browser.waitFor("!document.querySelector('.composer textarea').disabled");
    });
    await t.test("conversation list pagination appends real records", async () => {
      await reset({ handler: (entry) => entry.path === "/api/assistant/conversations/" ? { body: { results: [conversations.results[entry.page ? 1 : 0]], next_page: entry.page ? null : 1 } } : null });
      await click(browser, ".chat-card-header-right button:first-child"); await browser.waitFor("document.querySelectorAll('.history-item').length===1");
      await browser.waitFor("Boolean(document.querySelector('.history-items > .history-new'))");
      await click(browser, ".history-items > .history-new"); await browser.waitFor("document.querySelectorAll('.history-item').length===2");
    });
    await t.test("Unicode RTL and reduced motion reveal instantly without losing English labels", async () => {
      const content = "د **Add Order** تڼۍ وکاروئ.\n\nرزرو میز 👨‍👩‍👧‍👦 اَ";
      await reset({ language: "ps", reduced: true, handler: (entry) => entry.method === "POST" ? { body: reply(A, content) } : null });
      await submit("سفارش څنګه جوړ کړم؟");
      await browser.waitFor("Boolean(document.querySelector('.message-sources'))");
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.typewriter-cursor'))"), false);
      assert.equal(await browser.evaluate("document.querySelector('.pakhlai-ai').dir"), "rtl");
      assert.equal(await browser.evaluate("document.querySelector('.ai-markdown strong').textContent"), "Add Order");
      const post = requests.find((entry) => entry.method === "POST");
      assert.equal(post.headers["Accept-Language"], "ps");
      assert.equal(post.data.message, "سفارش څنګه جوړ کړم؟");
      assert.equal(await browser.evaluate("document.querySelector('.ai-markdown').textContent.includes('👨‍👩‍👧‍👦')"), true);
    });
    await t.test("long Markdown reveals safely, can skip, and copy retains original full text", async () => {
      const content = "**Required fields**\n\n1. Choose `Table`.\n2. Save.\n\n| Field | Required |\n|---|---|\n| Table | Yes |\n\n```text\nAdd Order\n```\n\n" + "A long answer. ".repeat(800);
      await reset({ handler: (entry) => entry.method === "POST" ? { body: reply(A, content) } : null });
      await submit("Detailed help"); await browser.waitFor("Boolean(document.querySelector('.typewriter-cursor'))");
      assert.equal(await browser.evaluate("document.querySelector('.ai-markdown').textContent.includes('undefined')"), false);
      await skip();
      assert.equal(await browser.evaluate("document.querySelector('.ai-markdown table').textContent.includes('Table')"), true);
      assert.equal(await browser.evaluate("document.querySelector('.ai-markdown pre code').textContent.trim()"), "Add Order");
      await browser.evaluate("window.copiedText=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedText=text}}})");
      await click(browser, ".message-row.assistant .message-meta .copy-btn");
      assert.equal(await browser.evaluate("window.copiedText"), content);
    });
    await t.test("short answer completes without skip and duplicate rapid Enter is guarded", async () => {
      await reset({ handler: (entry) => entry.method === "POST" ? { body: reply(A, "Done.") } : null });
      await input(browser, "Quick question");
      await browser.evaluate("(()=>{const el=document.querySelector('textarea');el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));})()");
      await browser.waitFor("Boolean(document.querySelector('.message-sources'))");
      assert.equal(requests.filter((entry) => entry.method === "POST").length, 1);
      assert.equal(await browser.evaluate("document.querySelector('.ai-markdown').textContent"), "Done.");
    });
    await t.test("Shift+Enter and IME Enter do not submit; whitespace and over-limit input are blocked", async () => {
      await reset(); await input(browser, "First line");
      await browser.evaluate("(()=>{const el=document.querySelector('textarea');el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',shiftKey:true,bubbles:true}));el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true}));})()");
      assert.equal(requests.filter((entry) => entry.method === "POST").length, 0);
      await input(browser, " "); assert.equal(await browser.evaluate("document.querySelector('.send-btn').disabled"), true);
      await input(browser, "ا".repeat(4001)); assert.equal(await browser.evaluate("document.querySelector('.send-btn').disabled"), true);
      await input(browser, "😀".repeat(4000)); assert.equal(await browser.evaluate("document.querySelector('.send-btn').disabled"), false);
    });
    await t.test("untrusted HTML, JS URLs, images and internal Markdown paths do not execute or link", async () => {
      const content = "<script>window.aiXss=true</script>\n<img src=x onerror='window.aiXss=true'>\n\n[bad](javascript:alert(1)) [internal](file:///etc/passwd) [relative](../../private.md) ![image](https://tracking.invalid/x) [safe](https://example.com/help)";
      await reset({ reduced: true, handler: (entry) => entry.method === "POST" ? { body: reply(A, content) } : null });
      await submit("Security example"); await skip();
      assert.equal(await browser.evaluate("Boolean(window.aiXss)"), false);
      assert.equal(await browser.evaluate("document.querySelectorAll('.ai-markdown script,.ai-markdown img').length"), 0);
      assert.deepEqual(await browser.evaluate("Array.from(document.querySelectorAll('.ai-markdown a'),e=>e.href)"), ["https://example.com/help"]);
    });
    for (const [name, status, code, text] of [
      ["permission", 403, "access_denied", "current restaurant context"], ["missing conversation", 404, "conversation_not_found", "unavailable in your current context"],
      ["busy", 409, "conversation_busy", "Another reply"], ["rate limit", 429, "throttled", "Too many requests"],
      ["provider config", 503, "provider_not_configured", "not configured"], ["provider timeout", 504, "provider_timeout", "AI service"],
      ["index unavailable", 503, "index_unavailable", "documentation index"], ["server validation", 400, "invalid_message", "4,000"],
    ]) await t.test(`${name} error preserves question, hides sensitive error body and never retries POST`, async () => {
      await reset({ handler: (entry) => entry.method === "POST" ? { status, body: { error: { code, message: "SECRET stack trace C:/private prompt" }, conversation_id: A } } : null });
      await submit("Keep this question"); await browser.waitFor("Boolean(document.querySelector('.system-banner'))");
      assert.equal(await browser.evaluate("document.querySelector('textarea').value"), "Keep this question");
      assert.equal(await browser.evaluate("document.querySelector('.system-banner').textContent").then((v) => v.includes(text)), true);
      assert.equal(await browser.evaluate("document.body.textContent.includes('SECRET')"), false);
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.thinking-row'))"), false);
      assert.equal(requests.filter((entry) => entry.method === "POST").length, 1);
    });
    await t.test("retry reconciles a saved failed turn before posting again", async () => {
      let posts = 0;
      await reset({ reduced: true, handler: (entry) => {
        if (entry.path.endsWith("/messages/")) return { body: { conversation_id: A, results: [message(301, "Retry after failure", { role: "user", kind: "question", state: "failed", sources: [] })], next_page: null } };
        if (entry.method === "POST") return ++posts === 1 ? { status: 503, body: { error: { code: "index_unavailable" }, conversation_id: A } } : { body: reply(A, "Recovered response", 302) };
        return null;
      } });
      await submit("Retry after failure"); await browser.waitFor("Boolean(document.querySelector('.system-banner'))");
      await click(browser, ".send-btn"); await browser.waitFor("Boolean(document.querySelector('.message-sources'))");
      assert.deepEqual(requests.filter((entry) => entry.method === "POST" || entry.path.endsWith("/messages/")).map((entry) => entry.method), ["POST", "GET", "POST"]);
      assert.equal(await browser.evaluate("document.querySelectorAll('.message-row').length"), 3);
    });
    await t.test("retry recovers a completed backend response without duplicate POST", async () => {
      await reset({ reduced: true, handler: (entry) => {
        if (entry.path.endsWith("/messages/")) return { body: { conversation_id: A, results: [message(401, "Response was lost", { role: "user", kind: "question", sources: [] }), message(402, "Saved complete response")], next_page: null } };
        if (entry.method === "POST") return { status: 503, body: { error: { code: "assistant_unavailable" }, conversation_id: A } };
        return null;
      } });
      await submit("Response was lost"); await browser.waitFor("Boolean(document.querySelector('.system-banner'))");
      await click(browser, ".send-btn"); await browser.waitFor("!document.querySelector('.system-banner') && document.querySelector('textarea').value===''");
      assert.equal(requests.filter((entry) => entry.method === "POST").length, 1);
      assert.equal(await browser.evaluate("document.querySelectorAll('.message-row').length"), 2);
      assert.equal(await browser.evaluate("document.querySelector('.ai-markdown').textContent"), "Saved complete response");
    });
    await t.test("failed retry reconciliation blocks duplicate submission until history reload", async () => {
      await reset({ handler: (entry) => entry.method === "POST" || entry.path.endsWith("/messages/") ? { status: 503, body: { error: { code: "assistant_unavailable" }, conversation_id: A } } : null });
      await submit("Keep safely"); await browser.waitFor("Boolean(document.querySelector('.system-banner'))");
      await click(browser, ".send-btn"); await browser.waitFor("document.querySelector('textarea').disabled");
      assert.equal(requests.filter((entry) => entry.method === "POST").length, 1);
    });
    await t.test("network failure and malformed complete response preserve question", async () => {
      for (const response of [{ network: true }, { body: { conversation_id: A, message: { content: "bad" } } }]) {
        await reset({ handler: (entry) => entry.method === "POST" ? response : null });
        await submit("Recover this question"); await browser.waitFor("Boolean(document.querySelector('.system-banner'))");
        assert.equal(await browser.evaluate("document.querySelector('textarea').value"), "Recover this question");
        assert.equal(requests.filter((entry) => entry.method === "POST").length, 1);
      }
    });
    await t.test("401 refresh uses established auth flow, then retries only the rejected unauthenticated request", async () => {
      let calls = 0;
      await reset({ reduced: true, handler: (entry) => entry.path.endsWith("/chat/") && calls++ === 0 ? { status: 401, body: { detail: "Token expired" } } : null });
      await submit("Authenticated refresh"); await skip();
      assert.equal(requests.filter((entry) => entry.path.endsWith("/chat/")).length, 2);
      assert.equal(requests.filter((entry) => entry.path.endsWith("/chat/")).at(-1).headers.Authorization, "Bearer synthetic-refreshed-access");
    });
    await t.test("expired session with rejected refresh preserves question and offers explicit sign-in", async () => {
      await reset({ handler: (entry) => entry.method === "POST" ? { status: 401, body: { detail: "synthetic expired session" } } : null });
      await submit("Do not lose this after expiration"); await browser.waitFor("Boolean(document.querySelector('.system-banner'))");
      assert.equal(await browser.evaluate("document.querySelector('textarea').value"), "Do not lose this after expiration");
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.app-shell > a.history-new'))"), true);
      assert.equal(await browser.evaluate("localStorage.getItem('authTokens')"), null);
    });
    await t.test("client timeout budget and timeout UI use complete HTTP request, not streaming", async () => {
      await reset({ handler: (entry) => entry.method === "POST" ? { hold: true } : null });
      // Accelerate ONLY the native XHR timeout for this test. Assert the actual
      // configured value, then exercise the browser's real timeout event.
      await browser.evaluate("(()=>{const property=Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype,'timeout');Object.defineProperty(XMLHttpRequest.prototype,'timeout',{configurable:true,get:property.get,set(value){window.actualChatTimeout=value;property.set.call(this,value===150000?50:value)}})})()");
      await submit("Timeout recovery"); await browser.waitFor("Boolean(document.querySelector('.system-banner'))");
      assert.equal(await browser.evaluate("window.actualChatTimeout"), 150000);
      assert.equal(await browser.evaluate("document.querySelector('.system-banner').textContent.includes('timed out')"), true);
      assert.equal(await browser.evaluate("document.querySelector('textarea').value"), "Timeout recovery");
      assert.equal(requests.filter((entry) => entry.path.endsWith("/chat/")).length, 1);
    });
    await t.test("a mismatched reply is rejected and limitation answers do not invent sources", async () => {
      await reset({ handler: (entry) => entry.method === "POST" ? { body: reply(B, "WRONG CONVERSATION ANSWER") } : null });
      await open(0); await submit("Mismatch example"); await browser.waitFor("Boolean(document.querySelector('.system-banner'))");
      assert.equal(await browser.evaluate("document.body.textContent.includes('WRONG CONVERSATION ANSWER')"), false);
      await reset({ reduced: true, handler: (entry) => entry.method === "POST" ? { body: { ...reply(), message: message(4, "I cannot read live records.", { sources: [], kind: "limitation" }) } } : null });
      await submit("Live records?"); await skip();
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.message-sources'))"), false);
    });
    await t.test("branch change drops pending turn and unmount clears animation timers", async () => {
      await reset({ handler: (entry) => entry.method === "POST" ? { hold: true } : null });
      await submit("Old branch question"); while (!held.length) await delay(20);
      const old = held.shift(); await browser.evaluate("window.aiTestSetContext({branch:2})");
      await browser.waitFor("document.querySelectorAll('.message-row').length===0");
      await browser.fulfill(old.id, reply(A, "OLD BRANCH RESPONSE")).catch(() => {});
      assert.equal(await browser.evaluate("document.body.textContent.includes('OLD BRANCH RESPONSE')"), false);
      await browser.evaluate("(()=>{window.revealTimers=new Set();const add=window.setInterval;const remove=window.clearInterval;window.setInterval=(fn,ms,...args)=>{const id=add(fn,ms,...args);if(ms===40)window.revealTimers.add(id);return id};window.clearInterval=id=>{window.revealTimers.delete(id);remove(id)}})()");
      route = () => null; await submit("New branch"); await browser.waitFor("Boolean(document.querySelector('.typewriter-cursor'))");
      assert.equal(await browser.evaluate("window.revealTimers.size"), 1);
      await browser.evaluate("window.aiTestSetContext({role:'Waiter'})");
      await browser.waitFor("document.querySelectorAll('.message-row').length===0"); await delay(120);
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.typewriter-cursor'))"), false);
      assert.equal(await browser.evaluate("window.revealTimers.size"), 0);
    });
    await t.test("history authorization error blocks composer and historical stale-source text is retained", async () => {
      await reset({ handler: (entry) => entry.path.endsWith("/messages/") ? { status: 404, body: { error: { code: "conversation_not_found" } } } : null });
      await click(browser, ".chat-card-header-right button:first-child"); await browser.waitFor("document.querySelectorAll('.history-item').length===2");
      await browser.evaluate("document.querySelectorAll('.history-item')[0].click()"); await browser.waitFor("Boolean(document.querySelector('.system-banner'))");
      assert.equal(await browser.evaluate("document.querySelector('textarea').disabled"), true);
      route = (entry) => entry.path.endsWith("/messages/") ? { body: { conversation_id: A, results: [message(5, "This earlier answer is unavailable in the current documentation context. Ask the question again.", { sources: [], stale_sources: true })], next_page: null } } : null;
      await click(browser, ".system-banner .copy-btn"); await browser.waitFor("Boolean(document.querySelector('.historical'))");
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.message-sources'))"), false);
      assert.equal(await browser.evaluate("Boolean(document.querySelector('.typewriter-cursor'))"), false);
    });
    await t.test("desktop/tablet/mobile English, Dari and Pashto fit viewport; drawer keyboard and scroll", async () => {
      for (const [width, height, language] of [[1280, 900, "en"], [768, 1024, "en"], [390, 844, "en"], [390, 844, "fa"], [390, 844, "ps"]]) {
        await browser.viewport(width, height); await reset({ language, reduced: true });
        assert.equal(await browser.evaluate("document.documentElement.scrollWidth<=innerWidth"), true);
        assert.equal(await browser.evaluate("document.querySelector('.composer').getBoundingClientRect().bottom<=innerHeight"), true);
        await browser.screenshot(`integrated-${width}-${language}`);
        await click(browser, ".chat-card-header-right button:first-child"); await browser.waitFor("Boolean(document.querySelector('.history-panel'))");
        assert.equal(await browser.evaluate("document.querySelector('.history-panel').contains(document.activeElement)"), true);
        await browser.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
        await browser.waitFor("!document.querySelector('.history-panel')");
      }
    });
    await t.test("real App route retains active conversation through a language change", async () => {
      route = () => null;
      await browser.viewport(1280, 900);
      await browser.navigate("/tests/ai-chat.html?stage=app");
      await browser.waitFor("Boolean(document.querySelector('.composer textarea'))", "real App assistant route", 30000);
      await submit("Keep this conversation across languages"); await skip();
      await browser.evaluate("document.querySelector('.language-control select').value='fa';document.querySelector('.language-control select').dispatchEvent(new Event('change',{bubbles:true}))");
      await browser.waitFor("document.querySelector('.pakhlai-ai').lang==='fa'");
      assert.equal(await browser.evaluate("document.querySelectorAll('.message-row').length"), 2);
      await submit("Follow up after language change"); await skip();
      assert.equal(requests.filter((entry) => entry.path.endsWith("/chat/")).at(-1).data.conversation_id, A);
      assert.equal(await browser.evaluate("document.querySelectorAll('a[href=\"/assistant\"]').length"), 0);
      await browser.screenshot("real-app-fa");
    });
    await t.test("single shared navigation entry appears for eligible restaurant roles", async () => {
      for (const role of ["Admin", "BranchAdmin", "Manager", "Cashier", "Waiter", "Kitchen_manager", "InventoryManager", "FinanceManager", "OperationsManager", "Call_operator"]) {
        await browser.navigate(`/tests/ai-chat.html?stage=navigation&role=${role}`);
        await browser.waitFor("document.querySelectorAll('a[href=\"/assistant\"]').length===1");
      }
      for (const role of ["Customer", "SuperAdmin", "UnknownCustomRole"]) {
        await browser.navigate(`/tests/ai-chat.html?stage=navigation&role=${role}`);
        await browser.waitFor("window.aiFixtureReady===true");
        assert.equal(await browser.evaluate("document.querySelectorAll('a[href=\"/assistant\"]').length"), 0);
      }
    });
    await t.test("logout unmounts private chat and pending animation", async () => {
      await reset(); await submit("Private question"); await browser.waitFor("Boolean(document.querySelector('.typewriter-cursor'))");
      await browser.evaluate("window.aiTestSetContext({logout:true})");
      await browser.waitFor("!document.querySelector('.pakhlai-ai')");
    });
    await t.test("long history scrolls to latest, reading above pauses following, and short viewport keeps input visible", async () => {
      await browser.viewport(1280, 900);
      await reset({ handler: (entry) => entry.path.endsWith("/messages/") ? { body: { conversation_id: A,
        results: Array.from({ length: 40 }, (_, index) => message(1000 + index, `Historical step ${index}.\n\n` + "Read this operational instruction. ".repeat(15))), next_page: null } }
        : entry.method === "POST" ? { body: reply(A, "A long response. ".repeat(800), 3000) } : null });
      await open(0);
      await browser.waitFor("(()=>{const e=document.querySelector('.messages-scroll');return e.scrollHeight-e.scrollTop-e.clientHeight<5})()", "latest loaded message is visible");
      await submit("Keep following this answer"); await browser.waitFor("Boolean(document.querySelector('.typewriter-cursor'))");
      await browser.evaluate("const area=document.querySelector('.messages-scroll');area.scrollTop=0;area.dispatchEvent(new Event('scroll'))");
      await delay(250);
      assert.equal(await browser.evaluate("document.querySelector('.messages-scroll').scrollTop<5"), true);
      await skip();
      await browser.viewport(390, 430);
      assert.equal(await browser.evaluate("document.querySelector('.composer').getBoundingClientRect().bottom<=innerHeight"), true);
    });
    assert.deepEqual(failures, [], "All requests use registered endpoints; no third-party model call");
    assert.deepEqual(browser.errors, [], "No uncaught React/browser errors");
    const template = readFileSync("../../ai_chat_interface.html");
    assert.equal(createHash("sha256").update(template).digest("hex"), "8fc449b6c7e08fe850ed3b7257de9d8cb548c3a4209dcaa2ced44a8063030e7b");
    writeFileSync(join(artifacts, "browser-results.json"), JSON.stringify({ template_sha256: createHash("sha256").update(template).digest("hex"), browser_errors: browser.errors, unexpected_requests: failures,
      note: "Local HTTP interception only. No Django database or DeepSeek call. Each subtest is reported by node:test." }, null, 2));
  } finally { await browser.close(); }
});
