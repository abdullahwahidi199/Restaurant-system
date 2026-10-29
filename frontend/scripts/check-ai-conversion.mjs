import assert from "node:assert/strict";
import { browserSession, input, click } from "./ai-chat-browser.mjs";

const browser = await browserSession();
try {
  await browser.viewport(1280, 900);
  await browser.referenceTemplate();
  await browser.screenshot("reference-desktop");
  const original = await browser.evaluate("(() => {const c=document.querySelector('.chat-card');return {width:c.getBoundingClientRect().width,color:getComputedStyle(c).backgroundColor,border:getComputedStyle(c).borderRadius}})()");
  await browser.navigate("/tests/ai-chat.html?stage=conversion");
  await browser.waitFor("Boolean(document.querySelector('.pakhlai-ai .welcome'))");
  await browser.screenshot("conversion-desktop");
  const converted = await browser.evaluate("(() => {const c=document.querySelector('.chat-card');return {width:c.getBoundingClientRect().width,color:getComputedStyle(c).backgroundColor,border:getComputedStyle(c).borderRadius}})()");
  assert.deepEqual(converted, original);
  await input(browser, "How do I create an order?"); await click(browser, ".send-btn");
  await browser.waitFor("Boolean(document.querySelector('.typewriter-cursor'))");
  await click(browser, ".skip-animation");
  await browser.waitFor("!document.querySelector('.typewriter-cursor') && Boolean(document.querySelector('.ai-markdown table'))");
  assert.equal(await browser.evaluate("document.querySelector('.ai-markdown strong').textContent"), "Orders");
  await browser.screenshot("conversion-message");
  for (const language of ["en", "fa", "ps"]) {
    await browser.viewport(390, 844);
    await browser.evaluate(`document.querySelector('.language-control select').value=${JSON.stringify(language)};document.querySelector('.language-control select').dispatchEvent(new Event('change',{bubbles:true}))`);
    await browser.waitFor(`document.querySelector('.pakhlai-ai').lang===${JSON.stringify(language)}`);
    assert.equal(await browser.evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
    await browser.screenshot(`conversion-mobile-${language}`);
  }
  assert.deepEqual(browser.errors, []);
  console.log("PASS Stage A: original card geometry/colors/radius, native React, Markdown, reveal/skip and mobile en/fa/ps. Screenshots in artifacts/ai-chat.");
} finally { await browser.close(); }
